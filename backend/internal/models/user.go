package models

import (
	"time"
)

type User struct {
	ID            string     `json:"id"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"` // Never send password hash in JSON
	EmailVerified bool       `json:"email_verified"`
	VerifiedAt    *time.Time `json:"verified_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
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
	AvatarURL string   `json:"avatar_url" binding:"omitempty,url"`
	Skills    []string `json:"skills"`
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
