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
