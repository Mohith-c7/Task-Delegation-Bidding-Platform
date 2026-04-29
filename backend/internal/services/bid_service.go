package services

import (
	"context"
	"errors"
	"time"

	"github.com/yourusername/task-delegation-platform/internal/models"
)

type BidService struct {
	bidRepo      bidRepository
	taskRepo     bidTaskRepository
	userRepo     bidUserRepository
	notifService *NotificationService
	emailService *EmailService
}

type bidRepository interface {
	Create(ctx context.Context, bid *models.Bid) error
	GetByTaskID(ctx context.Context, taskID string) ([]*models.BidWithDetails, error)
	GetByBidderID(ctx context.Context, bidderID string) ([]*models.Bid, error)
	GetByID(ctx context.Context, id string) (*models.Bid, error)
	UpdateStatus(ctx context.Context, id string, status models.BidStatus, approvedBy *string) error
	RejectOtherPendingBids(ctx context.Context, taskID, approvedBidID, approvedBy string) error
	BidExists(ctx context.Context, taskID, bidderID string) (bool, error)
}

type bidTaskRepository interface {
	GetByID(ctx context.Context, id string) (*models.Task, error)
	Update(ctx context.Context, id string, task *models.Task) error
	AppendActivity(ctx context.Context, a *models.ActivityEntry) error
}

type bidUserRepository interface {
	GetByID(ctx context.Context, id string) (*models.User, error)
}

func NewBidService(bidRepo bidRepository, taskRepo bidTaskRepository, userRepo bidUserRepository) *BidService {
	return &BidService{
		bidRepo:  bidRepo,
		taskRepo: taskRepo,
		userRepo: userRepo,
	}
}

func (s *BidService) SetEmailService(es *EmailService) {
	s.emailService = es
}

func (s *BidService) SetNotificationService(ns *NotificationService) {
	s.notifService = ns
}

func (s *BidService) CreateBid(ctx context.Context, taskID string, req *models.CreateBidRequest, bidderID string) (*models.Bid, error) {
	// Check if task exists
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Check if task is open for bidding
	if task.Status != models.StatusOpen {
		return nil, errors.New("task is not open for bidding")
	}

	// Check if user is trying to bid on their own task
	if task.OwnerID == bidderID {
		return nil, errors.New("you cannot bid on your own task")
	}

	// Check if user already placed a bid
	exists, err := s.bidRepo.BidExists(ctx, taskID, bidderID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("you have already placed a bid on this task")
	}

	// Validate estimated completion is in the future
	if !req.EstimatedCompletion.After(time.Now()) {
		return nil, errors.New("estimated completion date must be in the future")
	}

	// Validate estimated completion does not exceed the task deadline
	if req.EstimatedCompletion.After(task.Deadline) {
		return nil, errors.New("estimated completion date cannot be after the task deadline")
	}

	// Create bid
	bid := &models.Bid{
		TaskID:              taskID,
		BidderID:            bidderID,
		Message:             req.Message,
		EstimatedCompletion: req.EstimatedCompletion,
		Status:              models.BidPending,
		Answers:             req.Answers,
	}

	if err := s.bidRepo.Create(ctx, bid); err != nil {
		return nil, err
	}

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &bidderID,
		EventType: models.ActivityBidPlaced,
	})

	// Notify task owner
	if s.notifService != nil {
		taskTitle := task.Title
		_ = s.notifService.Publish(ctx, &models.Notification{
			UserID:       task.OwnerID,
			Type:         models.NotifBidPlaced,
			Title:        "New bid on your task",
			Body:         "Someone placed a bid on: " + taskTitle,
			ResourceType: strPtr("task"),
			ResourceID:   &taskID,
		})
	}

	// Email notification to task owner
	if s.emailService != nil {
		owner, err := s.userRepo.GetByID(ctx, task.OwnerID)
		if err == nil {
			bidder, err := s.userRepo.GetByID(ctx, bidderID)
			if err == nil {
				go s.emailService.SendBidNotification(owner.Email, owner.Name, bidder.Name, task.Title)
			}
		}
	}

	return bid, nil
}

func (s *BidService) GetTaskBids(ctx context.Context, taskID string) ([]*models.BidWithDetails, error) {
	return s.bidRepo.GetByTaskID(ctx, taskID)
}

