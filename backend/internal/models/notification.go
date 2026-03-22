package models

import "time"

type Notification struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"user_id" db:"user_id"`
	OrgID        *string   `json:"org_id,omitempty" db:"org_id"`
	Type         string    `json:"type" db:"type"`
	Title        string    `json:"title" db:"title"`
	Body         string    `json:"body" db:"body"`
	ResourceType *string   `json:"resource_type,omitempty" db:"resource_type"`
	ResourceID   *string   `json:"resource_id,omitempty" db:"resource_id"`
	IsRead       bool      `json:"is_read" db:"is_read"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// NotificationEvent types
const (
	NotifBidPlaced    = "bid_placed"
	NotifBidApproved  = "bid_approved"
	NotifBidRejected  = "bid_rejected"
	NotifTaskAssigned = "task_assigned"
	NotifTaskUpdated  = "task_updated"
	NotifCommentAdded = "comment_added"
	NotifDeadlineSoon = "deadline_soon"
	NotifInvitation   = "invitation"
)
