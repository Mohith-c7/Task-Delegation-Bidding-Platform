package models

import (
	"time"
)

// Role constants
type Role string

const (
	RoleOrgAdmin Role = "org_admin"
	RoleManager  Role = "manager"
	RoleEmployee Role = "employee"
)

// SubscriptionTier constants
type SubscriptionTier string

const (
	TierFree       SubscriptionTier = "free"
	TierPro        SubscriptionTier = "pro"
	TierEnterprise SubscriptionTier = "enterprise"
)

// TierLimits defines resource limits per subscription tier.
// -1 means unlimited.
var TierLimits = map[SubscriptionTier]struct {
	MaxMembers int
	MaxTasks   int
}{
	TierFree:       {MaxMembers: 5, MaxTasks: 20},
	TierPro:        {MaxMembers: 50, MaxTasks: -1},
	TierEnterprise: {MaxMembers: -1, MaxTasks: -1},
}

// OnboardingStatus constants
type OnboardingStatus string

const (
	OnboardingIncomplete OnboardingStatus = "incomplete"
	OnboardingComplete   OnboardingStatus = "complete"
	OnboardingSkipped    OnboardingStatus = "skipped"
)

// InvitationStatus constants
type InvitationStatus string

const (
	InvitationPending  InvitationStatus = "pending"
	InvitationAccepted InvitationStatus = "accepted"
	InvitationRevoked  InvitationStatus = "revoked"
	InvitationExpired  InvitationStatus = "expired"
)

type Organization struct {
	ID               string           `json:"id" db:"id"`
	Name             string           `json:"name" db:"name"`
	Slug             string           `json:"slug" db:"slug"`
	LogoURL          *string          `json:"logo_url,omitempty" db:"logo_url"`
	OnboardingStatus OnboardingStatus `json:"onboarding_status" db:"onboarding_status"`
	OnboardingStep   int              `json:"onboarding_step" db:"onboarding_step"`
	CreatedAt        time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at" db:"updated_at"`
}

type Membership struct {
	ID        string    `json:"id" db:"id"`
	OrgID     string    `json:"org_id" db:"org_id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Role      Role      `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	// Joined fields
	UserName  string `json:"user_name,omitempty" db:"user_name"`
	UserEmail string `json:"user_email,omitempty" db:"user_email"`
}

type Invitation struct {
	ID         string           `json:"id" db:"id"`
	OrgID      string           `json:"org_id" db:"org_id"`
	InvitedBy  string           `json:"invited_by" db:"invited_by"`
	Email      string           `json:"email" db:"email"`
	Role       Role             `json:"role" db:"role"`
	Token      string           `json:"token,omitempty" db:"token"`
	Status     InvitationStatus `json:"status" db:"status"`
	ExpiresAt  time.Time        `json:"expires_at" db:"expires_at"`
	CreatedAt  time.Time        `json:"created_at" db:"created_at"`
	// Joined fields
	InviterName string `json:"inviter_name,omitempty" db:"inviter_name"`
}

type Subscription struct {
	ID        string           `json:"id" db:"id"`
	OrgID     string           `json:"org_id" db:"org_id"`
	Tier      SubscriptionTier `json:"tier" db:"tier"`
	StartedAt time.Time        `json:"started_at" db:"started_at"`
	RenewsAt  *time.Time       `json:"renews_at,omitempty" db:"renews_at"`
	CreatedAt time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt time.Time        `json:"updated_at" db:"updated_at"`
}
