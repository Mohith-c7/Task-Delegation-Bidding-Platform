package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type TaskRepository struct {
	db *pgxpool.Pool
}

func NewTaskRepository(db *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(ctx context.Context, task *models.Task) error {
	query := `
		INSERT INTO tasks (title, description, skills, questions, deadline, priority, status, owner_id, org_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULLIF($9::text, '')::uuid)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.Skills, task.Questions, task.Deadline,
		task.Priority, task.Status, task.OwnerID, task.OrgID,
	).Scan(&task.ID, &task.CreatedAt, &task.UpdatedAt)
}

func (r *TaskRepository) GetByID(ctx context.Context, id string) (*models.Task, error) {
	task := &models.Task{}
	query := `
		SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status, 
		       COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN users u ON u.id = t.owner_id
		WHERE t.id = $1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID, &task.Title, &task.Description, &task.Skills, &task.Questions, &task.Deadline,
		&task.Priority, &task.Status, &task.OrgID, &task.OwnerID, &task.OwnerName, &task.AssignedTo,
		&task.Rating, &task.Points, &task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}
	return task, nil
}

func (r *TaskRepository) GetAll(ctx context.Context, status string) ([]*models.Task, error) {
	var query string
	var rows pgx.Rows
	var err error

	if status != "" {
		query = `
			SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status,
			       COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at
			FROM tasks t
			LEFT JOIN users u ON u.id = t.owner_id
			WHERE t.status = $1
			ORDER BY t.created_at DESC
		`
		rows, err = r.db.Query(ctx, query, status)
	} else {
		query = `
			SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status,
			       COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at
			FROM tasks t
			LEFT JOIN users u ON u.id = t.owner_id
			ORDER BY t.created_at DESC
		`
		rows, err = r.db.Query(ctx, query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []*models.Task{}
	for rows.Next() {
		task := &models.Task{}
		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.Skills, &task.Questions, &task.Deadline,
			&task.Priority, &task.Status, &task.OrgID, &task.OwnerID, &task.OwnerName, &task.AssignedTo,
			&task.Rating, &task.Points, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (r *TaskRepository) Update(ctx context.Context, id string, task *models.Task) error {
	query := `
		UPDATE tasks 
		SET title = $1, description = $2, skills = $3, questions = $4, deadline = $5, 
		    priority = $6, status = $7, assigned_to = $8, updated_at = CURRENT_TIMESTAMP
		WHERE id = $9
		RETURNING updated_at
	`
	err := r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.Skills, task.Questions, task.Deadline,
		task.Priority, task.Status, task.AssignedTo, id,
	).Scan(&task.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errors.New("task not found")
		}
		return err
	}
	return nil
}

func (r *TaskRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *TaskRepository) GetByOwnerID(ctx context.Context, ownerID string) ([]*models.Task, error) {
	query := `
		SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status,
		       COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN users u ON u.id = t.owner_id
		WHERE t.owner_id = $1
		ORDER BY t.created_at DESC
	`
	rows, err := r.db.Query(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []*models.Task{}
	for rows.Next() {
		task := &models.Task{}
		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.Skills, &task.Questions, &task.Deadline,
			&task.Priority, &task.Status, &task.OrgID, &task.OwnerID, &task.OwnerName, &task.AssignedTo,
			&task.Rating, &task.Points, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

// GetByOrgID returns all tasks for an org, optionally filtered by status.
func (r *TaskRepository) GetByOrgID(ctx context.Context, orgID, status string) ([]*models.Task, error) {
	var query string
	var args []interface{}
	if status != "" {
		query = `SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status, COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at FROM tasks t LEFT JOIN users u ON u.id = t.owner_id WHERE t.org_id = $1 AND t.status = $2 ORDER BY t.created_at DESC`
		args = []interface{}{orgID, status}
	} else {
		query = `SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status, COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at FROM tasks t LEFT JOIN users u ON u.id = t.owner_id WHERE t.org_id = $1 ORDER BY t.created_at DESC`
		args = []interface{}{orgID}
	}
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tasks []*models.Task
	for rows.Next() {
		t := &models.Task{}
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Skills, &t.Questions, &t.Deadline, &t.Priority, &t.Status, &t.OrgID, &t.OwnerID, &t.OwnerName, &t.AssignedTo, &t.Rating, &t.Points, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

// GetTaskDetail returns a task with its activity, comments, and checklist.
func (r *TaskRepository) GetTaskDetail(ctx context.Context, id string) (*models.TaskDetail, error) {
	task, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	detail := &models.TaskDetail{Task: *task}

	// Activity
	actRows, err := r.db.Query(ctx,
		`SELECT a.id, a.task_id, a.org_id, a.actor_id, a.event_type, a.field_name, a.old_value, a.new_value, a.created_at, COALESCE(u.name, 'System') AS actor_name
		 FROM activity_feed a
		 LEFT JOIN users u ON u.id = a.actor_id
		 WHERE a.task_id = $1
		 ORDER BY a.created_at ASC`, id)
	if err == nil {
		defer actRows.Close()
		for actRows.Next() {
			var a models.ActivityEntry
			_ = actRows.Scan(&a.ID, &a.TaskID, &a.OrgID, &a.ActorID, &a.EventType, &a.FieldName, &a.OldValue, &a.NewValue, &a.CreatedAt, &a.ActorName)
			detail.Activity = append(detail.Activity, a)
		}
	}

	// Comments
	cmtRows, err := r.db.Query(ctx,
		`SELECT c.id, c.task_id, c.org_id, c.author_id, c.body, c.created_at, c.updated_at, COALESCE(u.name, '')
		 FROM comments c
		 LEFT JOIN users u ON u.id = c.author_id
		 WHERE c.task_id = $1
		 ORDER BY c.created_at ASC`, id)
	if err == nil {
		defer cmtRows.Close()
		for cmtRows.Next() {
			var c models.Comment
			_ = cmtRows.Scan(&c.ID, &c.TaskID, &c.OrgID, &c.AuthorID, &c.Body, &c.CreatedAt, &c.UpdatedAt, &c.AuthorName)
			detail.Comments = append(detail.Comments, c)
		}
	}

	// Checklist
	chkRows, err := r.db.Query(ctx,
		`SELECT id, task_id, title, is_done, position, created_at FROM checklist_items WHERE task_id = $1 ORDER BY position ASC`, id)
	if err == nil {
		defer chkRows.Close()
		for chkRows.Next() {
			var ci models.ChecklistItem
			_ = chkRows.Scan(&ci.ID, &ci.TaskID, &ci.Title, &ci.IsDone, &ci.Position, &ci.CreatedAt)
			detail.Checklist = append(detail.Checklist, ci)
		}
	}

	return detail, nil
}

// AppendActivity inserts an activity entry.
func (r *TaskRepository) AppendActivity(ctx context.Context, a *models.ActivityEntry) error {
	query := `INSERT INTO activity_feed (task_id, org_id, actor_id, event_type, field_name, old_value, new_value) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`
	return r.db.QueryRow(ctx, query, a.TaskID, a.OrgID, a.ActorID, a.EventType, a.FieldName, a.OldValue, a.NewValue).Scan(&a.ID, &a.CreatedAt)
}

// CreateComment inserts a comment.
func (r *TaskRepository) CreateComment(ctx context.Context, c *models.Comment) error {
	query := `INSERT INTO comments (task_id, org_id, author_id, body) VALUES ($1,$2,$3,$4) RETURNING id, created_at, updated_at`
	return r.db.QueryRow(ctx, query, c.TaskID, c.OrgID, c.AuthorID, c.Body).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

// UpsertChecklist replaces all checklist items for a task.
func (r *TaskRepository) UpsertChecklist(ctx context.Context, taskID string, items []models.ChecklistItem) error {
	_, err := r.db.Exec(ctx, `DELETE FROM checklist_items WHERE task_id = $1`, taskID)
	if err != nil {
		return err
	}
	for i, item := range items {
		_, err := r.db.Exec(ctx,
			`INSERT INTO checklist_items (task_id, title, is_done, position) VALUES ($1,$2,$3,$4)`,
			taskID, item.Title, item.IsDone, i+1,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// TaskSearchParams holds all search/filter/sort/pagination parameters.
type TaskSearchParams struct {
	Query        string
	OrgID        string
	Status       string
	Priority     string
	AssignedTo   string
	Creator      string
	Skills       []string
	DeadlineFrom string
	DeadlineTo   string
	Sort         string // created_at_asc, created_at_desc, deadline_asc, deadline_desc, priority_desc
	Page         int
	PageSize     int
}

type TaskSearchResult struct {
	Tasks      []*models.Task `json:"tasks"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int            `json:"total_pages"`
}

// SearchTasks performs full-text search with filters, sorting, and pagination.
func (r *TaskRepository) SearchTasks(ctx context.Context, p TaskSearchParams) (*TaskSearchResult, error) {
	if p.PageSize <= 0 || p.PageSize > 25 {
		p.PageSize = 25
	}
	if p.Page <= 0 {
		p.Page = 1
	}
	offset := (p.Page - 1) * p.PageSize

	where := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if p.OrgID != "" {
		where = append(where, fmt.Sprintf("t.org_id = $%d", argIdx))
		args = append(args, p.OrgID)
		argIdx++
	}
	if p.Query != "" {
		where = append(where, fmt.Sprintf("t.search_vector @@ plainto_tsquery('english', $%d)", argIdx))
		args = append(args, p.Query)
		argIdx++
	}
	if p.Status != "" {
		where = append(where, fmt.Sprintf("t.status = $%d", argIdx))
		args = append(args, p.Status)
		argIdx++
	}
	if p.Priority != "" {
		where = append(where, fmt.Sprintf("t.priority = $%d", argIdx))
		args = append(args, p.Priority)
		argIdx++
	}
	if p.AssignedTo != "" {
		where = append(where, fmt.Sprintf("t.assigned_to = $%d", argIdx))
		args = append(args, p.AssignedTo)
		argIdx++
	}
	if p.Creator != "" {
		where = append(where, fmt.Sprintf("t.owner_id = $%d", argIdx))
		args = append(args, p.Creator)
		argIdx++
	}
	if len(p.Skills) > 0 {
		where = append(where, fmt.Sprintf("t.skills && $%d::text[]", argIdx))
		args = append(args, p.Skills)
		argIdx++
	}
	if p.DeadlineFrom != "" {
		where = append(where, fmt.Sprintf("t.deadline >= $%d", argIdx))
		args = append(args, p.DeadlineFrom)
		argIdx++
	}
	if p.DeadlineTo != "" {
		where = append(where, fmt.Sprintf("t.deadline <= $%d", argIdx))
		args = append(args, p.DeadlineTo)
		argIdx++
	}

	orderBy := "t.created_at DESC"
	switch p.Sort {
	case "created_at_asc":
		orderBy = "t.created_at ASC"
	case "deadline_asc":
		orderBy = "t.deadline ASC"
	case "deadline_desc":
		orderBy = "t.deadline DESC"
	case "priority_desc":
		orderBy = "CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC"
	}

	whereClause := strings.Join(where, " AND ")

	// Count total
	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM tasks t WHERE %s", whereClause)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, err
	}

	// Fetch page
	dataQuery := fmt.Sprintf(
		`SELECT t.id, t.title, t.description, t.skills, t.questions, t.deadline, t.priority, t.status, COALESCE(t.org_id::text, '') as org_id, t.owner_id, u.name as owner_name, t.assigned_to, t.rating, t.points, t.created_at, t.updated_at 
		 FROM tasks t 
		 LEFT JOIN users u ON u.id = t.owner_id 
		 WHERE %s ORDER BY %s LIMIT $%d OFFSET $%d`,
		whereClause, orderBy, argIdx, argIdx+1,
	)
	args = append(args, p.PageSize, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*models.Task
	for rows.Next() {
		t := &models.Task{}
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Skills, &t.Questions, &t.Deadline, &t.Priority, &t.Status, &t.OrgID, &t.OwnerID, &t.OwnerName, &t.AssignedTo, &t.Rating, &t.Points, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}

	totalPages := (total + p.PageSize - 1) / p.PageSize
	return &TaskSearchResult{
		Tasks:      tasks,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: totalPages,
	}, nil
}

func (r *TaskRepository) RateTask(ctx context.Context, taskID string, rating, points int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var assigneeID *string
	var status string
	err = tx.QueryRow(ctx, `SELECT assigned_to, status FROM tasks WHERE id = $1`, taskID).Scan(&assigneeID, &status)
	if err != nil {
		return err
	}

	if assigneeID == nil {
		return errors.New("cannot rate unassigned task")
	}
	if status != string(models.StatusCompleted) {
		return errors.New("only completed tasks can be rated")
	}

	// Make sure it wasn't rated already
	var oldRating *int
	err = tx.QueryRow(ctx, `SELECT rating FROM tasks WHERE id = $1`, taskID).Scan(&oldRating)
	if err != nil {
		return err
	}
	if oldRating != nil {
		return errors.New("task already rated")
	}

	_, err = tx.Exec(ctx, `UPDATE tasks SET rating = $1, points = $2 WHERE id = $3`, rating, points, taskID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		UPDATE users 
		SET total_points = total_points + $1,
		    rating_sum = rating_sum + $2,
		    rating_count = rating_count + 1
		WHERE id = $3
	`, points, rating, *assigneeID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *TaskRepository) CreateReview(ctx context.Context, taskID, reviewerID string, req *models.CreateUserReviewRequest) (*models.UserReview, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var ownerID string
	var assigneeID *string
	var status string
	var oldRating *int
	err = tx.QueryRow(ctx, `
		SELECT owner_id::text, assigned_to::text, status, rating
		FROM tasks
		WHERE id = $1
	`, taskID).Scan(&ownerID, &assigneeID, &status, &oldRating)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	if ownerID != reviewerID {
		return nil, errors.New("unauthorized: only the task owner can review completed work")
	}
	if assigneeID == nil {
		return nil, errors.New("cannot review unassigned task")
	}
	if *assigneeID == reviewerID {
		return nil, errors.New("reviewer cannot review themselves")
	}
	if status != string(models.StatusCompleted) {
		return nil, errors.New("only completed tasks can be reviewed")
	}
	if oldRating != nil {
		return nil, errors.New("task already reviewed")
	}

	review := &models.UserReview{
		TaskID:     taskID,
		ReviewerID: reviewerID,
		RevieweeID: *assigneeID,
		Rating:     req.Rating,
		Points:     req.Points,
		Comment:    strings.TrimSpace(req.Comment),
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO user_reviews (task_id, reviewer_id, reviewee_id, rating, points, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`, review.TaskID, review.ReviewerID, review.RevieweeID, review.Rating, review.Points, review.Comment).
		Scan(&review.ID, &review.CreatedAt)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, `
		UPDATE tasks
		SET rating = $1, points = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`, review.Rating, review.Points, taskID)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, `
		UPDATE users
		SET total_points = total_points + $1,
		    rating_sum = rating_sum + $2,
		    rating_count = rating_count + 1,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`, review.Points, review.Rating, review.RevieweeID)
	if err != nil {
		return nil, err
	}

	err = tx.QueryRow(ctx, `
		SELECT COALESCE(t.title, 'Unavailable task'), COALESCE(u.name, 'Deleted user')
		FROM user_reviews ur
		LEFT JOIN tasks t ON t.id = ur.task_id
		LEFT JOIN users u ON u.id = ur.reviewer_id
		WHERE ur.id = $1
	`, review.ID).Scan(&review.TaskTitle, &review.ReviewerName)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return review, nil
}
