package models

import "time"

type ChecklistItem struct {
	ID        string    `json:"id" db:"id"`
	TaskID    string    `json:"task_id" db:"task_id"`
	Title     string    `json:"title" db:"title"`
	IsDone    bool      `json:"is_done" db:"is_done"`
	Position  int       `json:"position" db:"position"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
