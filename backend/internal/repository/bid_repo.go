package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type BidRepository struct {
	db *pgxpool.Pool
}

func NewBidRepository(db *pgxpool.Pool) *BidRepository {
	return &BidRepository{db: db}
}

func (r *BidRepository) Create(ctx context.Context, bid *models.Bid) error {
	query := `
		INSERT INTO bids (task_id, bidder_id, message, estimated_completion, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		bid.TaskID, bid.BidderID, bid.Message, bid.EstimatedCompletion, bid.Status,
	).Scan(&bid.ID, &bid.CreatedAt, &bid.UpdatedAt)
}

func (r *BidRepository) GetByID(ctx context.Context, id string) (*models.Bid, error) {
	bid := &models.Bid{}
	query := `
		SELECT id, task_id, bidder_id, message, estimated_completion, 
		       status, approved_by, created_at, updated_at
		FROM bids WHERE id = $1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&bid.ID, &bid.TaskID, &bid.BidderID, &bid.Message, &bid.EstimatedCompletion,
		&bid.Status, &bid.ApprovedBy, &bid.CreatedAt, &bid.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("bid not found")
		}
		return nil, err
	}
	return bid, nil
}

func (r *BidRepository) GetByTaskID(ctx context.Context, taskID string) ([]*models.BidWithDetails, error) {
	query := `
		SELECT b.id, b.task_id, b.bidder_id, b.message, b.estimated_completion,
		       b.status, b.approved_by, b.created_at, b.updated_at,
		       u.name, u.email
		FROM bids b
		JOIN users u ON b.bidder_id = u.id
		WHERE b.task_id = $1
		ORDER BY b.created_at DESC
	`
	rows, err := r.db.Query(ctx, query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bids := []*models.BidWithDetails{}
	for rows.Next() {
		bid := &models.BidWithDetails{}
		err := rows.Scan(
			&bid.ID, &bid.TaskID, &bid.BidderID, &bid.Message, &bid.EstimatedCompletion,
			&bid.Status, &bid.ApprovedBy, &bid.CreatedAt, &bid.UpdatedAt,
			&bid.BidderName, &bid.BidderEmail,
		)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return bids, nil
}

func (r *BidRepository) GetByBidderID(ctx context.Context, bidderID string) ([]*models.Bid, error) {
	query := `
		SELECT id, task_id, bidder_id, message, estimated_completion,
		       status, approved_by, created_at, updated_at
		FROM bids WHERE bidder_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, bidderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bids := []*models.Bid{}
	for rows.Next() {
		bid := &models.Bid{}
		err := rows.Scan(
			&bid.ID, &bid.TaskID, &bid.BidderID, &bid.Message, &bid.EstimatedCompletion,
			&bid.Status, &bid.ApprovedBy, &bid.CreatedAt, &bid.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return bids, nil
}

func (r *BidRepository) UpdateStatus(ctx context.Context, id string, status models.BidStatus, approvedBy *string) error {
	query := `
		UPDATE bids 
		SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`
	result, err := r.db.Exec(ctx, query, status, approvedBy, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("bid not found")
	}
	return nil
}

func (r *BidRepository) BidExists(ctx context.Context, taskID, bidderID string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM bids WHERE task_id = $1 AND bidder_id = $2)`
	err := r.db.QueryRow(ctx, query, taskID, bidderID).Scan(&exists)
	return exists, err
}