func (s *BidService) GetMyBids(ctx context.Context, bidderID string) ([]*models.Bid, error) {
	return s.bidRepo.GetByBidderID(ctx, bidderID)
}

func (s *BidService) ApproveBid(ctx context.Context, bidID string, approverID string) error {
	// Get bid
	bid, err := s.bidRepo.GetByID(ctx, bidID)
	if err != nil {
		return err
	}

	// Check if bid is pending
	if bid.Status != models.BidPending {
		return errors.New("bid is not pending")
	}

	// Get task
	task, err := s.taskRepo.GetByID(ctx, bid.TaskID)
	if err != nil {
		return err
	}

	// Check if approver is the task owner
	if task.OwnerID != approverID {
		return errors.New("only task owner can approve bids")
	}

	// Update bid status
	if err := s.bidRepo.UpdateStatus(ctx, bidID, models.BidApproved, &approverID); err != nil {
		return err
	}

	// Reject any remaining pending bids for this task.
	if err := s.bidRepo.RejectOtherPendingBids(ctx, bid.TaskID, bidID, approverID); err != nil {
		return err
	}

	// Update task status and assign to bidder
	oldStatus := string(task.Status)
	oldAssignee := ""
	if task.AssignedTo != nil {
		oldAssignee = *task.AssignedTo
	}
	task.Status = models.StatusAssigned
	task.AssignedTo = &bid.BidderID
	if err := s.taskRepo.Update(ctx, task.ID, task); err != nil {
		return err
	}

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    task.ID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &approverID,
		EventType: models.ActivityBidApproved,
	})
	statusField := "status"
	newStatus := string(task.Status)
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    task.ID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &approverID,
		EventType: models.ActivityStatusChanged,
		FieldName: &statusField,
		OldValue:  &oldStatus,
		NewValue:  &newStatus,
	})
	assigneeField := "assigned_to"
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    task.ID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &approverID,
		EventType: models.ActivityFieldUpdated,
		FieldName: &assigneeField,
		OldValue:  &oldAssignee,
		NewValue:  &bid.BidderID,
	})

	// Notify bidder
	if s.notifService != nil {
		_ = s.notifService.Publish(ctx, &models.Notification{
			UserID:       bid.BidderID,
			Type:         models.NotifBidApproved,
			Title:        "Your bid was approved",
			Body:         "Your bid on \"" + task.Title + "\" was approved",
			ResourceType: strPtr("task"),
			ResourceID:   &task.ID,
		})
	}

	// Email notification to bidder
	if s.emailService != nil {
		bidder, err := s.userRepo.GetByID(ctx, bid.BidderID)
		if err == nil {
			go s.emailService.SendBidApprovedNotification(bidder.Email, bidder.Name, task.Title)
		}
	}

	return nil
}

func (s *BidService) RejectBid(ctx context.Context, bidID string, approverID string) error {
	// Get bid
	bid, err := s.bidRepo.GetByID(ctx, bidID)
	if err != nil {
		return err
	}

	// Check if bid is pending
	if bid.Status != models.BidPending {
		return errors.New("bid is not pending")
	}

	// Get task
	task, err := s.taskRepo.GetByID(ctx, bid.TaskID)
	if err != nil {
		return err
	}

	// Check if approver is the task owner
	if task.OwnerID != approverID {
		return errors.New("only task owner can reject bids")
	}

	// Update bid status
	if err := s.bidRepo.UpdateStatus(ctx, bidID, models.BidRejected, &approverID); err != nil {
		return err
	}

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    task.ID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &approverID,
		EventType: models.ActivityBidRejected,
	})

	// Notify bidder
	if s.notifService != nil {
		_ = s.notifService.Publish(ctx, &models.Notification{
			UserID:       bid.BidderID,
			Type:         models.NotifBidRejected,
			Title:        "Bid Update",
			Body:         "Your bid on \"" + task.Title + "\" was not selected",
			ResourceType: strPtr("task"),
			ResourceID:   &task.ID,
		})
	}

	// Email notification to bidder
	if s.emailService != nil {
		bidder, err := s.userRepo.GetByID(ctx, bid.BidderID)
		if err == nil {
			go s.emailService.SendBidRejectedNotification(bidder.Email, bidder.Name, task.Title)
		}
	}

	return nil
}

func strPtr(s string) *string { return &s }
