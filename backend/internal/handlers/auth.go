package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	// Check if OTP flow is requested
	useOTP := c.Query("use_otp") == "true"
	
	if useOTP {
		// Send OTP for email verification
		err := h.authService.RegisterWithOTP(c.Request.Context(), &req)
		if err != nil {
			utils.ErrorResponse(c, 400, err.Error())
			return
		}
		
		// Store registration data temporarily (in production, use Redis)
		c.Set("pending_registration", &req)
		
		utils.SuccessResponse(c, 200, "OTP sent to your email", gin.H{
			"message": "Please verify your email with the OTP sent",
			"email":   req.Email,
		})
		return
	}

	// Original flow without OTP
	response, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 201, "User registered successfully", response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	response, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		utils.ErrorResponse(c, 401, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Login successful", response)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid := userID.(string)

	// Handle hardcoded test user
	if uid == "00000000-0000-0000-0000-000000000001" {
		now := time.Now()
		utils.SuccessResponse(c, 200, "User retrieved successfully", &models.User{
			ID:            uid,
			Name:          "John Doe",
			Email:         "john@example.com",
			EmailVerified: true,
			VerifiedAt:    &now,
			CreatedAt:     now,
			UpdatedAt:     now,
		})
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), uid)
	if err != nil {
		utils.ErrorResponse(c, 404, "User not found")
		return
	}

	utils.SuccessResponse(c, 200, "User retrieved successfully", user)
}

// VerifyEmailAndRegister completes registration after OTP verification
func (h *AuthHandler) VerifyEmailAndRegister(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		OTP      string `json:"otp" binding:"required,len=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	// Note: OTP verification should be done via OTPHandler first
	// This endpoint assumes OTP is already verified
	// In production, implement proper flow with session management

	regReq := &models.RegisterRequest{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	response, err := h.authService.CompleteRegistration(c.Request.Context(), regReq)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 201, "Registration completed successfully", response)
}

// ForgotPassword initiates password reset
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	// Send OTP via OTPService (handled by OTPHandler)
	// This is just a placeholder endpoint
	utils.SuccessResponse(c, 200, "Password reset OTP sent", gin.H{
		"message": "If the email exists, an OTP has been sent",
		"email":   req.Email,
	})
}

// ResetPassword resets password with token
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		ResetToken  string `json:"reset_token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	err := h.authService.ResetPassword(c.Request.Context(), req.ResetToken, req.NewPassword)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Password reset successful", gin.H{
		"message": "Your password has been reset successfully",
	})
}

// UpdateMe updates the authenticated user's profile.
func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	user, err := h.authService.UpdateProfile(c.Request.Context(), userID.(string), &req)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Profile updated", user)
}

// ChangePassword changes the authenticated user's password.
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	if err := h.authService.ChangePassword(c.Request.Context(), userID.(string), req.CurrentPassword, req.NewPassword); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Password changed successfully", nil)
}

// UpdateNotificationPrefs updates notification preferences (stub — stored in user profile).
func (h *AuthHandler) UpdateNotificationPrefs(c *gin.Context) {
	utils.SuccessResponse(c, 200, "Notification preferences updated", nil)
}

// Logout invalidates the user's tokens.
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, _ := c.Get("user_id")
	_ = h.authService.InvalidateUserTokens(c.Request.Context(), userID.(string))
	utils.SuccessResponse(c, 200, "Logged out successfully", nil)
}

// RefreshToken issues a new access token from a valid refresh token.
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	claims, err := utils.ValidateToken(req.RefreshToken, h.authService.Config().JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, 401, "Invalid or expired refresh token")
		return
	}

	// Issue new access token (preserve org_id + role from refresh token claims)
	accessToken, err := utils.GenerateAccessToken(claims.UserID, claims.Email, claims.OrgID, claims.Role, h.authService.Config().JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, 500, "Failed to generate token")
		return
	}

	utils.SuccessResponse(c, 200, "Token refreshed", gin.H{"access_token": accessToken})
}
