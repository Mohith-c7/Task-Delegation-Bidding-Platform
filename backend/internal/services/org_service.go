package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

var (
	ErrOrgNotFound       = errors.New("organization not found")
	ErrMemberNotFound    = errors.New("member not found")
	ErrAlreadyMember     = errors.New("user is already a member")
	ErrInvalidInvitation = errors.New("invitation is invalid or expired")
	ErrForbidden         = errors.New("forbidden")
	ErrEmailMismatch     = errors.New("invitation can only be accepted by the invited email address")
	ErrLastAdmin         = errors.New("organization must keep at least one admin")
)

type OrgService struct {
	orgRepo        *repository.OrgRepository
	userRepo       *repository.UserRepository
	billingService *BillingService
}

func NewOrgService(orgRepo *repository.OrgRepository, userRepo *repository.UserRepository) *OrgService {
	return &OrgService{orgRepo: orgRepo, userRepo: userRepo}
}

func (s *OrgService) SetBillingService(bs *BillingService) {
	s.billingService = bs
}

// slugify converts a name to a URL-safe slug
func slugify(name string) string {
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug := re.ReplaceAllString(strings.ToLower(name), "-")
	return strings.Trim(slug, "-")
}

// generateToken creates a cryptographically random hex token
func generateToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// CreateOrg creates a new organization and assigns the creator as org_admin.
func (s *OrgService) CreateOrg(ctx context.Context, creatorID, name string, logoURL *string) (*models.Organization, error) {
	slug := slugify(name)

	// Ensure slug uniqueness by appending random suffix if needed
	if _, err := s.orgRepo.GetOrgBySlug(ctx, slug); err == nil {
		suffix, _ := generateToken(3)
		slug = fmt.Sprintf("%s-%s", slug, suffix)
	}

	org := &models.Organization{
		Name:             name,
		Slug:             slug,
		LogoURL:          logoURL,
		OnboardingStatus: models.OnboardingIncomplete,
		OnboardingStep:   1,
	}
	if err := s.orgRepo.CreateOrg(ctx, org); err != nil {
		return nil, err
	}

	// Auto-assign creator as org_admin
	membership := &models.Membership{
		OrgID:  org.ID,
		UserID: creatorID,
		Role:   models.RoleOrgAdmin,
	}
	if err := s.orgRepo.CreateMembership(ctx, membership); err != nil {
		return nil, err
	}

	// Create free subscription
	// (billing service handles this — stub here for now)

	// Audit
	actorID := creatorID
	targetType := "organization"
	_ = s.orgRepo.CreateAuditEntry(ctx, &models.AuditEntry{
		OrgID:      org.ID,
		ActorID:    &actorID,
		Action:     models.AuditOrgUpdated,
		TargetID:   &org.ID,
		TargetType: &targetType,
	})

	return org, nil
}

// InviteMember generates an invitation token and stores the invitation.
func (s *OrgService) InviteMember(ctx context.Context, orgID, inviterID, email string, role models.Role) (*models.Invitation, error) {
	// Check member limit before creating invitation
	if s.billingService != nil {
		if err := s.billingService.CheckMemberLimit(ctx, orgID); err != nil {
			return nil, err
		}
	}

	token, err := generateToken(32)
	if err != nil {
		return nil, err
	}

	inv := &models.Invitation{
		OrgID:     orgID,
		InvitedBy: inviterID,
		Email:     email,
		Role:      role,
		Token:     token,
		Status:    models.InvitationPending,
		ExpiresAt: time.Now().Add(72 * time.Hour),
	}
	if err := s.orgRepo.CreateInvitation(ctx, inv); err != nil {
		return nil, err
	}

	// Audit
	targetType := "invitation"
	_ = s.orgRepo.CreateAuditEntry(ctx, &models.AuditEntry{
		OrgID:      orgID,
		ActorID:    &inviterID,
		Action:     models.AuditMemberInvited,
		TargetID:   &inv.ID,
		TargetType: &targetType,
	})

	return inv, nil
}

// AcceptInvitation validates the token and creates a membership.
func (s *OrgService) AcceptInvitation(ctx context.Context, token, userID string) (*models.Membership, error) {
	inv, err := s.orgRepo.GetInvitationByToken(ctx, token)
	if err != nil {
		return nil, ErrInvalidInvitation
	}
	if inv.Status != models.InvitationPending {
		return nil, ErrInvalidInvitation
	}
	if time.Now().After(inv.ExpiresAt) {
		_ = s.orgRepo.UpdateInvitationStatus(ctx, inv.ID, models.InvitationExpired)
		return nil, ErrInvalidInvitation
	}
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if !strings.EqualFold(strings.TrimSpace(user.Email), strings.TrimSpace(inv.Email)) {
		return nil, ErrEmailMismatch
	}

	membership := &models.Membership{
		OrgID:  inv.OrgID,
		UserID: userID,
		Role:   inv.Role,
	}
	if err := s.orgRepo.CreateMembership(ctx, membership); err != nil {
		return nil, err
	}

	_ = s.orgRepo.UpdateInvitationStatus(ctx, inv.ID, models.InvitationAccepted)
	return membership, nil
}

