package services

import (
	"context"
	"errors"
	"testing"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type mockTaskRepo struct {
	task            *models.Task
	updateCalled    bool
	appendCalled    bool
	rateTaskErr     error
	rateTaskCalled  bool
	createReviewErr error
}

func (m *mockTaskRepo) Create(_ context.Context, _ *models.Task) error { return nil }
func (m *mockTaskRepo) GetByID(_ context.Context, _ string) (*models.Task, error) {
	if m.task == nil {
		return nil, errors.New("not found")
	}
	return m.task, nil
}
func (m *mockTaskRepo) GetAll(_ context.Context, _ string) ([]*models.Task, error) { return nil, nil }
func (m *mockTaskRepo) GetByOwnerID(_ context.Context, _ string) ([]*models.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) Update(_ context.Context, _ string, task *models.Task) error {
	m.updateCalled = true
	m.task = task
	return nil
}
func (m *mockTaskRepo) Delete(_ context.Context, _ string) error { return nil }
func (m *mockTaskRepo) AppendActivity(_ context.Context, _ *models.ActivityEntry) error {
	m.appendCalled = true
	return nil
}
func (m *mockTaskRepo) CreateComment(_ context.Context, _ *models.Comment) error { return nil }
func (m *mockTaskRepo) UpsertChecklist(_ context.Context, _ string, _ []models.ChecklistItem) error {
	return nil
}
func (m *mockTaskRepo) GetTaskDetail(_ context.Context, _ string) (*models.TaskDetail, error) {
	return nil, nil
}
func (m *mockTaskRepo) SearchTasks(_ context.Context, _ repository.TaskSearchParams) (*repository.TaskSearchResult, error) {
	return nil, nil
}
func (m *mockTaskRepo) RateTask(_ context.Context, _ string, _, _ int) error {
	m.rateTaskCalled = true
	return m.rateTaskErr
}
func (m *mockTaskRepo) CreateReview(_ context.Context, taskID, reviewerID string, req *models.CreateUserReviewRequest) (*models.UserReview, error) {
	if m.createReviewErr != nil {
		return nil, m.createReviewErr
	}
	return &models.UserReview{
		ID:         "review-1",
		TaskID:     taskID,
		ReviewerID: reviewerID,
		Rating:     req.Rating,
		Points:     req.Points,
		Comment:    req.Comment,
	}, nil
}

func TestTransitionStatus_InvalidTransition(t *testing.T) {
	repo := &mockTaskRepo{task: &models.Task{ID: "task-1", Status: models.StatusOpen}}
	svc := NewTaskService(repo)

	_, err := svc.TransitionStatus(context.Background(), "task-1", "actor-1", models.StatusCompleted)
	if err == nil {
		t.Fatal("expected invalid transition error")
	}
}

func TestTransitionStatus_ValidTransition(t *testing.T) {
	repo := &mockTaskRepo{task: &models.Task{ID: "task-1", Status: models.StatusOpen}}
	svc := NewTaskService(repo)

	task, err := svc.TransitionStatus(context.Background(), "task-1", "actor-1", models.StatusAssigned)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if task.Status != models.StatusAssigned || !repo.updateCalled {
		t.Fatal("expected task status update on valid transition")
	}
}

func TestRateTask_OnlyCompletedTasks(t *testing.T) {
	repo := &mockTaskRepo{
		task:            &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusAssigned},
		createReviewErr: errors.New("only completed tasks can be reviewed"),
	}
	svc := NewTaskService(repo)

	err := svc.RateTask(context.Background(), "task-1", "owner-1", 5, 100)
	if err == nil {
		t.Fatal("expected error when rating non-completed task")
	}
}

func TestRateTask_CannotRateTwice(t *testing.T) {
	repo := &mockTaskRepo{
		task:            &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusCompleted},
		createReviewErr: errors.New("task already reviewed"),
	}
	svc := NewTaskService(repo)

	err := svc.RateTask(context.Background(), "task-1", "owner-1", 5, 100)
	if err == nil {
		t.Fatal("expected error when rating twice")
	}
}

func TestRateTask_UsesReviewSafePath(t *testing.T) {
	repo := &mockTaskRepo{
		task: &models.Task{ID: "task-1", OwnerID: "owner-1", Status: models.StatusCompleted},
	}
	svc := NewTaskService(repo)

	if err := svc.RateTask(context.Background(), "task-1", "owner-1", 5, 100); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.rateTaskCalled {
		t.Fatal("expected legacy rating endpoint to use CreateReview instead of direct RateTask")
	}
	if !repo.appendCalled {
		t.Fatal("expected review activity to be appended")
	}
}
