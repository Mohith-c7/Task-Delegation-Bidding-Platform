package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type OrgHandler struct {
	orgService *services.OrgService
	cfg        *config.Config
}

func NewOrgHandler(orgService *services.OrgService) *OrgHandler {
	return &OrgHandler{orgService: orgService}
}

func NewOrgHandlerWithConfig(orgService *services.OrgService, cfg *config.Config) *OrgHandler {
	return &OrgHandler{orgService: orgService, cfg: cfg}
}

// POST /orgs
func (h *OrgHandler) CreateOrg(c *gin.Context) {
	var req struct {
		Name    string  `json:"name" binding:"required"`
		LogoURL *string `json:"logo_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")
	userEmail := c.GetString("user_email")
	org, err := h.orgService.CreateOrg(c.Request.Context(), userID, req.Name, req.LogoURL)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Mint a fresh access token that includes the new org_id + role
	// so the frontend can use it immediately without re-login
	var newAccessToken string
	if h.cfg != nil {
		newAccessToken, _ = utils.GenerateAccessToken(userID, userEmail, org.ID, string(models.RoleOrgAdmin), h.cfg.JWTSecret)
	}

	utils.SuccessResponse(c, http.StatusCreated, "Organization created", gin.H{
		"org":          org,
		"access_token": newAccessToken,
	})
}

// GET /orgs/:id
func (h *OrgHandler) GetOrg(c *gin.Context) {
	orgID := c.GetString("org_id")
	if orgID == "" {
		orgID = c.Param("id")
	}
	// Org is already loaded via middleware in most cases; re-fetch for freshness
	org, err := h.orgService.GetOrgByID(c.Request.Context(), orgID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Organization not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "OK", org)
}

// PUT /orgs/:id
func (h *OrgHandler) UpdateOrg(c *gin.Context) {
	var req struct {
		Name    *string `json:"name"`
		LogoURL *string `json:"logo_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	orgID := c.GetString("org_id")
	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.LogoURL != nil {
		updates["logo_url"] = *req.LogoURL
	}
	if len(updates) == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "no fields to update")
		return
	}

	org, err := h.orgService.UpdateOrg(c.Request.Context(), orgID, updates)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Organization updated", org)
}

// GET /orgs/:id/members
func (h *OrgHandler) ListMembers(c *gin.Context) {
	orgID := c.GetString("org_id")
	members, err := h.orgService.ListMembers(c.Request.Context(), orgID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "OK", members)
}

// DELETE /orgs/:id/members/:userID
func (h *OrgHandler) RemoveMember(c *gin.Context) {
	orgID := c.GetString("org_id")
	actorID := c.GetString("user_id")
	targetUserID := c.Param("userID")

	if err := h.orgService.RemoveMember(c.Request.Context(), orgID, targetUserID, actorID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Member removed", nil)
}

// PATCH /orgs/:id/members/:userID/role
func (h *OrgHandler) ChangeRole(c *gin.Context) {
	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	orgID := c.GetString("org_id")
	actorID := c.GetString("user_id")
	targetUserID := c.Param("userID")

	if err := h.orgService.ChangeRole(c.Request.Context(), orgID, targetUserID, models.Role(req.Role), actorID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Role updated", nil)
}

// POST /orgs/:id/invitations
func (h *OrgHandler) SendInvitation(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
		Role  string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	orgID := c.GetString("org_id")
	inviterID := c.GetString("user_id")

	inv, err := h.orgService.InviteMember(c.Request.Context(), orgID, inviterID, req.Email, models.Role(req.Role))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Invitation sent", inv)
}

// GET /orgs/:id/invitations
func (h *OrgHandler) ListInvitations(c *gin.Context) {
	orgID := c.GetString("org_id")
	invitations, err := h.orgService.ListInvitations(c.Request.Context(), orgID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "OK", invitations)
}

// DELETE /orgs/:id/invitations/:invID
func (h *OrgHandler) RevokeInvitation(c *gin.Context) {
	orgID := c.GetString("org_id")
	actorID := c.GetString("user_id")
	invID := c.Param("invID")

	if err := h.orgService.RevokeInvitation(c.Request.Context(), orgID, invID, actorID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Invitation revoked", nil)
}

// POST /orgs/accept-invitation
func (h *OrgHandler) AcceptInvitation(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")
	membership, err := h.orgService.AcceptInvitation(c.Request.Context(), req.Token, userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Invitation accepted", membership)
}

// PATCH /orgs/:id/onboarding
func (h *OrgHandler) UpdateOnboarding(c *gin.Context) {
	var req struct {
		Status string `json:"status" binding:"required"`
		Step   *int   `json:"step"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	orgID := c.GetString("org_id")
	org, err := h.orgService.CompleteOnboarding(c.Request.Context(), orgID, models.OnboardingStatus(req.Status))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Onboarding updated", org)
}

// GET /orgs/:id/audit-log
func (h *OrgHandler) GetAuditLog(c *gin.Context) {
	orgID := c.GetString("org_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, err := h.orgService.GetAuditLog(c.Request.Context(), orgID, limit, offset)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "OK", entries)
}

// Helper wrappers so handler can call service methods not exposed via interface
func (h *OrgHandler) getOrgByID(id string) (*models.Organization, error) {
	return h.orgService.GetOrgByID(context.Background(), id)
}
