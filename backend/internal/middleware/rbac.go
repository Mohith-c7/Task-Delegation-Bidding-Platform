package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

// RequireRole returns a middleware that allows only the specified roles.
// Must be used after AuthMiddleware (which sets "member_role" in context).
func RequireRole(roles ...models.Role) gin.HandlerFunc {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[string(r)] = true
	}

	return func(c *gin.Context) {
		role, _ := c.Get("member_role")
		roleStr, _ := role.(string)

		if !allowed[roleStr] {
			utils.ErrorResponse(c, 403, "FORBIDDEN: insufficient role")
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireOrgMember ensures the request has a valid org_id in context (set by AuthMiddleware).
func RequireOrgMember() gin.HandlerFunc {
	return func(c *gin.Context) {
		orgID, _ := c.Get("org_id")
		if orgID == nil || orgID == "" {
			utils.ErrorResponse(c, 403, "FORBIDDEN: not a member of any organization")
			c.Abort()
			return
		}
		c.Next()
	}
}
