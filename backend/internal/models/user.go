package models

import (
	"time"
)

type User struct {
	ID            string     `json:"id"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"` // Never send password hash in JSON
	Bio           string     `json:"bio,omitempty"`
	AvatarURL     string     `json:"avatar_url,omitempty"`
	Skills        []string   `json:"skills"`
	ResumeURL     string     `json:"resume_url,omitempty"`
	EmailVerified bool       `json:"email_verified"`
	VerifiedAt    *time.Time `json:"verified_at,omitempty"`
	TotalPoints   int        `json:"total_points"`
	RatingSum     int        `json:"rating_sum"`
	RatingCount   int        `json:"rating_count"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type UserProfile struct {
	User
	AvgRating           float64           `json:"avg_rating"`
	TotalTasksPosted    int               `json:"total_tasks_posted"`
	TotalTasksCompleted int               `json:"total_tasks_completed"`
	TotalBidsPlaced     int               `json:"total_bids_placed"`
	TotalBidsWon        int               `json:"total_bids_won"`
	SuccessRate         float64           `json:"success_rate"`
	TaskHistory         []TaskHistoryItem `json:"task_history"`
	BidHistory          []BidHistoryItem  `json:"bid_history"`
}

type TaskHistoryItem struct {
	ID         string       `json:"id"`
	Title      string       `json:"title"`
	Status     string       `json:"status"`
	Priority   string       `json:"priority"`
	Deadline   time.Time    `json:"deadline"`
	CreatedAt  time.Time    `json:"created_at"`
	AssignedTo *string      `json:"assigned_to"`
	Rating     *int         `json:"rating"`
	Points     *int         `json:"points"`
}

type BidHistoryItem struct {
	BidID               string    `json:"bid_id"`
	TaskID              string    `json:"task_id"`
	TaskTitle           string    `json:"task_title"`
	TaskStatus          string    `json:"task_status"`
	TaskDeadline        time.Time `json:"task_deadline"`
	BidStatus           string    `json:"bid_status"`
	EstimatedCompletion time.Time `json:"estimated_completion"`
	CreatedAt           time.Time `json:"created_at"`
}

type LeaderboardUser struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	AvatarURL   string   `json:"avatar_url"`
	TotalPoints int      `json:"total_points"`
	AvgRating   float64  `json:"avg_rating"`
	TasksDone   int      `json:"tasks_done"`
	Skills      []string `json:"skills"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=255"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type UpdateProfileRequest struct {
	Name      string   `json:"name" binding:"omitempty,min=2,max=255"`
	AvatarURL string   `json:"avatar_url" binding:"omitempty"`
	Bio       string   `json:"bio" binding:"omitempty,max=500"`
	Skills    []string `json:"skills"`
	ResumeURL string   `json:"resume_url" binding:"omitempty"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}

type NotificationPrefsRequest struct {
	BidPlaced    bool `json:"bid_placed"`
	BidApproved  bool `json:"bid_approved"`
	BidRejected  bool `json:"bid_rejected"`
	TaskAssigned bool `json:"task_assigned"`
	TaskComment  bool `json:"task_comment"`
	Deadline     bool `json:"deadline"`
}
