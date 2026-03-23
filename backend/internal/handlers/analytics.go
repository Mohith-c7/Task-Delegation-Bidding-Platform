package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
	}
}

// GetDashboardAnalytics retrieves comprehensive analytics
func (h *AnalyticsHandler) GetDashboardAnalytics(c *gin.Context) {
	// Get days parameter (default to 30 days)
	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days < 1 || days > 365 {
		days = 30
	}

	analytics, err := h.analyticsService.GetDashboardAnalytics(c.Request.Context(), days)
	if err != nil {
		utils.ErrorResponse(c, 500, "Failed to retrieve analytics: "+err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Analytics retrieved successfully", analytics)
}

// GetUserAnalytics retrieves analytics for the authenticated user
func (h *AnalyticsHandler) GetUserAnalytics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, 401, "Unauthorized")
		return
	}

	analytics, err := h.analyticsService.GetUserAnalytics(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 500, "Failed to retrieve user analytics: "+err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "User analytics retrieved successfully", analytics)
}

// GetOrgDashboard returns org-scoped analytics.
func (h *AnalyticsHandler) GetOrgDashboard(c *gin.Context) {
	orgID := c.Param("id")
	summary, err := h.analyticsService.GetOrgDashboard(c.Request.Context(), orgID)
	if err != nil {
		utils.ErrorResponse(c, 500, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Org analytics retrieved", summary)
}

// GetTrends returns task trends for an org.
func (h *AnalyticsHandler) GetTrends(c *gin.Context) {
	orgID := c.Param("id")
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	if days < 1 || days > 365 {
		days = 30
	}
	trends, err := h.analyticsService.GetTrends(c.Request.Context(), orgID, days)
	if err != nil {
		utils.ErrorResponse(c, 500, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Trends retrieved", trends)
}
