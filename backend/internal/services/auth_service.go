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
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		config:   cfg,
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

// Config returns the service config (used by handlers for token generation).
func (s *AuthService) Config() *config.Config {
	return s.config
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

// GeneratePasswordResetToken generates a token for password reset and stores it in Redis.
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

	// Store token in Redis with 15-minute TTL
	if s.redisClient != nil {
		key := fmt.Sprintf("reset:%s", token)
		if err := s.redisClient.Set(ctx, key, email, 15*time.Minute).Err(); err != nil {
			return "", fmt.Errorf("failed to store reset token: %w", err)
		}
	}

	return token, nil
}

// ResetPassword resets password using a Redis-backed reset token.
func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	if s.redisClient == nil {
		return errors.New("password reset service unavailable")
	}

	// Retrieve and validate token from Redis
	key := fmt.Sprintf("reset:%s", token)
	email, err := s.redisClient.Get(ctx, key).Result()
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return errors.New("user not found")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Update password in DB
	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	// Delete the used token from Redis (one-time use)
	s.redisClient.Del(ctx, key)

	return nil
}

// GetUserByEmail gets user by email
func (s *AuthService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

// UpdateProfile updates a user's name, avatar_url, bio, skills, and resume_url.
func (s *AuthService) UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		user.Name = req.Name
	}
	user.AvatarURL = req.AvatarURL
	user.Bio = req.Bio
	user.Skills = req.Skills
	user.ResumeURL = req.ResumeURL
	
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserProfile gets a user's full profile including stats and history.
func (s *AuthService) GetUserProfile(ctx context.Context, userID string) (*models.UserProfile, error) {
	return s.userRepo.GetProfile(ctx, userID)
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
