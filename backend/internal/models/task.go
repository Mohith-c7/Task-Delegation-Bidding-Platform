package models

import "time"

type TaskStatus string
type TaskPriority string

const (
	StatusOpen       TaskStatus = "open"
	StatusAssigned   TaskStatus = "assigned"
	StatusInProgress TaskStatus = "in_progress"
	StatusSubmitted  TaskStatus = "submitted_for_review"
	StatusRevision   TaskStatus = "revision_requested"
	StatusDisputed   TaskStatus = "disputed"
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
	Questions   []string     `json:"questions"`
	Deadline    time.Time    `json:"deadline"`
	Priority    TaskPriority `json:"priority"`
	Status      TaskStatus   `json:"status"`
	OrgID       string       `json:"org_id,omitempty"`
	OwnerID     string       `json:"owner_id"`
	OwnerName   string       `json:"owner_name"`
	AssignedTo  *string      `json:"assigned_to"`
	Rating      *int         `json:"rating,omitempty"`
	Points      *int         `json:"points,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string       `json:"title" binding:"required,min=3,max=255"`
	Description string       `json:"description" binding:"required,min=10"`
	Skills      []string     `json:"skills" binding:"omitempty"`
	Questions   []string     `json:"questions" binding:"omitempty"`
	Deadline    time.Time    `json:"deadline" binding:"required"`
	Priority    TaskPriority `json:"priority" binding:"required,oneof=low medium high critical"`
	OrgID       string       `json:"org_id"`
}

type UpdateTaskRequest struct {
	Title       string       `json:"title" binding:"omitempty,min=3,max=255"`
	Description string       `json:"description" binding:"omitempty,min=10"`
	Skills      []string     `json:"skills" binding:"omitempty,min=1"`
	Questions   []string     `json:"questions" binding:"omitempty"`
	Deadline    time.Time    `json:"deadline" binding:"omitempty"`
	Priority    TaskPriority `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	Status      TaskStatus   `json:"status" binding:"omitempty,oneof=open assigned in_progress submitted_for_review revision_requested disputed completed closed"`
}

// TaskDetail is the full task view including activity, comments, and checklist.
type TaskDetail struct {
	Task
	Activity   []ActivityEntry `json:"activity"`
	Comments   []Comment       `json:"comments"`
	Checklist  []ChecklistItem `json:"checklist"`
	Submission *TaskSubmission `json:"submission,omitempty"`
}

// Allowed status transitions
var AllowedTransitions = map[TaskStatus][]TaskStatus{
	StatusOpen:       {StatusAssigned, StatusClosed},
	StatusAssigned:   {StatusInProgress},
	StatusInProgress: {StatusSubmitted, StatusCompleted},
	StatusSubmitted:  {StatusCompleted, StatusRevision, StatusDisputed},
	StatusRevision:   {StatusSubmitted, StatusDisputed},
	StatusDisputed:   {StatusRevision, StatusClosed},
	StatusCompleted:  {StatusClosed},
}

type RateTaskRequest struct {
	Rating int `json:"rating" binding:"required,min=1,max=5"`
	Points int `json:"points" binding:"required,min=0,max=10000"`
}

type TaskSubmission struct {
	ID            string    `json:"id"`
	TaskID        string    `json:"task_id"`
	SubmittedBy   string    `json:"submitted_by"`
	Notes         string    `json:"notes"`
	PRURL         string    `json:"pr_url,omitempty"`
	DemoURL       string    `json:"demo_url,omitempty"`
	AttachmentURL string    `json:"attachment_url,omitempty"`
	Status        string    `json:"status"`
	ReviewReason  string    `json:"review_reason,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type SubmitCompletionRequest struct {
	Notes         string `json:"notes" binding:"required,min=5,max=2000"`
	PRURL         string `json:"pr_url" binding:"omitempty,url"`
	DemoURL       string `json:"demo_url" binding:"omitempty,url"`
	AttachmentURL string `json:"attachment_url" binding:"omitempty,url"`
}
