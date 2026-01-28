package repository

import (
	"context"
	"errors"

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
		INSERT INTO tasks (title, description, skills, deadline, priority, status, owner_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.Skills, task.Deadline,
		task.Priority, task.Status, task.OwnerID,
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
