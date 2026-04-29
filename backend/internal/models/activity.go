package models

import "time"

type ActivityEntry struct {
	ID        string    `json:"id" db:"id"`
	TaskID    string    `json:"task_id" db:"task_id"`
	OrgID     *string   `json:"org_id,omitempty" db:"org_id"`
	ActorID   *string   `json:"actor_id,omitempty" db:"actor_id"`
	EventType string    `json:"event_type" db:"event_type"`
	FieldName *string   `json:"field_name,omitempty" db:"field_name"`
	OldValue  *string   `json:"old_value,omitempty" db:"old_value"`
	NewValue  *string   `json:"new_value,omitempty" db:"new_value"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	// Joined
	ActorName string `json:"actor_name,omitempty" db:"actor_name"`
}

// Activity event types
const (
	ActivityCreated             = "task_created"
	ActivityStatusChanged       = "status_changed"
	ActivityFieldUpdated        = "field_updated"
	ActivityBidPlaced           = "bid_placed"
	ActivityBidApproved         = "bid_approved"
	ActivityBidRejected         = "bid_rejected"
	ActivityCommentAdded        = "comment_added"
	ActivityChecklistUpdated    = "checklist_updated"
	ActivityCompletionSubmitted = "completion_submitted"
	ActivityRevisionRequested   = "revision_requested"
	ActivityDisputeOpened       = "dispute_opened"
	ActivityReviewSubmitted     = "review_submitted"
)
