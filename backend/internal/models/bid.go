package models

import "time"

type BidStatus string

const (
	BidPending  BidStatus = "pending"
	BidApproved BidStatus = "approved"
	BidRejected BidStatus = "rejected"
)

type Bid struct {
	ID                  string            `json:"id"`
	TaskID              string            `json:"task_id"`
	BidderID            string            `json:"bidder_id"`
	Message             string            `json:"message"`
	EstimatedCompletion time.Time         `json:"estimated_completion"`
	Status              BidStatus         `json:"status"`
	Answers             map[string]string `json:"answers"`
	ApprovedBy          *string           `json:"approved_by"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
}

type CreateBidRequest struct {
	Message             string            `json:"message" binding:"required,min=10"`
	EstimatedCompletion time.Time         `json:"estimated_completion" binding:"required"`
	Answers             map[string]string `json:"answers" binding:"omitempty"`
}

type BidWithDetails struct {
	Bid
	BidderName         string         `json:"bidder_name"`
	BidderEmail        string         `json:"bidder_email"`
	BidderSkills       []string       `json:"bidder_skills"`
	BidderAvgRating    float64        `json:"bidder_avg_rating"`
	BidderTotalBids    int            `json:"bidder_total_bids"`
	BidderApprovedBids int            `json:"bidder_approved_bids"`
	BidderActiveTasks  int            `json:"bidder_active_tasks"`
	MatchScore         int            `json:"match_score"`
	MatchFactors       map[string]int `json:"match_factors"`
}
