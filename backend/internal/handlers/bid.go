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

func (h *BidHandler) GetTaskBids(c *gin.Context) {
	taskID := c.Param("id")
	bids, err := h.bidService.GetTaskBids(c.Request.Context(), taskID)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bids retrieved successfully", bids)
}

func (h *BidHandler) GetMyBids(c *gin.Context) {
	userID, _ := c.Get("user_id")
	bids, err := h.bidService.GetMyBids(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Your bids retrieved successfully", bids)
}

func (h *BidHandler) ApproveBid(c *gin.Context) {
	bidID := c.Param("id")
	userID, _ := c.Get("user_id")

	if err := h.bidService.ApproveBid(c.Request.Context(), bidID, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bid approved successfully", nil)
}

func (h *BidHandler) RejectBid(c *gin.Context) {
	bidID := c.Param("id")
	userID, _ := c.Get("user_id")

	if err := h.bidService.RejectBid(c.Request.Context(), bidID, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Bid rejected successfully", nil)
}
