package services

import (
	"context"
	"errors"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type TaskService struct {
	taskRepo *repository.TaskRepository
}

func NewTaskService(taskRepo *repository.TaskRepository) *TaskService {
	return &TaskService{taskRepo: taskRepo}
}

func (s *TaskService) CreateTask(ctx context.Context, req *models.CreateTaskRequest, ownerID string) (*models.Task, error) {
	task := &models.Task{
		Title:       req.Title,
		Description: req.Description,
		Skills:      req.Skills,
		Deadline:    req.Deadline,
		Priority:    req.Priority,
		Status:      models.StatusOpen,
		OwnerID:     ownerID,
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
