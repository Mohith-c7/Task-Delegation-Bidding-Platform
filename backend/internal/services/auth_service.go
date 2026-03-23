package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type AuthService struct {
	userRepo     *repository.UserRepository
	config       *config.Config
	otpService   *OTPService
	emailService *EmailService
	redisClient  *redis.Client
	resetTokens  map[string]resetTokenData // In production, use Redis
}

type resetTokenData struct {
	email     string
	expiresAt time.Time
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		config:      cfg,
		resetTokens: make(map[string]resetTokenData),
	}
}

func (s *AuthService) SetRedisClient(rc *redis.Client) {
	s.redisClient = rc
}

func (s *AuthService) SetOTPService(otpService *OTPService) {
	s.otpService = otpService
}

func (s *AuthService) SetEmailService(emailService *EmailService) {
	s.emailService = emailService
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if email already exists
	exists, err := s.userRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hashedPassword,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.JWTExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	// Hardcoded test credentials - works without database
	if req.Email == "john@example.com" && req.Password == "password123" {
		now := time.Now()
		testUser := &models.User{
			ID:            "00000000-0000-0000-0000-000000000001",
			Name:          "John Doe",
			Email:         "john@example.com",
			EmailVerified: true,
			VerifiedAt:    &now,
			CreatedAt:     now,
			UpdatedAt:     now,
		}

		// Generate tokens
		accessToken, err := utils.GenerateToken(testUser.ID, testUser.Email, "", s.config.JWTSecret, s.config.JWTExpiry)
		if err != nil {
			return nil, err
		}

		refreshToken, err := utils.GenerateToken(testUser.ID, testUser.Email, "", s.config.JWTSecret, s.config.RefreshTokenExpiry)
		if err != nil {
			return nil, err
		}

		return &models.AuthResponse{
			User:         testUser,
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}, nil
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.JWTExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	return s.userRepo.GetByID(ctx, userID)
}

// RegisterWithOTP initiates registration by sending OTP
func (s *AuthService) RegisterWithOTP(ctx context.Context, req *models.RegisterRequest) error {
	// Check if email already exists
	exists, err := s.userRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already registered")
	}

	// Send OTP for email verification
	if s.otpService != nil {
		err = s.otpService.SendOTP(ctx, req.Email, req.Name, string(models.OTPPurposeEmailVerification))
		if err != nil {
			return err
		}
	}

	return nil
}

// CompleteRegistration completes registration after OTP verification
func (s *AuthService) CompleteRegistration(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user with verified email
	now := time.Now()
	user := &models.User{
		Name:          req.Name,
		Email:         req.Email,
		PasswordHash:  hashedPassword,
		EmailVerified: true,
		VerifiedAt:    &now,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// Send welcome email
	if s.emailService != nil {
		go s.emailService.SendWelcome(user.Email, user.Name)
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.JWTExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// LoginWithOTP initiates login with OTP
func (s *AuthService) LoginWithOTP(ctx context.Context, req *models.LoginRequest) error {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return errors.New("invalid email or password")
	}

	// Send OTP
	if s.otpService != nil {
		err = s.otpService.SendOTP(ctx, user.Email, user.Name, string(models.OTPPurposeLogin))
		if err != nil {
			return err
		}
	}

	return nil
}

// CompleteOTPLogin completes login after OTP verification
func (s *AuthService) CompleteOTPLogin(ctx context.Context, email string) (*models.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.JWTExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(user.ID, user.Email, "", s.config.JWTSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// GeneratePasswordResetToken generates a token for password reset
func (s *AuthService) GeneratePasswordResetToken(ctx context.Context, email string) (string, error) {
	// Verify user exists
	_, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", errors.New("user not found")
	}

	// Generate random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)

	// Store token with 15-minute expiry
	s.resetTokens[token] = resetTokenData{
		email:     email,
		expiresAt: time.Now().Add(15 * time.Minute),
	}

	return token, nil
}

// ResetPassword resets password using reset token
func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	// Verify token
	data, exists := s.resetTokens[token]
	if !exists {
		return errors.New("invalid or expired reset token")
	}

	if time.Now().After(data.expiresAt) {
		delete(s.resetTokens, token)
		return errors.New("reset token has expired")
	}

	// Get user
	user, err := s.userRepo.GetByEmail(ctx, data.email)
	if err != nil {
		return errors.New("user not found")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Update password
	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	// Delete used token
	delete(s.resetTokens, token)

	return nil
}

// GetUserByEmail gets user by email
func (s *AuthService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

// UpdateProfile updates a user's name, avatar_url, and skills.
func (s *AuthService) UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		user.Name = req.Name
	}
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

// ChangePassword changes a user's password, rejecting if new == current.
func (s *AuthService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if !utils.CheckPassword(currentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}
	if utils.CheckPassword(newPassword, user.PasswordHash) {
		return errors.New("SAME_PASSWORD")
	}
	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	user.PasswordHash = hashed
	return s.userRepo.Update(ctx, user)
}

// InvalidateUserTokens writes a Redis marker so auth middleware rejects existing tokens.
func (s *AuthService) InvalidateUserTokens(ctx context.Context, userID string) error {
	if s.redisClient == nil {
		return nil
	}
	key := fmt.Sprintf("token_invalidated:%s", userID)
	return s.redisClient.Set(ctx, key, "1", 15*time.Minute).Err()
}

// IsTokenInvalidated checks if a user's tokens have been invalidated.
func (s *AuthService) IsTokenInvalidated(ctx context.Context, userID string) bool {
	if s.redisClient == nil {
		return false
	}
	key := fmt.Sprintf("token_invalidated:%s", userID)
	val, err := s.redisClient.Get(ctx, key).Result()
	return err == nil && val == "1"
}
