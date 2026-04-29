package handlers

import (
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

// Register godoc
// @Summary Register user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Register request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/register [post]
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

// Login godoc
// @Summary Login user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login request"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login [post]
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

// GetMe godoc
// @Summary Get current user
// @Tags users
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/me [get]
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _ := c.Get("user_id")

	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(string))
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
// @Summary Start password reset
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Forgot password request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/forgot-password [post]
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
// @Summary Complete password reset
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Reset password request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/reset-password [post]
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
// @Summary Update current user profile
// @Tags users
// @Accept json
// @Produce json
// @Param request body models.UpdateProfileRequest true "Update profile request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/me [put]
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
// @Summary Change password
// @Tags users
// @Accept json
// @Produce json
// @Param request body models.ChangePasswordRequest true "Change password request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/me/password [put]
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
// @Summary Update notification preferences
// @Tags users
// @Accept json
// @Produce json
// @Param request body models.NotificationPrefsRequest true "Notification preferences"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/me/notifications [put]
func (h *AuthHandler) UpdateNotificationPrefs(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.NotificationPrefsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	if err := h.authService.UpdateNotificationPrefs(c.Request.Context(), userID.(string), &req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Notification preferences updated", req)
}

// Logout invalidates the user's tokens.
// @Summary Logout current user
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, _ := c.Get("user_id")
	_ = h.authService.InvalidateUserTokens(c.Request.Context(), userID.(string))
	utils.SuccessResponse(c, 200, "Logged out successfully", nil)
}

// RefreshToken issues a new access token from a valid refresh token.
// @Summary Refresh access token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Refresh token request"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/refresh [post]
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

// GetMyProfile returns the complete profile of the authenticated user.
// @Summary Get full private profile
// @Tags users
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/me/profile [get]
func (h *AuthHandler) GetMyProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	profile, err := h.authService.GetUserProfile(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 404, "Profile not found")
		return
	}

	utils.SuccessResponse(c, 200, "Profile retrieved successfully", profile)
}

// GetPublicProfile returns the public profile of a user.
// @Summary Get public user profile
// @Tags users
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/{id}/profile [get]
func (h *AuthHandler) GetPublicProfile(c *gin.Context) {
	userID := c.Param("id")

	profile, err := h.authService.GetPublicUserProfile(c.Request.Context(), userID)
	if err != nil {
		utils.ErrorResponse(c, 404, "Profile not found")
		return
	}

	utils.SuccessResponse(c, 200, "Public profile retrieved successfully", profile)
}

// GetLeaderboard returns the top 20 users by total points.
// @Summary Get leaderboard
// @Tags users
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /leaderboard [get]
func (h *AuthHandler) GetLeaderboard(c *gin.Context) {
	leaderboard, err := h.authService.GetLeaderboard(c.Request.Context())
	if err != nil {
		utils.ErrorResponse(c, 500, "Failed to retrieve leaderboard")
		return
	}

	utils.SuccessResponse(c, 200, "Leaderboard retrieved successfully", leaderboard)
}

// GetUserReviews returns public reviews received by a user.
// @Summary Get user reviews
// @Tags users
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /users/{id}/reviews [get]
func (h *AuthHandler) GetUserReviews(c *gin.Context) {
	userID := c.Param("id")

	reviews, err := h.authService.GetUserReviews(c.Request.Context(), userID)
	if err != nil {
		utils.ErrorResponse(c, 500, "Failed to retrieve reviews")
		return
	}

	utils.SuccessResponse(c, 200, "Reviews retrieved successfully", reviews)
}
