package models

import (
	"encoding/json"
	"time"
)

type AuditEntry struct {
	ID         string          `json:"id" db:"id"`
	OrgID      string          `json:"org_id" db:"org_id"`
	ActorID    *string         `json:"actor_id,omitempty" db:"actor_id"`
	Action     string          `json:"action" db:"action"`
	TargetID   *string         `json:"target_id,omitempty" db:"target_id"`
	TargetType *string         `json:"target_type,omitempty" db:"target_type"`
	Metadata   json.RawMessage `json:"metadata,omitempty" db:"metadata"`
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
	// Joined
	ActorName string `json:"actor_name,omitempty" db:"actor_name"`
}

// Audit action constants
const (
	AuditMemberInvited  = "member_invited"
	AuditMemberRemoved  = "member_removed"
	AuditRoleChanged    = "role_changed"
	AuditOrgUpdated     = "org_updated"
	AuditTierChanged    = "tier_changed"
	AuditInviteRevoked  = "invite_revoked"
)
