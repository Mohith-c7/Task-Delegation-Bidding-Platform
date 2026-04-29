package repository

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type NotificationRepository struct {
	db *pgxpool.Pool
}

func NewNotificationRepository(db *pgxpool.Pool) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) CreateNotification(ctx context.Context, n *models.Notification) error {
	query := `
		INSERT INTO notifications (user_id, org_id, type, title, body, resource_type, resource_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, is_read, created_at
	`
	return r.db.QueryRow(ctx, query,
		n.UserID, n.OrgID, n.Type, n.Title, n.Body, n.ResourceType, n.ResourceID,
	).Scan(&n.ID, &n.IsRead, &n.CreatedAt)
}

func (r *NotificationRepository) GetNotificationPrefs(ctx context.Context, userID string) (*models.NotificationPrefsRequest, error) {
	var raw []byte
	err := r.db.QueryRow(ctx, `SELECT COALESCE(notif_prefs, '{}'::jsonb) FROM users WHERE id = $1`, userID).Scan(&raw)
	if err != nil {
		return nil, err
	}
	prefs := &models.NotificationPrefsRequest{
		BidPlaced:    true,
		BidApproved:  true,
		BidRejected:  true,
		TaskAssigned: true,
		TaskComment:  true,
		Deadline:     true,
	}
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, prefs)
	}
	return prefs, nil
}

func (r *NotificationRepository) HasRecentDuplicate(ctx context.Context, n *models.Notification, window time.Duration) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM notifications
			WHERE user_id = $1
			  AND type = $2
			  AND COALESCE(resource_type, '') = COALESCE($3, '')
			  AND COALESCE(resource_id::text, '') = COALESCE($4, '')
			  AND created_at >= NOW() - ($5::int * INTERVAL '1 second')
		)
	`, n.UserID, n.Type, n.ResourceType, n.ResourceID, int(window.Seconds())).Scan(&exists)
	return exists, err
}

func (r *NotificationRepository) GetNotificationHistory(ctx context.Context, userID string, limit, offset int) ([]models.Notification, error) {
	query := `
		SELECT id, user_id, org_id, type, title, body, resource_type, resource_id, is_read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.OrgID, &n.Type, &n.Title, &n.Body,
			&n.ResourceType, &n.ResourceID, &n.IsRead, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func (r *NotificationRepository) MarkRead(ctx context.Context, notificationID, userID string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
		notificationID, userID,
	)
	return err
}

func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
		userID,
	)
	return err
}

func (r *NotificationRepository) CountUnread(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`, userID,
	).Scan(&count)
	return count, err
}

// DeadlineTask holds the minimal task info needed for deadline reminders.
type DeadlineTask struct {
	ID         string
	Title      string
	AssignedTo *string
	Deadline   time.Time
	UserName   string
	UserEmail  string
}

// GetTasksDueWithin24Hours returns tasks that are assigned, not finished,
// and have a deadline between now and 24 hours from now.
func (r *NotificationRepository) GetTasksDueWithin24Hours(ctx context.Context) ([]DeadlineTask, error) {
	query := `
		SELECT t.id, t.title, t.assigned_to::text, t.deadline, u.name, u.email
		FROM tasks t
		JOIN users u ON t.assigned_to = u.id
		WHERE t.assigned_to IS NOT NULL
		  AND t.status NOT IN ('completed', 'closed')
		  AND t.deadline > NOW()
		  AND t.deadline <= NOW() + INTERVAL '24 hours'
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []DeadlineTask
	for rows.Next() {
		var t DeadlineTask
		if err := rows.Scan(&t.ID, &t.Title, &t.AssignedTo, &t.Deadline, &t.UserName, &t.UserEmail); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}
