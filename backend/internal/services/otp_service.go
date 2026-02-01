package services

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

const (
	OTPLength     = 6
	OTPExpiry     = 5 * time.Minute
	MaxAttempts   = 3
	MaxResends    = 3
	ResendWindow  = 1 * time.Hour
)

type OTPService struct {
	redis        *redis.Client
	emailService *EmailService
}

func NewOTPService(redisClient *redis.Client, emailService *EmailService) *OTPService {
	return &OTPService{
		redis:        redisClient,
		emailService: emailService,
	}
}

// GenerateOTP generates a 6-digit OTP
func (s *OTPService) GenerateOTP() (string, error) {
	const digits = "0123456789"
	otp := make([]byte, OTPLength)
	
	for i := range otp {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[num.Int64()]
	}
	
	return string(otp), nil
}

// SendOTP generates and sends OTP to email
func (s *OTPService) SendOTP(ctx context.Context, email, name, purpose string) error {
	// Check resend limit
	resendKey := fmt.Sprintf("otp:resend:%s:%s", email, purpose)
	resendCount, err := s.redis.Get(ctx, resendKey).Int()
	if err != nil && err != redis.Nil {
		return err
	}
	
	if resendCount >= MaxResends {
		return errors.New("maximum resend limit reached, please try again later")
	}

	// Generate OTP
	code, err := s.GenerateOTP()
	if err != nil {
		return fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Create OTP object
	otp := &models.OTP{
		Code:      code,
		Email:     email,
		Purpose:   purpose,
		Attempts:  0,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(OTPExpiry),
	}

	// Store in Redis
	otpKey := fmt.Sprintf("otp:%s:%s", email, purpose)
	otpData, err := json.Marshal(otp)
	if err != nil {
		return fmt.Errorf("failed to marshal OTP: %w", err)
	}

	err = s.redis.Set(ctx, otpKey, otpData, OTPExpiry).Err()
	if err != nil {
		return fmt.Errorf("failed to store OTP: %w", err)
	}

	// Increment resend counter
	if resendCount == 0 {
		s.redis.Set(ctx, resendKey, 1, ResendWindow)
	} else {
		s.redis.Incr(ctx, resendKey)
	}

	// Send email
	err = s.emailService.SendOTP(email, name, code, purpose)
	if err != nil {
		// Delete OTP if email fails
		s.redis.Del(ctx, otpKey)
		return fmt.Errorf("failed to send OTP email: %w", err)
	}

	return nil
}

// VerifyOTP verifies the OTP code
func (s *OTPService) VerifyOTP(ctx context.Context, email, code, purpose string) (bool, error) {
	otpKey := fmt.Sprintf("otp:%s:%s", email, purpose)
	
	// Get OTP from Redis
	otpData, err := s.redis.Get(ctx, otpKey).Result()
	if err == redis.Nil {
		return false, errors.New("OTP not found or expired")
	}
	if err != nil {
		return false, fmt.Errorf("failed to get OTP: %w", err)
	}

	// Unmarshal OTP
	var otp models.OTP
	err = json.Unmarshal([]byte(otpData), &otp)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal OTP: %w", err)
	}

	// Check if expired
	if time.Now().After(otp.ExpiresAt) {
		s.redis.Del(ctx, otpKey)
		return false, errors.New("OTP has expired")
	}

	// Check attempts
	if otp.Attempts >= MaxAttempts {
		s.redis.Del(ctx, otpKey)
		return false, errors.New("maximum verification attempts exceeded")
	}

	// Verify code
	if otp.Code != code {
		// Increment attempts
		otp.Attempts++
		otpData, _ := json.Marshal(otp)
		s.redis.Set(ctx, otpKey, otpData, time.Until(otp.ExpiresAt))
		
		remainingAttempts := MaxAttempts - otp.Attempts
		if remainingAttempts > 0 {
			return false, fmt.Errorf("invalid OTP code, %d attempts remaining", remainingAttempts)
		}
		return false, errors.New("invalid OTP code, maximum attempts exceeded")
	}

	// OTP is valid, delete it
	s.redis.Del(ctx, otpKey)
	
	// Clear resend counter
	resendKey := fmt.Sprintf("otp:resend:%s:%s", email, purpose)
	s.redis.Del(ctx, resendKey)

	return true, nil
}

// ResendOTP resends OTP
func (s *OTPService) ResendOTP(ctx context.Context, email, name, purpose string) error {
	// Delete existing OTP
	otpKey := fmt.Sprintf("otp:%s:%s", email, purpose)
	s.redis.Del(ctx, otpKey)
	
	// Send new OTP
	return s.SendOTP(ctx, email, name, purpose)
}

// CleanupExpiredOTPs removes expired OTPs (can be called periodically)
func (s *OTPService) CleanupExpiredOTPs(ctx context.Context) error {
	// Redis automatically handles expiry with TTL
	// This is just a placeholder for any additional cleanup logic
	return nil
}
