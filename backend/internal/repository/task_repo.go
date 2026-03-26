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
		INSERT INTO tasks (title, description, skills, deadline, priority, status, owner_id, org_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''))
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.Skills, task.Deadline,
		task.Priority, task.Status, task.OwnerID, task.OrgID,
	).Scan(&task.ID, &task.CreatedAt, &task.UpdatedAt)
}

func (r *TaskRepository) GetByID(ctx context.Context, id string) (*models.Task, error) {
	task := &models.Task{}
	query := `
		SELECT id, title, description, skills, deadline, priority, status, 
		       owner_id, assigned_to, created_at, updated_at
		FROM tasks WHERE id = $1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID, &task.Title, &task.Description, &task.Skills, &task.Deadline,
		&task.Priority, &task.Status, &task.OwnerID, &task.AssignedTo,
		&task.CreatedAt, &task.UpdatedAt,
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
			SELECT id, title, description, skills, deadline, priority, status,
			       owner_id, assigned_to, created_at, updated_at
			FROM tasks WHERE status = $1
			ORDER BY created_at DESC
		`
		rows, err = r.db.Query(ctx, query, status)
	} else {
		query = `
			SELECT id, title, description, skills, deadline, priority, status,
			       owner_id, assigned_to, created_at, updated_at
			FROM tasks
			ORDER BY created_at DESC
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
			&task.ID, &task.Title, &task.Description, &task.Skills, &task.Deadline,
			&task.Priority, &task.Status, &task.OwnerID, &task.AssignedTo,
			&task.CreatedAt, &task.UpdatedAt,
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
		SET title = $1, description = $2, skills = $3, deadline = $4, 
		    priority = $5, status = $6, assigned_to = $7, updated_at = CURRENT_TIMESTAMP
		WHERE id = $8
		RETURNING updated_at
	`
	err := r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.Skills, task.Deadline,
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
		SELECT id, title, description, skills, deadline, priority, status,
		       owner_id, assigned_to, created_at, updated_at
		FROM tasks WHERE owner_id = $1
		ORDER BY created_at DESC
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
			&task.ID, &task.Title, &task.Description, &task.Skills, &task.Deadline,
			&task.Priority, &task.Status, &task.OwnerID, &task.AssignedTo,
			&task.CreatedAt, &task.UpdatedAt,
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
		query = `SELECT id, title, description, skills, deadline, priority, status, COALESCE(org_id, '') as org_id, owner_id, assigned_to, created_at, updated_at FROM tasks WHERE org_id = $1 AND status = $2 ORDER BY created_at DESC`
		args = []interface{}{orgID, status}
	} else {
		query = `SELECT id, title, description, skills, deadline, priority, status, COALESCE(org_id, '') as org_id, owner_id, assigned_to, created_at, updated_at FROM tasks WHERE org_id = $1 ORDER BY created_at DESC`
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
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Skills, &t.Deadline, &t.Priority, &t.Status, &t.OrgID, &t.OwnerID, &t.AssignedTo, &t.CreatedAt, &t.UpdatedAt); err != nil {
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
		`SELECT id, task_id, org_id, actor_id, event_type, field_name, old_value, new_value, created_at FROM activity_feed WHERE task_id = $1 ORDER BY created_at ASC`, id)
	if err == nil {
		defer actRows.Close()
		for actRows.Next() {
			var a models.ActivityEntry
			_ = actRows.Scan(&a.ID, &a.TaskID, &a.OrgID, &a.ActorID, &a.EventType, &a.FieldName, &a.OldValue, &a.NewValue, &a.CreatedAt)
			detail.Activity = append(detail.Activity, a)
		}
	}

	// Comments
	cmtRows, err := r.db.Query(ctx,
		`SELECT id, task_id, org_id, author_id, body, created_at, updated_at FROM comments WHERE task_id = $1 ORDER BY created_at ASC`, id)
	if err == nil {
		defer cmtRows.Close()
		for cmtRows.Next() {
			var c models.Comment
			_ = cmtRows.Scan(&c.ID, &c.TaskID, &c.OrgID, &c.AuthorID, &c.Body, &c.CreatedAt, &c.UpdatedAt)
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
	Query       string
	OrgID       string
	Status      string
	Priority    string
	AssignedTo  string
	Creator     string
	Skills      []string
	DeadlineFrom string
	DeadlineTo   string
	Sort        string // created_at_asc, created_at_desc, deadline_asc, deadline_desc, priority_desc
	Page        int
	PageSize    int
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
		where = append(where, fmt.Sprintf("org_id = $%d", argIdx))
		args = append(args, p.OrgID)
		argIdx++
	}
	if p.Query != "" {
		where = append(where, fmt.Sprintf("search_vector @@ plainto_tsquery('english', $%d)", argIdx))
		args = append(args, p.Query)
		argIdx++
	}
	if p.Status != "" {
		where = append(where, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, p.Status)
		argIdx++
	}
	if p.Priority != "" {
		where = append(where, fmt.Sprintf("priority = $%d", argIdx))
		args = append(args, p.Priority)
		argIdx++
	}
	if p.AssignedTo != "" {
		where = append(where, fmt.Sprintf("assigned_to = $%d", argIdx))
		args = append(args, p.AssignedTo)
		argIdx++
	}
	if p.Creator != "" {
		where = append(where, fmt.Sprintf("owner_id = $%d", argIdx))
		args = append(args, p.Creator)
		argIdx++
	}
	if p.DeadlineFrom != "" {
		where = append(where, fmt.Sprintf("deadline >= $%d", argIdx))
		args = append(args, p.DeadlineFrom)
		argIdx++
	}
	if p.DeadlineTo != "" {
		where = append(where, fmt.Sprintf("deadline <= $%d", argIdx))
		args = append(args, p.DeadlineTo)
		argIdx++
	}

	orderBy := "created_at DESC"
	switch p.Sort {
	case "created_at_asc":
		orderBy = "created_at ASC"
	case "deadline_asc":
		orderBy = "deadline ASC"
	case "deadline_desc":
		orderBy = "deadline DESC"
	case "priority_desc":
		orderBy = "CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC"
	}

	whereClause := strings.Join(where, " AND ")

	// Count total
	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM tasks WHERE %s", whereClause)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, err
	}

	// Fetch page
	dataQuery := fmt.Sprintf(
		`SELECT id, title, description, skills, deadline, priority, status, COALESCE(org_id, '') as org_id, owner_id, assigned_to, created_at, updated_at FROM tasks WHERE %s ORDER BY %s LIMIT $%d OFFSET $%d`,
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
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Skills, &t.Deadline, &t.Priority, &t.Status, &t.OrgID, &t.OwnerID, &t.AssignedTo, &t.CreatedAt, &t.UpdatedAt); err != nil {
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
