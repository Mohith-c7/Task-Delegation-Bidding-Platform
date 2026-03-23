package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type BillingRepository struct {
	db *pgxpool.Pool
}

func NewBillingRepository(db *pgxpool.Pool) *BillingRepository {
	return &BillingRepository{db: db}
}

func (r *BillingRepository) GetSubscription(ctx context.Context, orgID string) (*models.Subscription, error) {
	sub := &models.Subscription{}
	query := `
		SELECT id, org_id, tier, started_at, renews_at, created_at, updated_at
		FROM subscriptions WHERE org_id = $1
	`
	err := r.db.QueryRow(ctx, query, orgID).Scan(
		&sub.ID, &sub.OrgID, &sub.Tier, &sub.StartedAt, &sub.RenewsAt,
		&sub.CreatedAt, &sub.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return sub, nil
}

func (r *BillingRepository) UpsertSubscription(ctx context.Context, sub *models.Subscription) error {
	query := `
		INSERT INTO subscriptions (org_id, tier, started_at, renews_at)
		VALUES ($1, $2, NOW(), $3)
		ON CONFLICT (org_id) DO UPDATE
		SET tier = EXCLUDED.tier, renews_at = EXCLUDED.renews_at, updated_at = NOW()
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query, sub.OrgID, sub.Tier, sub.RenewsAt).
		Scan(&sub.ID, &sub.CreatedAt, &sub.UpdatedAt)
}

func (r *BillingRepository) CountActiveMembers(ctx context.Context, orgID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM memberships WHERE org_id = $1`, orgID,
	).Scan(&count)
	return count, err
}

func (r *BillingRepository) CountActiveTasks(ctx context.Context, orgID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM tasks WHERE org_id = $1 AND status NOT IN ('completed','closed')`, orgID,
	).Scan(&count)
	return count, err
}
