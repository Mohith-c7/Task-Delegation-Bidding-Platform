package services

import (
	"context"
	"errors"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type BidService struct {
	bidRepo         *repository.BidRepository
	taskRepo        *repository.TaskRepository
	userRepo        *repository.UserRepository
	notifService    *NotificationService
	emailService    *EmailService
}

func NewBidService(bidRepo *repository.BidRepository, taskRepo *repository.TaskRepository, userRepo *repository.UserRepository) *BidService {
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

	// Update task status and assign to bidder
	task.Status = models.StatusAssigned
	task.AssignedTo = &bid.BidderID
	if err := s.taskRepo.Update(ctx, task.ID, task); err != nil {
		return err
	}

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
