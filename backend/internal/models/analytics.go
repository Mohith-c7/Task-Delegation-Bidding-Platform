package models

import "time"

// Analytics models for dashboard metrics

type AnalyticsSummary struct {
	TotalTasks          int                    `json:"total_tasks"`
	OpenTasks           int                    `json:"open_tasks"`
	CompletedTasks      int                    `json:"completed_tasks"`
	InProgressTasks     int                    `json:"in_progress_tasks"`
	TotalBids           int                    `json:"total_bids"`
	AverageCompletionTime float64             `json:"average_completion_time_hours"`
	TaskCompletionRate  float64                `json:"task_completion_rate"`
	TasksByPriority     map[string]int         `json:"tasks_by_priority"`
	TasksByStatus       map[string]int         `json:"tasks_by_status"`
}

type TaskTrend struct {
	Date      string `json:"date"`
	Created   int    `json:"created"`
	Completed int    `json:"completed"`
}

type BidderPerformance struct {
	BidderID            string    `json:"bidder_id"`
	BidderName          string    `json:"bidder_name"`
	BidderEmail         string    `json:"bidder_email"`
	TotalBids           int       `json:"total_bids"`
	ApprovedBids        int       `json:"approved_bids"`
	CompletedTasks      int       `json:"completed_tasks"`
	SuccessRate         float64   `json:"success_rate"`
	AverageCompletionTime float64 `json:"average_completion_time_hours"`
	OnTimeCompletions   int       `json:"on_time_completions"`
	LateCompletions     int       `json:"late_completions"`
}

type TaskOwnerStats struct {
	OwnerID         string  `json:"owner_id"`
	OwnerName       string  `json:"owner_name"`
	OwnerEmail      string  `json:"owner_email"`
	TasksPosted     int     `json:"tasks_posted"`
	TasksCompleted  int     `json:"tasks_completed"`
	AverageBidsPerTask float64 `json:"average_bids_per_task"`
}

type SkillDemand struct {
	Skill      string `json:"skill"`
	TaskCount  int    `json:"task_count"`
	BidCount   int    `json:"bid_count"`
}

type AnalyticsResponse struct {
	Summary           AnalyticsSummary      `json:"summary"`
	TaskTrends        []TaskTrend           `json:"task_trends"`
	TopBidders        []BidderPerformance   `json:"top_bidders"`
	TopTaskOwners     []TaskOwnerStats      `json:"top_task_owners"`
	SkillDemands      []SkillDemand         `json:"skill_demands"`
	GeneratedAt       time.Time             `json:"generated_at"`
}

type UserAnalytics struct {
	UserID              string    `json:"user_id"`
	TasksPosted         int       `json:"tasks_posted"`
	TasksCompleted      int       `json:"tasks_completed"`
	BidsPlaced          int       `json:"bids_placed"`
	BidsWon             int       `json:"bids_won"`
	SuccessRate         float64   `json:"success_rate"`
	AverageCompletionTime float64 `json:"average_completion_time_hours"`
	OnTimeRate          float64   `json:"on_time_rate"`
}
