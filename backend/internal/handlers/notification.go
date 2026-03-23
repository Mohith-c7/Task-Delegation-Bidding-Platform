package handlers

import (
	"fmt"
	"io"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

type NotificationHandler struct {
	notifService *services.NotificationService
}

func NewNotificationHandler(notifService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{notifService: notifService}
}

// GET /notifications
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	notifications, err := h.notifService.GetHistory(c.Request.Context(), userID.(string), limit, offset)
	if err != nil {
		utils.ErrorResponse(c, 500, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Notifications retrieved", notifications)
}

// PATCH /notifications/:id/read
func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	notifID := c.Param("id")
	if err := h.notifService.MarkRead(c.Request.Context(), notifID, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Notification marked as read", nil)
}

// PATCH /notifications/read-all
func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	if err := h.notifService.MarkAllRead(c.Request.Context(), userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "All notifications marked as read", nil)
}

// GET /notifications/stream — SSE endpoint
func (h *NotificationHandler) Stream(c *gin.Context) {
	userID, _ := c.Get("user_id")

	msgCh, unsubscribe := h.notifService.Subscribe(c.Request.Context(), userID.(string))
	defer unsubscribe()

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-msgCh:
			if !ok {
				return false
			}
			fmt.Fprintf(w, "data: %s\n\n", msg.Payload)
			return true
		case <-c.Request.Context().Done():
			return false
		}
	})
}
