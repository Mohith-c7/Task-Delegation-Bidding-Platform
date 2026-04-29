package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type BidHandler struct {
	bidService *services.BidService
}

func NewBidHandler(bidService *services.BidService) *BidHandler {
	return &BidHandler{bidService: bidService}
}

// CreateBid godoc
// @Summary Place bid on task
// @Tags bids
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body models.CreateBidRequest true "Create bid request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/bids [post]
func (h *BidHandler) CreateBid(c *gin.Context) {
	taskID := c.Param("id")
	var req models.CreateBidRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	bid, err := h.bidService.CreateBid(c.Request.Context(), taskID, &req, userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 201, "Bid placed successfully", bid)
}

// GetTaskBids godoc
// @Summary List bids for task
// @Tags bids
// @Produce json
// @Param id path string true "Task ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/bids [get]
func (h *BidHandler) GetTaskBids(c *gin.Context) {
	taskID := c.Param("id")
	bids, err := h.bidService.GetTaskBids(c.Request.Context(), taskID)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bids retrieved successfully", bids)
}

// GetMyBids godoc
// @Summary List current user's bids
// @Tags bids
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /bids/my [get]
func (h *BidHandler) GetMyBids(c *gin.Context) {
	userID, _ := c.Get("user_id")
	bids, err := h.bidService.GetMyBids(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Your bids retrieved successfully", bids)
}

// ApproveBid godoc
// @Summary Approve a bid
// @Tags bids
// @Produce json
// @Param id path string true "Bid ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /bids/{id}/approve [patch]
func (h *BidHandler) ApproveBid(c *gin.Context) {
	bidID := c.Param("id")
	userID, _ := c.Get("user_id")

	if err := h.bidService.ApproveBid(c.Request.Context(), bidID, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bid approved successfully", nil)
}

// RejectBid godoc
// @Summary Reject a bid
// @Tags bids
// @Produce json
// @Param id path string true "Bid ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /bids/{id}/reject [patch]
func (h *BidHandler) RejectBid(c *gin.Context) {
	bidID := c.Param("id")
	userID, _ := c.Get("user_id")

	if err := h.bidService.RejectBid(c.Request.Context(), bidID, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bid rejected successfully", nil)
}
