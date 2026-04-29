package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
	"github.com/yourusername/task-delegation-platform/internal/services"
	"github.com/yourusername/task-delegation-platform/internal/utils"
	"strconv"
)

type TaskHandler struct {
	taskService *services.TaskService
}

func NewTaskHandler(taskService *services.TaskService) *TaskHandler {
	return &TaskHandler{taskService: taskService}
}

// CreateTask godoc
// @Summary Create task
// @Tags tasks
// @Accept json
// @Produce json
// @Param request body models.CreateTaskRequest true "Create task request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks [post]
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	task, err := h.taskService.CreateTask(c.Request.Context(), &req, userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 201, "Task created successfully", task)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id := c.Param("id")
	task, err := h.taskService.GetTask(c.Request.Context(), id)
	if err != nil {
		utils.ErrorResponse(c, 404, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Task retrieved successfully", task)
}

// GetAllTasks godoc
// @Summary Search and list tasks
// @Tags tasks
// @Produce json
// @Param q query string false "Search query"
// @Param status query string false "Task status"
// @Param priority query string false "Task priority"
// @Param sort query string false "Sort key"
// @Param skills query []string false "Skills filter"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks [get]
func (h *TaskHandler) GetAllTasks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "25"))

	params := repository.TaskSearchParams{
		Query:        c.Query("q"),
		OrgID:        c.Query("org_id"),
		Status:       c.Query("status"),
		Priority:     c.Query("priority"),
		AssignedTo:   c.Query("assigned_to"),
		Creator:      c.Query("creator"),
		Skills:       c.QueryArray("skills"),
		DeadlineFrom: c.Query("deadline_from"),
		DeadlineTo:   c.Query("deadline_to"),
		Sort:         c.Query("sort"),
		Page:         page,
		PageSize:     pageSize,
	}

	result, err := h.taskService.SearchTasks(c.Request.Context(), params)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Tasks retrieved successfully", result)
}

// GetMyTasks godoc
// @Summary Get current user's tasks
// @Tags tasks
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/my [get]
func (h *TaskHandler) GetMyTasks(c *gin.Context) {
	userID, _ := c.Get("user_id")
	tasks, err := h.taskService.GetMyTasks(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Your tasks retrieved successfully", tasks)
}

// UpdateTask godoc
// @Summary Update task
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body models.UpdateTaskRequest true "Update task request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id} [put]
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	task, err := h.taskService.UpdateTask(c.Request.Context(), id, &req, userID.(string))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Task updated successfully", task)
}

// DeleteTask godoc
// @Summary Delete task
// @Tags tasks
// @Produce json
// @Param id path string true "Task ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id} [delete]
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	if err := h.taskService.DeleteTask(c.Request.Context(), id, userID.(string)); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessResponse(c, 200, "Task deleted successfully", nil)
}

// GetTaskDetail returns full task detail with activity, comments, checklist.
// @Summary Get task detail
// @Tags tasks
// @Produce json
// @Param id path string true "Task ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id} [get]
func (h *TaskHandler) GetTaskDetail(c *gin.Context) {
	id := c.Param("id")
	detail, err := h.taskService.GetTaskDetail(c.Request.Context(), id)
	if err != nil {
		utils.ErrorResponse(c, 404, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Task detail retrieved", detail)
}

// TransitionStatus handles PATCH /tasks/:id/status
// @Summary Transition task status
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body object true "Status transition request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/status [patch]
func (h *TaskHandler) TransitionStatus(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	var req struct {
		Status models.TaskStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	task, err := h.taskService.TransitionStatus(c.Request.Context(), id, userID.(string), req.Status)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Task status updated", task)
}

// AddComment handles POST /tasks/:id/comments
// @Summary Add task comment
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body object true "Comment body request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/comments [post]
func (h *TaskHandler) AddComment(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	var req struct {
		Body string `json:"body" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	comment, err := h.taskService.AddComment(c.Request.Context(), id, userID.(string), req.Body)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 201, "Comment added", comment)
}

// UpdateChecklist handles PUT /tasks/:id/checklist
// @Summary Update task checklist
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body object true "Checklist update request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/checklist [put]
func (h *TaskHandler) UpdateChecklist(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Items []models.ChecklistItem `json:"items" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	if err := h.taskService.UpdateChecklist(c.Request.Context(), id, req.Items); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Checklist updated", nil)
}

// RateTask handles POST /tasks/:id/rate
// @Summary Rate completed task
// @Tags tasks
// @Accept json
// @Produce json
// @Param id path string true "Task ID"
// @Param request body models.RateTaskRequest true "Rate task request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /tasks/{id}/rate [post]
func (h *TaskHandler) RateTask(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	var req models.RateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	if err := h.taskService.RateTask(c.Request.Context(), id, userID.(string), req.Rating, req.Points); err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	utils.SuccessResponse(c, 200, "Task rated successfully", nil)
}
