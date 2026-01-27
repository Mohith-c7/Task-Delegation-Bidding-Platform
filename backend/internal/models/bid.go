package models

import "time"

type BidStatus string

const (
	BidStatusPending  BidStatus = "pending"
	BidStatusApproved BidStatus = "approved"
	BidStatusRejected BidStatus = "rejected"
)

type Bid struct {
	ID                  string    `json:"id"`
	TaskID              string    `json:"task_id" binding:"required"`
	BidderID            string    `json:"bidder_id"`
	Message             string    `json:"message" binding:"required"`
	EstimatedCompletion time.Time `json:"estimated_completion" binding:"required"`
	Status              BidStatus `json:"status"`
	ApprovedBy          *string   `json:"approved_by"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type CreateBidRequest struct {
	Message             string    `json:"message" binding:"required"`
	EstimatedCompletion time.Time `json:"estimated_completion" binding:"required"`
}
