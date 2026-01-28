package services

import (
	"context"
	"errors"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type BidService struct {
	bidRepo  *repository.BidRepository
	taskRepo *repository.TaskRepository
}

func NewBidService(bidRepo *repository.BidRepository, taskRepo *repository.TaskRepository) *BidService {
	return &BidService{
		bidRepo:  bidRepo,
		taskRepo: taskRepo,
	}
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
	}

	if err := s.bidRepo.Create(ctx, bid); err != nil {
		return nil, err
	}

	return bid, nil
}

func (s *BidService) GetTaskBids(ctx context.Context, taskID string) ([]*models.BidWithDetails, error) {
	return s.bidRepo.GetByTaskID(ctx, taskID)
}

func (s *BidService) GetMyBids(ctx context.Context, bidderID string) ([]*models.Bid, error) {
	return s.bidRepo.GetByBidderID(ctx, bidderID)
}

func (s *BidService) ApproveBid(ctx context.Context, bidID string, managerID string) error {
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

	// Check if manager is the task owner
	if task.OwnerID != managerID {
		return errors.New("only task owner can approve bids")
	}

	// Update bid status
	if err := s.bidRepo.UpdateStatus(ctx, bidID, models.BidApproved, &managerID); err != nil {
		return err
	}

	// Update task status and assign to bidder
	task.Status = models.StatusAssigned
	task.AssignedTo = &bid.BidderID
	if err := s.taskRepo.Update(ctx, task.ID, task); err != nil {
		return err
	}

	return nil
}

func (s *BidService) RejectBid(ctx context.Context, bidID string, managerID string) error {
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

	// Check if manager is the task owner
	if task.OwnerID != managerID {
		return errors.New("only task owner can reject bids")
	}

	// Update bid status
	return s.bidRepo.UpdateStatus(ctx, bidID, models.BidRejected, &managerID)
}
