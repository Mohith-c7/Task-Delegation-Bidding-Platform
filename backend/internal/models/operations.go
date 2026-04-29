package models

import "time"

type QueueBidItem struct {
	BidID               string    `json:"bid_id"`
	TaskID              string    `json:"task_id"`
	TaskTitle           string    `json:"task_title"`
	BidderID            string    `json:"bidder_id"`
	BidderName          string    `json:"bidder_name"`
	EstimatedCompletion time.Time `json:"estimated_completion"`
	CreatedAt           time.Time `json:"created_at"`
}

type QueueTaskItem struct {
	TaskID     string    `json:"task_id"`
	Title      string    `json:"title"`
	Priority   string    `json:"priority"`
	Status     string    `json:"status"`
	Deadline   time.Time `json:"deadline"`
	OwnerID    string    `json:"owner_id"`
	OwnerName  string    `json:"owner_name"`
	AssignedTo *string   `json:"assigned_to,omitempty"`
	BidCount   int       `json:"bid_count"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type ManagerQueue struct {
	PendingBids             []QueueBidItem  `json:"pending_bids"`
	CompletedAwaitingReview []QueueTaskItem `json:"completed_awaiting_review"`
	OverdueTasks            []QueueTaskItem `json:"overdue_tasks"`
	RevisionRequests        []QueueTaskItem `json:"revision_requests"`
	HighPriorityNoBids      []QueueTaskItem `json:"high_priority_no_bids"`
}

type WorkloadSummary struct {
	ActiveTasks       int             `json:"active_tasks"`
	OpenBids          int             `json:"open_bids"`
	CompletedWork     int             `json:"completed_work"`
	OverdueTasks      int             `json:"overdue_tasks"`
	UpcomingDeadlines []QueueTaskItem `json:"upcoming_deadlines"`
}
