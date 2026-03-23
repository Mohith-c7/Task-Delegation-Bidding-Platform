package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type AnalyticsRepository struct {
	db *pgxpool.Pool
}

func NewAnalyticsRepository(db *pgxpool.Pool) *AnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

// GetSummary retrieves overall analytics summary
func (r *AnalyticsRepository) GetSummary(ctx context.Context) (*models.AnalyticsSummary, error) {
	summary := &models.AnalyticsSummary{
		TasksByPriority: make(map[string]int),
		TasksByStatus:   make(map[string]int),
	}

	// Get total tasks and status counts
	query := `
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
			COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
		FROM tasks
	`
	err := r.db.QueryRow(ctx, query).Scan(
		&summary.TotalTasks,
		&summary.OpenTasks,
		&summary.CompletedTasks,
		&summary.InProgressTasks,
	)
	if err != nil {
		return nil, err
	}

	// Get total bids
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM bids").Scan(&summary.TotalBids)
	if err != nil {
		return nil, err
	}

	// Calculate average completion time (in hours)
	query = `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 0)
		FROM tasks
		WHERE status = 'completed'
	`
	err = r.db.QueryRow(ctx, query).Scan(&summary.AverageCompletionTime)
	if err != nil {
		return nil, err
	}

	// Calculate completion rate
	if summary.TotalTasks > 0 {
		summary.TaskCompletionRate = float64(summary.CompletedTasks) / float64(summary.TotalTasks) * 100
	}

	// Get tasks by priority
	query = `SELECT priority, COUNT(*) FROM tasks GROUP BY priority`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var priority string
		var count int
		if err := rows.Scan(&priority, &count); err != nil {
			return nil, err
		}
		summary.TasksByPriority[priority] = count
	}

	// Get tasks by status
	query = `SELECT status, COUNT(*) FROM tasks GROUP BY status`
	rows, err = r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		summary.TasksByStatus[status] = count
	}

	return summary, nil
}

