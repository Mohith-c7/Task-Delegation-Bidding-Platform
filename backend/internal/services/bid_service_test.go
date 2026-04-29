package services

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/yourusername/task-delegation-platform/internal/models"
)

type mockBidRepo struct {
	bidExists bool
	bid       *models.Bid
	created   *models.Bid
	updated   bool
	rejected  bool
}

func (m *mockBidRepo) Create(_ context.Context, bid *models.Bid) error {
	m.created = bid
	bid.ID = "bid-1"
	return nil
}
func (m *mockBidRepo) GetByTaskID(_ context.Context, _ string) ([]*models.BidWithDetails, error) {
	return nil, nil
}
func (m *mockBidRepo) GetByBidderID(_ context.Context, _ string) ([]*models.Bid, error) {
	return nil, nil
}
func (m *mockBidRepo) GetByID(_ context.Context, _ string) (*models.Bid, error) {
	if m.bid == nil {
		return nil, errors.New("bid not found")
	}
	return m.bid, nil
}
func (m *mockBidRepo) UpdateStatus(_ context.Context, _ string, _ models.BidStatus, _ *string) error {
	m.updated = true
	return nil
}
func (m *mockBidRepo) RejectOtherPendingBids(_ context.Context, _, _, _ string) error {
	m.rejected = true
	return nil
}
func (m *mockBidRepo) BidExists(_ context.Context, _, _ string) (bool, error) {
	return m.bidExists, nil
}

type mockBidTaskRepo struct {
	task            *models.Task
	updatedTask     *models.Task
	appendCallCount int
}

func (m *mockBidTaskRepo) GetByID(_ context.Context, _ string) (*models.Task, error) {
	if m.task == nil {
		return nil, errors.New("task not found")
	}
	return m.task, nil
}
func (m *mockBidTaskRepo) Update(_ context.Context, _ string, task *models.Task) error {
	m.updatedTask = task
	return nil
}
func (m *mockBidTaskRepo) AppendActivity(_ context.Context, _ *models.ActivityEntry) error {
	m.appendCallCount++
	return nil
}

type mockBidUserRepo struct{}

func (m *mockBidUserRepo) GetByID(_ context.Context, id string) (*models.User, error) {
	return &models.User{ID: id, Name: "Test", Email: "test@example.com"}, nil
}
func (m *mockBidUserRepo) HasUnavailableWindow(_ context.Context, _ string, _, _ time.Time) (bool, error) {
	return false, nil
}

func TestCreateBid_CannotBidOwnTask(t *testing.T) {
	svc := NewBidService(
		&mockBidRepo{},
		&mockBidTaskRepo{task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusOpen}},
		&mockBidUserRepo{},
	)

	_, err := svc.CreateBid(context.Background(), "task-1", &models.CreateBidRequest{
		Message:             "msg",
		EstimatedCompletion: time.Now().Add(24 * time.Hour),
	}, "owner-1")
	if err == nil {
		t.Fatal("expected error when bidding own task")
	}
}

func TestCreateBid_TaskNotOpen(t *testing.T) {
	svc := NewBidService(
		&mockBidRepo{},
		&mockBidTaskRepo{task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusAssigned}},
		&mockBidUserRepo{},
	)

	_, err := svc.CreateBid(context.Background(), "task-1", &models.CreateBidRequest{
		Message:             "msg",
		EstimatedCompletion: time.Now().Add(24 * time.Hour),
	}, "bidder-1")
	if err == nil {
		t.Fatal("expected error when bidding on non-open task")
	}
}

func TestCreateBid_DuplicateBidPrevented(t *testing.T) {
	svc := NewBidService(
		&mockBidRepo{bidExists: true},
		&mockBidTaskRepo{task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusOpen}},
		&mockBidUserRepo{},
	)

	_, err := svc.CreateBid(context.Background(), "task-1", &models.CreateBidRequest{
		Message:             "msg",
		EstimatedCompletion: time.Now().Add(24 * time.Hour),
	}, "bidder-1")
	if err == nil {
		t.Fatal("expected error for duplicate bid")
	}
}

func TestApproveBid_OnlyOwnerCanApprove(t *testing.T) {
	svc := NewBidService(
		&mockBidRepo{bid: &models.Bid{ID: "bid-1", TaskID: "task-1", BidderID: "bidder-1", Status: models.BidPending}},
		&mockBidTaskRepo{task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusOpen}},
		&mockBidUserRepo{},
	)

	err := svc.ApproveBid(context.Background(), "bid-1", "not-owner")
	if err == nil {
		t.Fatal("expected error when non-owner approves bid")
	}
}

func TestApproveBid_TaskAutoAssigned(t *testing.T) {
	bidRepo := &mockBidRepo{bid: &models.Bid{ID: "bid-1", TaskID: "task-1", BidderID: "bidder-1", Status: models.BidPending}}
	taskRepo := &mockBidTaskRepo{task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusOpen}}
	svc := NewBidService(bidRepo, taskRepo, &mockBidUserRepo{})

	err := svc.ApproveBid(context.Background(), "bid-1", "owner-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if taskRepo.updatedTask == nil || taskRepo.updatedTask.Status != models.StatusAssigned || taskRepo.updatedTask.AssignedTo == nil {
		t.Fatal("expected task to be assigned on bid approval")
	}
	if *taskRepo.updatedTask.AssignedTo != "bidder-1" {
		t.Fatal("expected task assigned_to to match approved bidder")
	}
	if !bidRepo.rejected {
		t.Fatal("expected other pending bids to be rejected")
	}
	if taskRepo.appendCallCount == 0 {
		t.Fatal("expected bid approval activity to be recorded")
	}
}
