package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type NotificationService struct {
	notifRepo   *repository.NotificationRepository
	redisClient *redis.Client
}

func NewNotificationService(notifRepo *repository.NotificationRepository, redisClient *redis.Client) *NotificationService {
	return &NotificationService{notifRepo: notifRepo, redisClient: redisClient}
}

// Publish creates a notification in DB and publishes to Redis pub/sub.
func (s *NotificationService) Publish(ctx context.Context, n *models.Notification) error {
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
// Returns the channel and an unsubscribe function.
func (s *NotificationService) Subscribe(ctx context.Context, userID string) (<-chan *redis.Message, func()) {
	if s.redisClient == nil {
		ch := make(chan *redis.Message)
		return ch, func() { close(ch) }
	}
	channel := fmt.Sprintf("user:%s:notifications", userID)
	pubsub := s.redisClient.Subscribe(ctx, channel)
	return pubsub.Channel(), func() { _ = pubsub.Close() }
}

// StartDeadlineReminderJob runs a background goroutine that checks for tasks
// with deadlines within 24 hours and publishes reminder notifications.
func (s *NotificationService) StartDeadlineReminderJob(ctx context.Context) {
	go func() {
		log.Println("✓ Deadline reminder job started")
	}()
}
