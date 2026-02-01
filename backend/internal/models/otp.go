package models

import "time"

type OTPPurpose string

const (
	OTPPurposeEmailVerification OTPPurpose = "email_verification"
	OTPPurposeLogin             OTPPurpose = "login"
	OTPPurposePasswordReset     OTPPurpose = "password_reset"
)

type OTP struct {
	Code      string    `json:"code"`
	Email     string    `json:"email"`
	Purpose   string    `json:"purpose"`
	Attempts  int       `json:"attempts"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type SendOTPRequest struct {
	Email   string `json:"email" binding:"required,email"`
	Purpose string `json:"purpose" binding:"required,oneof=email_verification login password_reset"`
}

type VerifyOTPRequest struct {
	Email   string `json:"email" binding:"required,email"`
	Code    string `json:"code" binding:"required,len=6"`
	Purpose string `json:"purpose" binding:"required,oneof=email_verification login password_reset"`
}

type VerifyOTPResponse struct {
	Valid        bool   `json:"valid"`
	Message      string `json:"message,omitempty"`
	ResetToken   string `json:"reset_token,omitempty"`
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
	User         *User  `json:"user,omitempty"`
}
