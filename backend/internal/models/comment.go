package models

import "time"

type Comment struct {
	ID        string    `json:"id" db:"id"`
	TaskID    string    `json:"task_id" db:"task_id"`
	OrgID     *string   `json:"org_id,omitempty" db:"org_id"`
	AuthorID  string    `json:"author_id" db:"author_id"`
	Body      string    `json:"body" db:"body"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	// Joined
	AuthorName string `json:"author_name,omitempty" db:"author_name"`
}
