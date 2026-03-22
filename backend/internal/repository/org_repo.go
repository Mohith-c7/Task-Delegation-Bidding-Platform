package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/models"
)

type OrgRepository struct {
	db *pgxpool.Pool
}

func NewOrgRepository(db *pgxpool.Pool) *OrgRepository {
	return &OrgRepository{db: db}
}

// --- Organizations ---

func (r *OrgRepository) CreateOrg(ctx context.Context, org *models.Organization) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO organizations (name, slug, logo_url, onboarding_status, onboarding_step)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, created_at, updated_at`,
		org.Name, org.Slug, org.LogoURL, org.OnboardingStatus, org.OnboardingStep,
	).Scan(&org.ID, &org.CreatedAt, &org.UpdatedAt)
}

func (r *OrgRepository) GetOrgByID(ctx context.Context, id string) (*models.Organization, error) {
	org := &models.Organization{}
	err := r.db.QueryRow(ctx,
		`SELECT id, name, slug, logo_url, onboarding_status, onboarding_step, created_at, updated_at
		 FROM organizations WHERE id = $1`, id,
	).Scan(&org.ID, &org.Name, &org.Slug, &org.LogoURL, &org.OnboardingStatus, &org.OnboardingStep, &org.CreatedAt, &org.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return org, nil
}

func (r *OrgRepository) GetOrgBySlug(ctx context.Context, slug string) (*models.Organization, error) {
	org := &models.Organization{}
	err := r.db.QueryRow(ctx,
		`SELECT id, name, slug, logo_url, onboarding_status, onboarding_step, created_at, updated_at
		 FROM organizations WHERE slug = $1`, slug,
	).Scan(&org.ID, &org.Name, &org.Slug, &org.LogoURL, &org.OnboardingStatus, &org.OnboardingStep, &org.CreatedAt, &org.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return org, nil
}

func (r *OrgRepository) UpdateOrg(ctx context.Context, id string, updates map[string]interface{}) (*models.Organization, error) {
	setClauses := []string{}
	args := []interface{}{}
	i := 1
	for k, v := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", k, i))
		args = append(args, v)
		i++
	}
	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", i))
	args = append(args, time.Now())
	i++
	args = append(args, id)

	query := fmt.Sprintf(
		`UPDATE organizations SET %s WHERE id = $%d
		 RETURNING id, name, slug, logo_url, onboarding_status, onboarding_step, created_at, updated_at`,
		strings.Join(setClauses, ", "), i,
	)
	org := &models.Organization{}
	err := r.db.QueryRow(ctx, query, args...).Scan(
		&org.ID, &org.Name, &org.Slug, &org.LogoURL, &org.OnboardingStatus, &org.OnboardingStep, &org.CreatedAt, &org.UpdatedAt,
	)
	return org, err
}

// --- Memberships ---

func (r *OrgRepository) CreateMembership(ctx context.Context, m *models.Membership) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO memberships (org_id, user_id, role)
		 VALUES ($1, $2, $3)
		 RETURNING id, created_at, updated_at`,
		m.OrgID, m.UserID, m.Role,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *OrgRepository) GetMembership(ctx context.Context, orgID, userID string) (*models.Membership, error) {
	m := &models.Membership{}
	err := r.db.QueryRow(ctx,
		`SELECT id, org_id, user_id, role, created_at, updated_at
		 FROM memberships WHERE org_id = $1 AND user_id = $2`, orgID, userID,
	).Scan(&m.ID, &m.OrgID, &m.UserID, &m.Role, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return m, nil
}

func (r *OrgRepository) ListMembers(ctx context.Context, orgID string) ([]models.Membership, error) {
	rows, err := r.db.Query(ctx,
		`SELECT m.id, m.org_id, m.user_id, m.role, m.created_at, m.updated_at,
		        u.name AS user_name, u.email AS user_email
		 FROM memberships m
		 JOIN users u ON u.id = m.user_id
		 WHERE m.org_id = $1
		 ORDER BY m.created_at ASC`, orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []models.Membership
	for rows.Next() {
		var m models.Membership
		if err := rows.Scan(&m.ID, &m.OrgID, &m.UserID, &m.Role, &m.CreatedAt, &m.UpdatedAt, &m.UserName, &m.UserEmail); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *OrgRepository) RemoveMember(ctx context.Context, orgID, userID string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM memberships WHERE org_id = $1 AND user_id = $2`, orgID, userID)
	return err
}

func (r *OrgRepository) UpdateMemberRole(ctx context.Context, orgID, userID string, role models.Role) error {
	_, err := r.db.Exec(ctx,
		`UPDATE memberships SET role = $1, updated_at = NOW() WHERE org_id = $2 AND user_id = $3`,
		role, orgID, userID,
	)
	return err
}

// --- Invitations ---

func (r *OrgRepository) CreateInvitation(ctx context.Context, inv *models.Invitation) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO invitations (org_id, invited_by, email, role, token, status, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, created_at`,
		inv.OrgID, inv.InvitedBy, inv.Email, inv.Role, inv.Token, inv.Status, inv.ExpiresAt,
	).Scan(&inv.ID, &inv.CreatedAt)
}

func (r *OrgRepository) GetInvitationByToken(ctx context.Context, token string) (*models.Invitation, error) {
	inv := &models.Invitation{}
	err := r.db.QueryRow(ctx,
		`SELECT i.id, i.org_id, i.invited_by, i.email, i.role, i.token, i.status, i.expires_at, i.created_at,
		        u.name AS inviter_name
		 FROM invitations i
		 JOIN users u ON u.id = i.invited_by
		 WHERE i.token = $1`, token,
	).Scan(&inv.ID, &inv.OrgID, &inv.InvitedBy, &inv.Email, &inv.Role, &inv.Token, &inv.Status, &inv.ExpiresAt, &inv.CreatedAt, &inv.InviterName)
	if err != nil {
		return nil, err
	}
	return inv, nil
}

func (r *OrgRepository) ListInvitations(ctx context.Context, orgID string) ([]models.Invitation, error) {
	rows, err := r.db.Query(ctx,
		`SELECT i.id, i.org_id, i.invited_by, i.email, i.role, i.token, i.status, i.expires_at, i.created_at,
		        u.name AS inviter_name
		 FROM invitations i
		 JOIN users u ON u.id = i.invited_by
		 WHERE i.org_id = $1
		 ORDER BY i.created_at DESC`, orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invitations []models.Invitation
	for rows.Next() {
		var inv models.Invitation
		if err := rows.Scan(&inv.ID, &inv.OrgID, &inv.InvitedBy, &inv.Email, &inv.Role, &inv.Token, &inv.Status, &inv.ExpiresAt, &inv.CreatedAt, &inv.InviterName); err != nil {
			return nil, err
		}
		invitations = append(invitations, inv)
	}
	return invitations, nil
}

func (r *OrgRepository) UpdateInvitationStatus(ctx context.Context, id string, status models.InvitationStatus) error {
	_, err := r.db.Exec(ctx, `UPDATE invitations SET status = $1 WHERE id = $2`, status, id)
	return err
}

// --- Audit Log ---

func (r *OrgRepository) CreateAuditEntry(ctx context.Context, entry *models.AuditEntry) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO audit_log (org_id, actor_id, action, target_id, target_type, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, created_at`,
		entry.OrgID, entry.ActorID, entry.Action, entry.TargetID, entry.TargetType, entry.Metadata,
	).Scan(&entry.ID, &entry.CreatedAt)
}

func (r *OrgRepository) ListAuditLog(ctx context.Context, orgID string, limit, offset int) ([]models.AuditEntry, error) {
	rows, err := r.db.Query(ctx,
		`SELECT a.id, a.org_id, a.actor_id, a.action, a.target_id, a.target_type, a.metadata, a.created_at,
		        COALESCE(u.name, 'System') AS actor_name
		 FROM audit_log a
		 LEFT JOIN users u ON u.id = a.actor_id
		 WHERE a.org_id = $1
		 ORDER BY a.created_at DESC
		 LIMIT $2 OFFSET $3`, orgID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.AuditEntry
	for rows.Next() {
		var e models.AuditEntry
		if err := rows.Scan(&e.ID, &e.OrgID, &e.ActorID, &e.Action, &e.TargetID, &e.TargetType, &e.Metadata, &e.CreatedAt, &e.ActorName); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, nil
}
