package middleware

import (
	"strings"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

var uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, 401, "Authorization header required")
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.ErrorResponse(c, 401, "Invalid authorization header format")
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := utils.ValidateToken(token, cfg.JWTSecret)
		if err != nil {
			utils.ErrorResponse(c, 401, "Invalid or expired token")
			c.Abort()
			return
		}

		// Reject tokens with non-UUID user IDs (e.g. old hardcoded test IDs)
		if !uuidRegex.MatchString(strings.ToLower(claims.UserID)) {
			utils.ErrorResponse(c, 401, "Invalid token: please log in again")
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("org_id", claims.OrgID)
		c.Set("member_role", claims.Role)

		c.Next()
	}
}
