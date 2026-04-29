package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type NotificationService struct {
	notifRepo    *repository.NotificationRepository
	redisClient  *redis.Client
	emailService *EmailService
}

func NewNotificationService(notifRepo *repository.NotificationRepository, redisClient *redis.Client) *NotificationService {
	return &NotificationService{
		notifRepo:   notifRepo,
		redisClient: redisClient,
	}
}

func (s *NotificationService) SetEmailService(es *EmailService) {
	s.emailService = es
}

// Publish creates a notification in DB and publishes to Redis pub/sub.
func (s *NotificationService) Publish(ctx context.Context, n *models.Notification) error {
	allowed, err := s.notificationAllowed(ctx, n)
	if err != nil {
		log.Printf("notification preference check failed: %v", err)
	}
	if !allowed {
		return nil
	}
	duplicate, err := s.notifRepo.HasRecentDuplicate(ctx, n, 2*time.Minute)
	if err != nil {
		log.Printf("notification duplicate check failed: %v", err)
	}
	if duplicate {
		return nil
	}
	if err := s.notifRepo.CreateNotification(ctx, n); err != nil {
		return err
	}
	if s.redisClient != nil {
		payload, _ := json.Marshal(n)
		channel := fmt.Sprintf("user:%s:notifications", n.UserID)
		if err := s.redisClient.Publish(ctx, channel, payload).Err(); err != nil {
			log.Printf("notification publish error: %v", err)
		}
	}
	return nil
}

func (s *NotificationService) notificationAllowed(ctx context.Context, n *models.Notification) (bool, error) {
	prefs, err := s.notifRepo.GetNotificationPrefs(ctx, n.UserID)
	if err != nil {
		return true, err
	}
	switch n.Type {
	case models.NotifBidPlaced:
		return prefs.BidPlaced, nil
	case models.NotifBidApproved:
		return prefs.BidApproved, nil
	case models.NotifBidRejected:
		return prefs.BidRejected, nil
	case models.NotifTaskAssigned, models.NotifTaskUpdated:
		return prefs.TaskAssigned, nil
	case models.NotifCommentAdded:
		return prefs.TaskComment, nil
	case models.NotifDeadlineSoon:
		return prefs.Deadline, nil
	default:
		return true, nil
	}
}

// GetHistory returns paginated notification history for a user.
func (s *NotificationService) GetHistory(ctx context.Context, userID string, limit, offset int) ([]models.Notification, error) {
	return s.notifRepo.GetNotificationHistory(ctx, userID, limit, offset)
}

// MarkRead marks a single notification as read.
func (s *NotificationService) MarkRead(ctx context.Context, notificationID, userID string) error {
	return s.notifRepo.MarkRead(ctx, notificationID, userID)
}

// MarkAllRead marks all notifications for a user as read.
func (s *NotificationService) MarkAllRead(ctx context.Context, userID string) error {
	return s.notifRepo.MarkAllRead(ctx, userID)
}

// Subscribe returns a Redis pub/sub channel for a user's notifications.
func (s *NotificationService) Subscribe(ctx context.Context, userID string) (<-chan *redis.Message, func()) {
	if s.redisClient == nil {
		ch := make(chan *redis.Message)
		return ch, func() { close(ch) }
	}
	channel := fmt.Sprintf("user:%s:notifications", userID)
	pubsub := s.redisClient.Subscribe(ctx, channel)
	return pubsub.Channel(), func() { _ = pubsub.Close() }
}

// StartDeadlineReminderJob runs a background goroutine that checks every hour
// for tasks with deadlines within the next 24 hours and publishes reminder
// notifications to the assigned user.
func (s *NotificationService) StartDeadlineReminderJob(ctx context.Context) {
	go func() {
		log.Println("✓ Deadline reminder job started (runs every hour)")

		// Run once immediately on startup, then every hour
		s.sendDeadlineReminders(ctx)

		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("Deadline reminder job stopped")
				return
			case <-ticker.C:
				s.sendDeadlineReminders(ctx)
			}
		}
	}()
}

// sendDeadlineReminders queries tasks due within 24 hours and notifies assignees.
func (s *NotificationService) sendDeadlineReminders(ctx context.Context) {
	tasks, err := s.notifRepo.GetTasksDueWithin24Hours(ctx)
	if err != nil {
		log.Printf("deadline reminder: failed to query tasks: %v", err)
		return
	}

	for _, t := range tasks {
		if t.AssignedTo == nil {
			continue
		}

		taskID := t.ID
		notif := &models.Notification{
			UserID:       *t.AssignedTo,
			Type:         models.NotifDeadlineSoon,
			Title:        "Task deadline approaching",
			Body:         fmt.Sprintf("Task \"%s\" is due within 24 hours", t.Title),
			ResourceType: strPtr("task"),
			ResourceID:   &taskID,
		}

		if err := s.Publish(ctx, notif); err != nil {
			log.Printf("deadline reminder: failed to notify user %s: %v", *t.AssignedTo, err)
		}

		// Email notification
		if s.emailService != nil {
			go func(to, name, title string, dl time.Time) {
				if err := s.emailService.SendDeadlineReminder(to, name, title, dl); err != nil {
					log.Printf("deadline reminder email: failed to send to %s: %v", to, err)
				}
			}(t.UserEmail, t.UserName, t.Title, t.Deadline)
		}
	}

	if len(tasks) > 0 {
		log.Printf("Deadline reminders sent for %d task(s)", len(tasks))
	}
}
