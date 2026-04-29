package services

import (
	"context"
	"errors"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type TaskService struct {
	taskRepo       taskRepository
	billingService *BillingService
}

type taskRepository interface {
	Create(ctx context.Context, task *models.Task) error
	GetByID(ctx context.Context, id string) (*models.Task, error)
	GetAll(ctx context.Context, status string) ([]*models.Task, error)
	GetByOwnerID(ctx context.Context, ownerID string) ([]*models.Task, error)
	Update(ctx context.Context, id string, task *models.Task) error
	Delete(ctx context.Context, id string) error
	AppendActivity(ctx context.Context, a *models.ActivityEntry) error
	CreateComment(ctx context.Context, c *models.Comment) error
	UpsertChecklist(ctx context.Context, taskID string, items []models.ChecklistItem) error
	GetTaskDetail(ctx context.Context, id string) (*models.TaskDetail, error)
	SearchTasks(ctx context.Context, p repository.TaskSearchParams) (*repository.TaskSearchResult, error)
	RateTask(ctx context.Context, taskID string, rating, points int) error
	CreateReview(ctx context.Context, taskID, reviewerID string, req *models.CreateUserReviewRequest) (*models.UserReview, error)
}

func NewTaskService(taskRepo taskRepository) *TaskService {
	return &TaskService{taskRepo: taskRepo}
}

func (s *TaskService) SetBillingService(bs *BillingService) {
	s.billingService = bs
}

func (s *TaskService) CreateTask(ctx context.Context, req *models.CreateTaskRequest, ownerID string) (*models.Task, error) {
	// Check task limit if org-scoped
	if s.billingService != nil && req.OrgID != "" {
		if err := s.billingService.CheckTaskLimit(ctx, req.OrgID); err != nil {
			return nil, err
		}
	}

	task := &models.Task{
		Title:       req.Title,
		Description: req.Description,
		Skills:      req.Skills,
		Questions:   req.Questions,
		Deadline:    req.Deadline,
		Priority:    req.Priority,
		Status:      models.StatusOpen,
		OwnerID:     ownerID,
		OrgID:       req.OrgID,
	}

	if err := s.taskRepo.Create(ctx, task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *TaskService) GetTask(ctx context.Context, id string) (*models.Task, error) {
	return s.taskRepo.GetByID(ctx, id)
}

func (s *TaskService) GetAllTasks(ctx context.Context, status string) ([]*models.Task, error) {
	return s.taskRepo.GetAll(ctx, status)
}

func (s *TaskService) GetMyTasks(ctx context.Context, ownerID string) ([]*models.Task, error) {
	return s.taskRepo.GetByOwnerID(ctx, ownerID)
}

func (s *TaskService) UpdateTask(ctx context.Context, id string, req *models.UpdateTaskRequest, userID string) (*models.Task, error) {
	// Get existing task
	task, err := s.taskRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if task.OwnerID != userID {
		return nil, errors.New("unauthorized: you can only update your own tasks")
	}

	// Update fields if provided
	if req.Title != "" {
		task.Title = req.Title
	}
	if req.Description != "" {
		task.Description = req.Description
	}
	if len(req.Skills) > 0 {
		task.Skills = req.Skills
	}
	if len(req.Questions) > 0 {
		task.Questions = req.Questions
	}
	if !req.Deadline.IsZero() {
		task.Deadline = req.Deadline
	}
	if req.Priority != "" {
		task.Priority = req.Priority
	}
	if req.Status != "" {
		task.Status = req.Status
	}

	if err := s.taskRepo.Update(ctx, id, task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *TaskService) DeleteTask(ctx context.Context, id string, userID string) error {
	// Get existing task
	task, err := s.taskRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Check ownership
	if task.OwnerID != userID {
		return errors.New("unauthorized: you can only delete your own tasks")
	}

	return s.taskRepo.Delete(ctx, id)
}

// TransitionStatus validates and applies a status transition.
func (s *TaskService) TransitionStatus(ctx context.Context, taskID, actorID string, newStatus models.TaskStatus) (*models.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	allowed := models.AllowedTransitions[task.Status]
	valid := false
	for _, s := range allowed {
		if s == newStatus {
			valid = true
			break
		}
	}
	if !valid {
		return nil, errors.New("INVALID_TRANSITION")
	}

	oldStatus := string(task.Status)
	task.Status = newStatus
	if err := s.taskRepo.Update(ctx, taskID, task); err != nil {
		return nil, err
	}

	// Append activity
	newStatusStr := string(newStatus)
	fieldName := "status"
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		ActorID:   &actorID,
		EventType: models.ActivityStatusChanged,
		FieldName: &fieldName,
		OldValue:  &oldStatus,
		NewValue:  &newStatusStr,
	})

	return task, nil
}

// AddComment adds a comment to a task.
func (s *TaskService) AddComment(ctx context.Context, taskID, authorID, body string) (*models.Comment, error) {
	comment := &models.Comment{
		TaskID:   taskID,
		AuthorID: authorID,
		Body:     body,
	}
	if err := s.taskRepo.CreateComment(ctx, comment); err != nil {
		return nil, err
	}

	// Append activity
	eventType := models.ActivityCommentAdded
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		ActorID:   &authorID,
		EventType: eventType,
	})

	return comment, nil
}

// UpdateChecklist replaces the checklist for a task.
func (s *TaskService) UpdateChecklist(ctx context.Context, taskID string, items []models.ChecklistItem) error {
	if err := s.taskRepo.UpsertChecklist(ctx, taskID, items); err != nil {
		return err
	}
	eventType := models.ActivityChecklistUpdated
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		EventType: eventType,
	})
	return nil
}

// GetTaskDetail returns full task detail with activity, comments, checklist.
func (s *TaskService) GetTaskDetail(ctx context.Context, id string) (*models.TaskDetail, error) {
	return s.taskRepo.GetTaskDetail(ctx, id)
}

// SearchTasks delegates to the repository search.
func (s *TaskService) SearchTasks(ctx context.Context, params repository.TaskSearchParams) (*repository.TaskSearchResult, error) {
	return s.taskRepo.SearchTasks(ctx, params)
}

// RateTask allows the task owner to rate the assignee and give points.
func (s *TaskService) RateTask(ctx context.Context, taskID, ownerID string, rating, points int) error {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return err
	}
	if task.OwnerID != ownerID {
		return errors.New("unauthorized: only the task owner can rate the task")
	}
	return s.taskRepo.RateTask(ctx, taskID, rating, points)
}

func (s *TaskService) CreateReview(ctx context.Context, taskID, ownerID string, req *models.CreateUserReviewRequest) (*models.UserReview, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if task.OwnerID != ownerID {
		return nil, errors.New("unauthorized: only the task owner can review completed work")
	}
	review, err := s.taskRepo.CreateReview(ctx, taskID, ownerID, req)
	if err != nil {
		return nil, err
	}

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		ActorID:   &ownerID,
		EventType: models.ActivityReviewSubmitted,
	})

	return review, nil
}