// RevokeInvitation marks an invitation as revoked.
func (s *OrgService) RevokeInvitation(ctx context.Context, orgID, invitationID, actorID string) error {
	err := s.orgRepo.UpdateInvitationStatus(ctx, invitationID, models.InvitationRevoked)
	if err != nil {
		return err
	}
	targetType := "invitation"
	_ = s.orgRepo.CreateAuditEntry(ctx, &models.AuditEntry{
		OrgID:      orgID,
		ActorID:    &actorID,
		Action:     models.AuditInviteRevoked,
		TargetID:   &invitationID,
		TargetType: &targetType,
	})
	return nil
}

// RemoveMember removes a user from the org.
func (s *OrgService) RemoveMember(ctx context.Context, orgID, userID, actorID string) error {
	if err := s.ensureNotLastAdmin(ctx, orgID, userID, "remove"); err != nil {
		return err
	}
	if err := s.orgRepo.RemoveMember(ctx, orgID, userID); err != nil {
		return err
	}
	targetType := "user"
	_ = s.orgRepo.CreateAuditEntry(ctx, &models.AuditEntry{
		OrgID:      orgID,
		ActorID:    &actorID,
		Action:     models.AuditMemberRemoved,
		TargetID:   &userID,
		TargetType: &targetType,
	})
	return nil
}

// ChangeRole updates a member's role and records audit entry.
func (s *OrgService) ChangeRole(ctx context.Context, orgID, userID string, newRole models.Role, actorID string) error {
	if newRole != models.RoleOrgAdmin {
		if err := s.ensureNotLastAdmin(ctx, orgID, userID, "change_role"); err != nil {
			return err
		}
	}
	if err := s.orgRepo.UpdateMemberRole(ctx, orgID, userID, newRole); err != nil {
		return err
	}
	targetType := "user"
	_ = s.orgRepo.CreateAuditEntry(ctx, &models.AuditEntry{
		OrgID:      orgID,
		ActorID:    &actorID,
		Action:     models.AuditRoleChanged,
		TargetID:   &userID,
		TargetType: &targetType,
	})
	return nil
}

// CompleteOnboarding marks the org onboarding as complete or skipped.
func (s *OrgService) CompleteOnboarding(ctx context.Context, orgID string, status models.OnboardingStatus) (*models.Organization, error) {
	return s.orgRepo.UpdateOrg(ctx, orgID, map[string]interface{}{
		"onboarding_status": string(status),
	})
}

// GetAuditLog returns paginated audit log entries for an org.
func (s *OrgService) GetAuditLog(ctx context.Context, orgID string, limit, offset int) ([]models.AuditEntry, error) {
	return s.orgRepo.ListAuditLog(ctx, orgID, limit, offset)
}

// GetOrgByID returns an organization by ID.
func (s *OrgService) GetOrgByID(ctx context.Context, id string) (*models.Organization, error) {
	return s.orgRepo.GetOrgByID(ctx, id)
}

// UpdateOrg updates org fields.
func (s *OrgService) UpdateOrg(ctx context.Context, id string, updates map[string]interface{}) (*models.Organization, error) {
	return s.orgRepo.UpdateOrg(ctx, id, updates)
}

// ListMembers returns all members of an org.
func (s *OrgService) ListMembers(ctx context.Context, orgID string) ([]models.Membership, error) {
	return s.orgRepo.ListMembers(ctx, orgID)
}

// ListInvitations returns all invitations for an org.
func (s *OrgService) ListInvitations(ctx context.Context, orgID string) ([]models.Invitation, error) {
	return s.orgRepo.ListInvitations(ctx, orgID)
}

func (s *OrgService) ensureNotLastAdmin(ctx context.Context, orgID, targetUserID, action string) error {
	members, err := s.orgRepo.ListMembers(ctx, orgID)
	if err != nil {
		return err
	}
	adminCount := 0
	targetIsAdmin := false
	for _, member := range members {
		if member.Role == models.RoleOrgAdmin {
			adminCount++
			if member.UserID == targetUserID {
				targetIsAdmin = true
			}
		}
	}
	if targetIsAdmin && adminCount <= 1 {
		return fmt.Errorf("%w: cannot %s the last org admin", ErrLastAdmin, action)
	}
	return nil
}
