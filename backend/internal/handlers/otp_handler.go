package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type OTPHandler struct {
	otpService  *services.OTPService
	authService *services.AuthService
}

func NewOTPHandler(otpService *services.OTPService, authService *services.AuthService) *OTPHandler {
	return &OTPHandler{
		otpService:  otpService,
		authService: authService,
	}
}

// SendOTP sends OTP to email
func (h *OTPHandler) SendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	// For email verification, we need the name from registration
	// For password reset, we fetch from database
	name := c.PostForm("name")
	if name == "" && req.Purpose == string(models.OTPPurposePasswordReset) {
		// Fetch user name from database
		user, err := h.authService.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil {
			utils.ErrorResponse(c, http.StatusNotFound, "Email not found")
			return
		}
		name = user.Name
	}

	if name == "" {
		name = "User" // Default fallback
	}

	err := h.otpService.SendOTP(c.Request.Context(), req.Email, name, req.Purpose)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "OTP sent successfully", gin.H{
		"email": req.Email,
	})
}

// VerifyOTP verifies OTP code
func (h *OTPHandler) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	valid, err := h.otpService.VerifyOTP(c.Request.Context(), req.Email, req.Code, req.Purpose)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if !valid {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid OTP code")
		return
	}

	response := models.VerifyOTPResponse{
		Valid:   true,
		Message: "OTP verified successfully",
	}

	// Handle different purposes
	switch req.Purpose {
	case string(models.OTPPurposePasswordReset):
		// Generate reset token
		resetToken, err := h.authService.GeneratePasswordResetToken(c.Request.Context(), req.Email)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate reset token")
			return
		}
		response.ResetToken = resetToken

	case string(models.OTPPurposeLogin):
		// Complete login and return tokens
		authResp, err := h.authService.CompleteOTPLogin(c.Request.Context(), req.Email)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Login failed")
			return
		}
		response.AccessToken = authResp.AccessToken
		response.RefreshToken = authResp.RefreshToken
		response.User = authResp.User
	}

	utils.SuccessResponse(c, http.StatusOK, "OTP verified successfully", response)
}

// ResendOTP resends OTP
func (h *OTPHandler) ResendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	name := c.PostForm("name")
	if name == "" && req.Purpose == string(models.OTPPurposePasswordReset) {
		user, err := h.authService.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil {
			utils.ErrorResponse(c, http.StatusNotFound, "Email not found")
			return
		}
		name = user.Name
	}

	if name == "" {
		name = "User"
	}

	err := h.otpService.ResendOTP(c.Request.Context(), req.Email, name, req.Purpose)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "OTP resent successfully", gin.H{
		"email": req.Email,
	})
}
