package services

import (
	"context"
	"errors"
	"strings"
	"time"

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
	CreateTaskSubmission(ctx context.Context, submission *models.TaskSubmission) error
	UpdateLatestSubmissionStatus(ctx context.Context, taskID, status, reason string) error
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
	// Validate deadline is in the future
	if !req.Deadline.After(time.Now()) {
		return nil, errors.New("deadline must be in the future")
	}

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

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    task.ID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &ownerID,
		EventType: models.ActivityCreated,
	})

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

	changes := make([]taskFieldChange, 0, 7)

	if req.Title != "" {
		changes = append(changes, taskFieldChange{"title", task.Title, req.Title})
		task.Title = req.Title
	}
	if req.Description != "" {
		changes = append(changes, taskFieldChange{"description", task.Description, req.Description})
		task.Description = req.Description
	}
	if len(req.Skills) > 0 {
		changes = append(changes, taskFieldChange{"skills", strings.Join(task.Skills, ", "), strings.Join(req.Skills, ", ")})
		task.Skills = req.Skills
	}
	if len(req.Questions) > 0 {
		changes = append(changes, taskFieldChange{"questions", strings.Join(task.Questions, " | "), strings.Join(req.Questions, " | ")})
		task.Questions = req.Questions
	}
	if !req.Deadline.IsZero() {
		// Deadline cannot be moved to the past
		if !req.Deadline.After(time.Now()) {
			return nil, errors.New("deadline must be in the future")
		}
		// Deadline cannot be changed once the task is no longer open
		if task.Status != models.StatusOpen {
			return nil, errors.New("cannot change deadline after task has been assigned")
		}
		changes = append(changes, taskFieldChange{"deadline", formatActivityTime(task.Deadline), formatActivityTime(req.Deadline)})
		task.Deadline = req.Deadline
	}
	if req.Priority != "" {
		changes = append(changes, taskFieldChange{"priority", string(task.Priority), string(req.Priority)})
		task.Priority = req.Priority
	}
	if req.Status != "" {
		changes = append(changes, taskFieldChange{"status", string(task.Status), string(req.Status)})
		task.Status = req.Status
	}

	if err := s.taskRepo.Update(ctx, id, task); err != nil {
		return nil, err
	}

	for _, change := range changes {
		if change.oldValue == change.newValue {
			continue
		}
		fieldName := change.fieldName
		oldValue := change.oldValue
		newValue := change.newValue
		_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
			TaskID:    id,
			OrgID:     optionalStringPtr(task.OrgID),
			ActorID:   &userID,
			EventType: models.ActivityFieldUpdated,
			FieldName: &fieldName,
			OldValue:  &oldValue,
			NewValue:  &newValue,
		})
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
func (s *TaskService) TransitionStatus(ctx context.Context, taskID, actorID string, newStatus models.TaskStatus, reason string) (*models.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	if newStatus == models.StatusRevision || newStatus == models.StatusDisputed {
		if strings.TrimSpace(reason) == "" {
			return nil, errors.New("reason is required for revision or dispute")
		}
	}
	if newStatus == models.StatusSubmitted {
		return nil, errors.New("assigned users must submit completion evidence")
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

	switch newStatus {
	case models.StatusCompleted:
		_ = s.taskRepo.UpdateLatestSubmissionStatus(ctx, taskID, "accepted", "")
	case models.StatusRevision:
		_ = s.taskRepo.UpdateLatestSubmissionStatus(ctx, taskID, "revision_requested", strings.TrimSpace(reason))
	case models.StatusDisputed:
		_ = s.taskRepo.UpdateLatestSubmissionStatus(ctx, taskID, "disputed", strings.TrimSpace(reason))
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
	if strings.TrimSpace(reason) != "" {
		fieldName := "review_reason"
		newValue := strings.TrimSpace(reason)
		eventType := models.ActivityRevisionRequested
		if newStatus == models.StatusDisputed {
			eventType = models.ActivityDisputeOpened
		}
		_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
			TaskID:    taskID,
			ActorID:   &actorID,
			EventType: eventType,
			FieldName: &fieldName,
			NewValue:  &newValue,
		})
	}

	return task, nil
}

func (s *TaskService) SubmitCompletion(ctx context.Context, taskID, actorID string, req *models.SubmitCompletionRequest) (*models.TaskSubmission, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if task.AssignedTo == nil || *task.AssignedTo != actorID {
		return nil, errors.New("only the assigned user can submit completion evidence")
	}
	if task.Status != models.StatusInProgress && task.Status != models.StatusRevision {
		return nil, errors.New("task must be in progress or revision requested before completion can be submitted")
	}

	submission := &models.TaskSubmission{
		TaskID:        taskID,
		SubmittedBy:   actorID,
		Notes:         strings.TrimSpace(req.Notes),
		PRURL:         strings.TrimSpace(req.PRURL),
		DemoURL:       strings.TrimSpace(req.DemoURL),
		AttachmentURL: strings.TrimSpace(req.AttachmentURL),
		Status:        "submitted",
	}
	if err := s.taskRepo.CreateTaskSubmission(ctx, submission); err != nil {
		return nil, err
	}

	oldStatus := string(task.Status)
	task.Status = models.StatusSubmitted
	if err := s.taskRepo.Update(ctx, taskID, task); err != nil {
		return nil, err
	}

	newStatus := string(task.Status)
	statusField := "status"
	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &actorID,
		EventType: models.ActivityCompletionSubmitted,
		FieldName: &statusField,
		OldValue:  &oldStatus,
		NewValue:  &newStatus,
	})

	return submission, nil
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
	_, err = s.taskRepo.CreateReview(ctx, taskID, ownerID, &models.CreateUserReviewRequest{
		Rating: rating,
		Points: points,
	})
	if err != nil {
		return err
	}

	_ = s.taskRepo.AppendActivity(ctx, &models.ActivityEntry{
		TaskID:    taskID,
		OrgID:     optionalStringPtr(task.OrgID),
		ActorID:   &ownerID,
		EventType: models.ActivityReviewSubmitted,
	})
	return nil
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

type taskFieldChange struct {
	fieldName string
	oldValue  string
	newValue  string
}

func optionalStringPtr(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return &value
}

func formatActivityTime(value time.Time) string {
	if value.IsZero() {
		return ""
	}
	return value.Format(time.RFC3339)
}
