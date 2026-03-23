package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type BillingHandler struct {
	billingService *services.BillingService
}

func NewBillingHandler(billingService *services.BillingService) *BillingHandler {
	return &BillingHandler{billingService: billingService}
}

// GET /orgs/:id/billing/subscription
func (h *BillingHandler) GetSubscription(c *gin.Context) {
	orgID := c.Param("id")
	sub, err := h.billingService.GetSubscription(c.Request.Context(), orgID)
	if err != nil {
		utils.ErrorResponse(c, 500, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Subscription retrieved", sub)
}

// PUT /orgs/:id/billing/subscription
func (h *BillingHandler) UpdateSubscription(c *gin.Context) {
	orgID := c.Param("id")
	var req struct {
		Tier models.SubscriptionTier `json:"tier" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	sub, err := h.billingService.UpdateTier(c.Request.Context(), orgID, req.Tier)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Subscription updated", sub)
}
