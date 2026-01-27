package models

import "time"

type Role string

const (
	RoleTaskOwner Role = "task_owner"
	RoleBidder    Role = "bidder"
	RoleManager   Role = "manager"
	RoleAdmin     Role = "admin"
)

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name" binding:"required"`
	Email        string    `json:"email" binding:"required,email"`
	PasswordHash string    `json:"-"`
	Role         Role      `json:"role" binding:"required"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role" binding:"required"`
}
