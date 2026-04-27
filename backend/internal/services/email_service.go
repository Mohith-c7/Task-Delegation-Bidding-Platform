package services

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"time"

	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type EmailService struct {
	config *config.SMTPConfig
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		config: cfg.GetSMTPConfig(),
	}
}

// SendEmail sends an email using SMTP
func (s *EmailService) SendEmail(to, subject, htmlBody string) error {
	// Setup authentication
	auth := smtp.PlainAuth("", s.config.Username, s.config.Password, s.config.Host)

	// Setup headers
	from := fmt.Sprintf("%s <%s>", s.config.FromName, s.config.From)
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Build message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	// Connect to SMTP server with TLS
	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)
	
	// Create TLS config
	tlsConfig := &tls.Config{
		ServerName: s.config.Host,
	}

	// Connect to server
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		// Try without TLS (for STARTTLS)
		return s.sendWithSTARTTLS(to, message, auth, addr)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, s.config.Host)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close()

	// Authenticate
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	// Set sender
	if err = client.Mail(s.config.From); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err = client.Rcpt(to); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send message
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %w", err)
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	return client.Quit()
}

// sendWithSTARTTLS sends email using STARTTLS
func (s *EmailService) sendWithSTARTTLS(to, message string, auth smtp.Auth, addr string) error {
	return smtp.SendMail(addr, auth, s.config.From, []string{to}, []byte(message))
}

// SendOTP sends OTP email
func (s *EmailService) SendOTP(to, name, otp, purpose string) error {
	subject := "Your Verification Code - TaskHub"
	htmlBody := utils.GetOTPEmailTemplate(name, otp, purpose)
	return s.SendEmail(to, subject, htmlBody)
}

// SendWelcome sends welcome email
func (s *EmailService) SendWelcome(to, name string) error {
	subject := "Welcome to TaskHub!"
	htmlBody := utils.GetWelcomeEmailTemplate(name)
	return s.SendEmail(to, subject, htmlBody)
}

// SendNotification sends notification email
func (s *EmailService) SendNotification(to, name, title, message, actionURL, actionText string) error {
	subject := fmt.Sprintf("TaskHub: %s", title)
	htmlBody := utils.GetNotificationEmailTemplate(name, title, message, actionURL, actionText)
	return s.SendEmail(to, subject, htmlBody)
}

// SendBidNotification sends notification when someone bids on a task
func (s *EmailService) SendBidNotification(to, ownerName, bidderName, taskTitle string) error {
	title := "New Bid on Your Task"
	message := fmt.Sprintf("%s has placed a bid on your task '%s'. Review the bid and approve if suitable.", bidderName, taskTitle)
	actionURL := "http://localhost:5173/my-tasks"
	actionText := "View Bids"
	return s.SendNotification(to, ownerName, title, message, actionURL, actionText)
}

// SendBidApprovedNotification sends notification when bid is approved
func (s *EmailService) SendBidApprovedNotification(to, bidderName, taskTitle string) error {
	title := "Your Bid Was Approved!"
	message := fmt.Sprintf("Congratulations! Your bid on task '%s' has been approved. You can now start working on it.", taskTitle)
	actionURL := "http://localhost:5173/my-bids"
	actionText := "View Task"
	return s.SendNotification(to, bidderName, title, message, actionURL, actionText)
}

// SendBidRejectedNotification sends notification when bid is rejected
func (s *EmailService) SendBidRejectedNotification(to, bidderName, taskTitle string) error {
	title := "Bid Update"
	message := fmt.Sprintf("Your bid on task '%s' was not selected. Don't worry, there are many other opportunities!", taskTitle)
	actionURL := "http://localhost:5173/dashboard"
	actionText := "Browse Tasks"
	return s.SendNotification(to, bidderName, title, message, actionURL, actionText)
}

// SendDeadlineReminder sends notification when a task is due within 24 hours
func (s *EmailService) SendDeadlineReminder(to, userName, taskTitle string, deadline time.Time) error {
	title := "Task Deadline Approaching"
	message := fmt.Sprintf("Gentle reminder: your assigned task '%s' is due soon (by %s). Please ensure it is completed on time.", taskTitle, deadline.Format("Jan 02, 2006 15:04"))
	actionURL := "http://localhost:5173/my-bids"
	actionText := "Go to Project"
	return s.SendNotification(to, userName, title, message, actionURL, actionText)
}