// GetTaskTrends retrieves task creation and completion trends for the last 30 days
func (r *AnalyticsRepository) GetTaskTrends(ctx context.Context, days int) ([]models.TaskTrend, error) {
	query := `
		WITH date_series AS (
			SELECT generate_series(
				CURRENT_DATE - INTERVAL '1 day' * $1,
				CURRENT_DATE,
				'1 day'::interval
			)::date AS date
		)
		SELECT 
			TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
			COALESCE(created.count, 0) as created,
			COALESCE(completed.count, 0) as completed
		FROM date_series ds
		LEFT JOIN (
			SELECT DATE(created_at) as date, COUNT(*) as count
			FROM tasks
			WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
			GROUP BY DATE(created_at)
		) created ON ds.date = created.date
		LEFT JOIN (
			SELECT DATE(updated_at) as date, COUNT(*) as count
			FROM tasks
			WHERE status = 'completed' AND updated_at >= CURRENT_DATE - INTERVAL '1 day' * $1
			GROUP BY DATE(updated_at)
		) completed ON ds.date = completed.date
		ORDER BY ds.date
	`

	rows, err := r.db.Query(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	trends := []models.TaskTrend{}
	for rows.Next() {
		var trend models.TaskTrend
		if err := rows.Scan(&trend.Date, &trend.Created, &trend.Completed); err != nil {
			return nil, err
		}
		trends = append(trends, trend)
	}

	return trends, nil
}

// GetTopBidders retrieves top performing bidders
func (r *AnalyticsRepository) GetTopBidders(ctx context.Context, limit int) ([]models.BidderPerformance, error) {
	query := `
		SELECT 
			u.id as bidder_id,
			u.name as bidder_name,
			u.email as bidder_email,
			COUNT(b.id) as total_bids,
			COUNT(CASE WHEN b.status = 'approved' THEN 1 END) as approved_bids,
			COUNT(CASE WHEN t.status = 'completed' AND t.assigned_to = u.id THEN 1 END) as completed_tasks,
			CASE 
				WHEN COUNT(b.id) > 0 THEN 
					(COUNT(CASE WHEN b.status = 'approved' THEN 1 END)::float / COUNT(b.id)::float * 100)
				ELSE 0 
			END as success_rate,
			COALESCE(AVG(
				CASE WHEN t.status = 'completed' AND t.assigned_to = u.id 
				THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600 
				END
			), 0) as avg_completion_time,
			COUNT(CASE 
				WHEN t.status = 'completed' AND t.assigned_to = u.id AND t.updated_at <= t.deadline 
				THEN 1 
			END) as on_time_completions,
			COUNT(CASE 
				WHEN t.status = 'completed' AND t.assigned_to = u.id AND t.updated_at > t.deadline 
				THEN 1 
			END) as late_completions
		FROM users u
		LEFT JOIN bids b ON b.bidder_id = u.id
		LEFT JOIN tasks t ON t.assigned_to = u.id
		GROUP BY u.id, u.name, u.email
		HAVING COUNT(b.id) > 0
		ORDER BY success_rate DESC, completed_tasks DESC
		LIMIT $1
	`

	rows, err := r.db.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bidders := []models.BidderPerformance{}
	for rows.Next() {
		var bidder models.BidderPerformance
		if err := rows.Scan(
			&bidder.BidderID,
			&bidder.BidderName,
			&bidder.BidderEmail,
			&bidder.TotalBids,
			&bidder.ApprovedBids,
			&bidder.CompletedTasks,
			&bidder.SuccessRate,
			&bidder.AverageCompletionTime,
			&bidder.OnTimeCompletions,
			&bidder.LateCompletions,
		); err != nil {
			return nil, err
		}
		bidders = append(bidders, bidder)
	}

	return bidders, nil
}

// GetTopTaskOwners retrieves top task owners by activity
func (r *AnalyticsRepository) GetTopTaskOwners(ctx context.Context, limit int) ([]models.TaskOwnerStats, error) {
	query := `
		SELECT 
			u.id as owner_id,
			u.name as owner_name,
			u.email as owner_email,
			COUNT(t.id) as tasks_posted,
			COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
			COALESCE(AVG(bid_counts.bid_count), 0) as avg_bids_per_task
		FROM users u
		LEFT JOIN tasks t ON t.owner_id = u.id
		LEFT JOIN (
			SELECT task_id, COUNT(*) as bid_count
			FROM bids
			GROUP BY task_id
		) bid_counts ON bid_counts.task_id = t.id
		GROUP BY u.id, u.name, u.email
		HAVING COUNT(t.id) > 0
		ORDER BY tasks_posted DESC
		LIMIT $1
	`

	rows, err := r.db.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	owners := []models.TaskOwnerStats{}
	for rows.Next() {
		var owner models.TaskOwnerStats
		if err := rows.Scan(
			&owner.OwnerID,
			&owner.OwnerName,
			&owner.OwnerEmail,
			&owner.TasksPosted,
			&owner.TasksCompleted,
			&owner.AverageBidsPerTask,
		); err != nil {
			return nil, err
		}
		owners = append(owners, owner)
	}

	return owners, nil
}

// GetSkillDemands retrieves most in-demand skills
func (r *AnalyticsRepository) GetSkillDemands(ctx context.Context, limit int) ([]models.SkillDemand, error) {
	query := `
		WITH skill_tasks AS (
			SELECT UNNEST(skills) as skill, id as task_id
			FROM tasks
		)
		SELECT 
			st.skill,
			COUNT(DISTINCT st.task_id) as task_count,
			COUNT(DISTINCT b.id) as bid_count
		FROM skill_tasks st
		LEFT JOIN bids b ON b.task_id = st.task_id
		GROUP BY st.skill
		ORDER BY task_count DESC, bid_count DESC
		LIMIT $1
	`

	rows, err := r.db.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skills := []models.SkillDemand{}
	for rows.Next() {
		var skill models.SkillDemand
		if err := rows.Scan(&skill.Skill, &skill.TaskCount, &skill.BidCount); err != nil {
			return nil, err
		}
		skills = append(skills, skill)
	}

	return skills, nil
}

// GetUserAnalytics retrieves analytics for a specific user
func (r *AnalyticsRepository) GetUserAnalytics(ctx context.Context, userID string) (*models.UserAnalytics, error) {
	analytics := &models.UserAnalytics{UserID: userID}

	query := `
		SELECT 
			COUNT(DISTINCT t.id) as tasks_posted,
			COUNT(DISTINCT CASE WHEN t.status = 'completed' AND t.owner_id = $1 THEN t.id END) as tasks_completed,
			COUNT(DISTINCT b.id) as bids_placed,
			COUNT(DISTINCT CASE WHEN b.status = 'approved' THEN b.id END) as bids_won,
			CASE 
				WHEN COUNT(DISTINCT b.id) > 0 THEN 
					(COUNT(DISTINCT CASE WHEN b.status = 'approved' THEN b.id END)::float / COUNT(DISTINCT b.id)::float * 100)
				ELSE 0 
			END as success_rate,
			COALESCE(AVG(
				CASE WHEN t2.status = 'completed' AND t2.assigned_to = $1 
				THEN EXTRACT(EPOCH FROM (t2.updated_at - t2.created_at)) / 3600 
				END
			), 0) as avg_completion_time,
			CASE 
				WHEN COUNT(CASE WHEN t2.status = 'completed' AND t2.assigned_to = $1 THEN 1 END) > 0 THEN
					(COUNT(CASE WHEN t2.status = 'completed' AND t2.assigned_to = $1 AND t2.updated_at <= t2.deadline THEN 1 END)::float / 
					 COUNT(CASE WHEN t2.status = 'completed' AND t2.assigned_to = $1 THEN 1 END)::float * 100)
				ELSE 0
			END as on_time_rate
		FROM users u
		LEFT JOIN tasks t ON t.owner_id = u.id
		LEFT JOIN bids b ON b.bidder_id = u.id
		LEFT JOIN tasks t2 ON t2.assigned_to = u.id
		WHERE u.id = $1
		GROUP BY u.id
	`

	err := r.db.QueryRow(ctx, query, userID).Scan(
		&analytics.TasksPosted,
		&analytics.TasksCompleted,
		&analytics.BidsPlaced,
		&analytics.BidsWon,
		&analytics.SuccessRate,
		&analytics.AverageCompletionTime,
		&analytics.OnTimeRate,
	)
	if err != nil {
		return nil, err
	}

	return analytics, nil
}

// GetOrgDashboard returns org-scoped analytics summary.
func (r *AnalyticsRepository) GetOrgDashboard(ctx context.Context, orgID string) (*models.AnalyticsSummary, error) {
	summary := &models.AnalyticsSummary{
		TasksByPriority: make(map[string]int),
		TasksByStatus:   make(map[string]int),
	}
	query := `
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
			COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
		FROM tasks WHERE org_id = $1
	`
	err := r.db.QueryRow(ctx, query, orgID).Scan(
		&summary.TotalTasks, &summary.OpenTasks, &summary.CompletedTasks, &summary.InProgressTasks,
	)
	if err != nil {
		return nil, err
	}
	if summary.TotalTasks > 0 {
		summary.TaskCompletionRate = float64(summary.CompletedTasks) / float64(summary.TotalTasks) * 100
	}
	return summary, nil
}

// GetTrends returns task creation/completion trends for an org over N days.
func (r *AnalyticsRepository) GetTrends(ctx context.Context, orgID string, days int) ([]models.TaskTrend, error) {
	query := `
		WITH date_series AS (
			SELECT generate_series(CURRENT_DATE - INTERVAL '1 day' * $2, CURRENT_DATE, '1 day'::interval)::date AS date
		)
		SELECT TO_CHAR(ds.date, 'YYYY-MM-DD'),
			COALESCE(c.cnt, 0), COALESCE(d.cnt, 0)
		FROM date_series ds
		LEFT JOIN (SELECT DATE(created_at) d, COUNT(*) cnt FROM tasks WHERE org_id=$1 GROUP BY 1) c ON ds.date=c.d
		LEFT JOIN (SELECT DATE(updated_at) d, COUNT(*) cnt FROM tasks WHERE org_id=$1 AND status='completed' GROUP BY 1) d ON ds.date=d.d
		ORDER BY ds.date
	`
	rows, err := r.db.Query(ctx, query, orgID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var trends []models.TaskTrend
	for rows.Next() {
		var t models.TaskTrend
		_ = rows.Scan(&t.Date, &t.Created, &t.Completed)
		trends = append(trends, t)
	}
	return trends, nil
}
