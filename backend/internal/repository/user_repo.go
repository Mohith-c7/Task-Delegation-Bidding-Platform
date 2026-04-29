package repository

import (
	"context"
	"encoding/json"
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

func (r *UserRepository) UpdateNotificationPrefs(ctx context.Context, userID string, prefs *models.NotificationPrefsRequest) error {
	payload, err := json.Marshal(prefs)
	if err != nil {
		return err
	}

	result, err := r.db.Exec(ctx,
		`UPDATE users SET notif_prefs = $1, updated_at = NOW() WHERE id = $2`,
		payload, userID,
	)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("user not found")
	}
	return nil
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
		Reviews:     make([]models.UserReview, 0),
		Role:        "member",
	}

	if profile.RatingCount > 0 {
		profile.AvgRating = float64(profile.RatingSum) / float64(profile.RatingCount)
		profile.OverallRating = profile.AvgRating
	}

	if role, err := r.GetProfileRole(ctx, userID); err == nil && role != "" {
		profile.Role = role
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
		profile.TasksApplied = totalBids
		profile.TasksAccepted = approvedBids
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

	reviews, err := r.GetUserReviews(ctx, userID)
	if err == nil {
		profile.Reviews = reviews
		profile.ReviewCount = len(reviews)
	}

	return profile, nil
}

func (r *UserRepository) GetProfileRole(ctx context.Context, userID string) (string, error) {
	var role string
	err := r.db.QueryRow(ctx, `
		SELECT role
		FROM memberships
		WHERE user_id = $1
		ORDER BY CASE role
			WHEN 'org_admin' THEN 1
			WHEN 'manager' THEN 2
			WHEN 'employee' THEN 3
			ELSE 4
		END
		LIMIT 1
	`, userID).Scan(&role)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "member", nil
		}
		return "", err
	}
	return role, nil
}

func (r *UserRepository) GetUserReviews(ctx context.Context, userID string) ([]models.UserReview, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			ur.id,
			ur.task_id,
			COALESCE(t.title, 'Unavailable task') AS task_title,
			ur.reviewer_id,
			COALESCE(reviewer.name, 'Deleted user') AS reviewer_name,
			ur.reviewee_id,
			ur.rating,
			ur.points,
			ur.comment,
			ur.created_at
		FROM user_reviews ur
		LEFT JOIN tasks t ON t.id = ur.task_id
		LEFT JOIN users reviewer ON reviewer.id = ur.reviewer_id
		WHERE ur.reviewee_id = $1
		ORDER BY ur.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	reviews := make([]models.UserReview, 0)
	for rows.Next() {
		var review models.UserReview
		if err := rows.Scan(
			&review.ID,
			&review.TaskID,
			&review.TaskTitle,
			&review.ReviewerID,
			&review.ReviewerName,
			&review.RevieweeID,
			&review.Rating,
			&review.Points,
			&review.Comment,
			&review.CreatedAt,
		); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}

	return reviews, nil
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
			(SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as tasks_done,
			(SELECT COUNT(*) FROM bids WHERE bidder_id = u.id AND status = 'approved') as bids_won
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
		if err := rows.Scan(&u.ID, &u.Name, &u.AvatarURL, &u.TotalPoints, &rSum, &rCount, &u.Skills, &u.TasksDone, &u.BidsWon); err != nil {
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

func (r *UserRepository) GetCompletedTaskHistoryForUser(ctx context.Context, userID string) ([]models.TaskHistoryItem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, title, status, priority, deadline, created_at, NULL::text, rating, points
		FROM tasks
		WHERE assigned_to = $1 AND status = 'completed'
		ORDER BY updated_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	history := make([]models.TaskHistoryItem, 0)
	for rows.Next() {
		var item models.TaskHistoryItem
		if err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.Status,
			&item.Priority,
			&item.Deadline,
			&item.CreatedAt,
			&item.AssignedTo,
			&item.Rating,
			&item.Points,
		); err != nil {
			return nil, err
		}
		history = append(history, item)
	}

	return history, nil
}
