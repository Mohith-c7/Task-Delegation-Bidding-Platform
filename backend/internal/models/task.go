package models

import "time"

type Priority string
type TaskStatus string

const (
	PriorityLow      Priority = "low"
	PriorityMedium   Priority = "medium"
	PriorityHigh     Priority = "high"
	PriorityCritical Priority = "critical"
)

const (
	TaskStatusOpen       TaskStatus = "open"
	TaskStatusBidding    TaskStatus = "bidding"
	TaskStatusAssigned   TaskStatus = "assigned"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusClosed     TaskStatus = "closed"
)

type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title" binding:"required"`
	Description string     `json:"description" binding:"required"`
	Skills      []string   `json:"skills" binding:"required"`
	Deadline    time.Time  `json:"deadline" binding:"required"`
	Priority    Priority   `json:"priority" binding:"required"`
	Status      TaskStatus `json:"status"`
	OwnerID     string     `json:"owner_id"`
	AssignedTo  *string    `json:"assigned_to"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Skills      []string  `json:"skills" binding:"required"`
	Deadline    time.Time `json:"deadline" binding:"required"`
	Priority    Priority  `json:"priority" binding:"required"`
}
