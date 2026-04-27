package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (name, email, password_hash, email_verified, verified_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query, user.Name, user.Email, user.PasswordHash, user.EmailVerified, user.VerifiedAt).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, password_hash, bio, avatar_url, skills, resume_url, 
		       email_verified, verified_at, total_points, rating_sum, rating_count, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.Bio, &user.AvatarURL, &user.Skills, &user.ResumeURL,
		&user.EmailVerified, &user.VerifiedAt,
		&user.TotalPoints, &user.RatingSum, &user.RatingCount,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, password_hash, bio, avatar_url, skills, resume_url, 
		       email_verified, verified_at, total_points, rating_sum, rating_count, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.Bio, &user.AvatarURL, &user.Skills, &user.ResumeURL,
		&user.EmailVerified, &user.VerifiedAt,
		&user.TotalPoints, &user.RatingSum, &user.RatingCount,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	return exists, err
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users
		SET name = $1, email = $2, password_hash = $3,
		    bio = $4, avatar_url = $5, skills = $6, resume_url = $7,
		    email_verified = $8, verified_at = $9, updated_at = NOW()
		WHERE id = $10
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query, 
		user.Name, user.Email, user.PasswordHash,
		user.Bio, user.AvatarURL, user.Skills, user.ResumeURL,
		user.EmailVerified, user.VerifiedAt, user.ID,
	).Scan(&user.UpdatedAt)
}

func (r *UserRepository) GetProfile(ctx context.Context, userID string) (*models.UserProfile, error) {
	// First get base user
	user, err := r.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	profile := &models.UserProfile{
		User:        *user,
		TaskHistory: make([]models.TaskHistoryItem, 0),
		BidHistory:  make([]models.BidHistoryItem, 0),
	}

	if profile.RatingCount > 0 {
		profile.AvgRating = float64(profile.RatingSum) / float64(profile.RatingCount)
	}

	// 1. Get task stats
	var totalTasks, completedTasks int
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
		FROM tasks WHERE owner_id = $1
	`, userID).Scan(&totalTasks, &completedTasks)
	if err == nil {
		profile.TotalTasksPosted = totalTasks
		profile.TotalTasksCompleted = completedTasks
	}

	// 2. Get bid stats
	var totalBids, approvedBids int
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'approved')
		FROM bids WHERE bidder_id = $1
	`, userID).Scan(&totalBids, &approvedBids)
	if err == nil {
		profile.TotalBidsPlaced = totalBids
		profile.TotalBidsWon = approvedBids
		if totalBids > 0 {
			profile.SuccessRate = float64(approvedBids) / float64(totalBids)
		}
	}

	// 3. Get Task History
	tRows, err := r.db.Query(ctx, `
		SELECT id, title, status, priority, deadline, created_at, assigned_to::text, rating, points
		FROM tasks
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err == nil {
		for tRows.Next() {
			var t models.TaskHistoryItem
			if err := tRows.Scan(&t.ID, &t.Title, &t.Status, &t.Priority, &t.Deadline, &t.CreatedAt, &t.AssignedTo, &t.Rating, &t.Points); err == nil {
				profile.TaskHistory = append(profile.TaskHistory, t)
			}
		}
		tRows.Close()
	}

	// 4. Get Bid History
	bRows, err := r.db.Query(ctx, `
		SELECT b.id, b.task_id, t.title, t.status, t.deadline, b.status, b.estimated_completion, b.created_at
		FROM bids b
		JOIN tasks t ON b.task_id = t.id
		WHERE b.bidder_id = $1
		ORDER BY b.created_at DESC
	`, userID)
	if err == nil {
		for bRows.Next() {
			var b models.BidHistoryItem
			if err := bRows.Scan(&b.BidID, &b.TaskID, &b.TaskTitle, &b.TaskStatus, &b.TaskDeadline, &b.BidStatus, &b.EstimatedCompletion, &b.CreatedAt); err == nil {
				profile.BidHistory = append(profile.BidHistory, b)
			}
		}
		bRows.Close()
	}

	return profile, nil
}

func (r *UserRepository) GetLeaderboard(ctx context.Context) ([]*models.LeaderboardUser, error) {
	query := `
		SELECT 
			u.id, 
			u.name, 
			COALESCE(u.avatar_url, ''), 
			u.total_points, 
			u.rating_sum, 
			u.rating_count, 
			u.skills,
			(SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as tasks_done
		FROM users u
		ORDER BY u.total_points DESC
		LIMIT 20
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []*models.LeaderboardUser
	for rows.Next() {
		var u models.LeaderboardUser
		var rSum, rCount int
		if err := rows.Scan(&u.ID, &u.Name, &u.AvatarURL, &u.TotalPoints, &rSum, &rCount, &u.Skills, &u.TasksDone); err != nil {
			return nil, err
		}
		if rCount > 0 {
			u.AvgRating = float64(rSum) / float64(rCount)
		}
		if u.Skills == nil {
			u.Skills = []string{}
		}
		leaderboard = append(leaderboard, &u)
	}

	return leaderboard, nil
}
