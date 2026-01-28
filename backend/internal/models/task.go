package models

import "time"

type TaskStatus string
type TaskPriority string

const (
	StatusOpen       TaskStatus = "open"
	StatusAssigned   TaskStatus = "assigned"
	StatusInProgress TaskStatus = "in_progress"
	StatusCompleted  TaskStatus = "completed"
	StatusClosed     TaskStatus = "closed"
)

const (
	PriorityLow      TaskPriority = "low"
	PriorityMedium   TaskPriority = "medium"
	PriorityHigh     TaskPriority = "high"
	PriorityCritical TaskPriority = "critical"
)

type Task struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Skills      []string     `json:"skills"`
	Deadline    time.Time    `json:"deadline"`
	Priority    TaskPriority `json:"priority"`
	Status      TaskStatus   `json:"status"`
	OwnerID     string       `json:"owner_id"`
	AssignedTo  *string      `json:"assigned_to"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string       `json:"title" binding:"required,min=3,max=255"`
	Description string       `json:"description" binding:"required,min=10"`
	Skills      []string     `json:"skills" binding:"required,min=1"`
	Deadline    time.Time    `json:"deadline" binding:"required"`
	Priority    TaskPriority `json:"priority" binding:"required,oneof=low medium high critical"`
}

type UpdateTaskRequest struct {
	Title       string       `json:"title" binding:"omitempty,min=3,max=255"`
	Description string       `json:"description" binding:"omitempty,min=10"`
	Skills      []string     `json:"skills" binding:"omitempty,min=1"`
	Deadline    time.Time    `json:"deadline" binding:"omitempty"`
	Priority    TaskPriority `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	Status      TaskStatus   `json:"status" binding:"omitempty,oneof=open assigned in_progress completed closed"`
}
