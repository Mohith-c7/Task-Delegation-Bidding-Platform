package middleware

import (
	"context"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

var uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

// AuthMiddleware validates JWT and optionally checks Redis for token invalidation.
// Pass a *redis.Client as the second argument to enable logout invalidation checks.
func AuthMiddleware(cfg *config.Config, redisClient ...*redis.Client) gin.HandlerFunc {
	var rdb *redis.Client
	if len(redisClient) > 0 {
		rdb = redisClient[0]
	}

	return func(c *gin.Context) {
		var token string

		// Standard Bearer token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
			}
		}

		// SSE connections cannot set custom headers — accept token as query param
		if token == "" {
			token = c.Query("token")
		}

		if token == "" {
			utils.ErrorResponse(c, 401, "Authorization required")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(token, cfg.JWTSecret)
		if err != nil {
			utils.ErrorResponse(c, 401, "Invalid or expired token")
			c.Abort()
			return
		}

		// Reject tokens with non-UUID user IDs (guards against old hardcoded test IDs)
		if !uuidRegex.MatchString(strings.ToLower(claims.UserID)) {
			utils.ErrorResponse(c, 401, "Invalid token: please log in again")
			c.Abort()
			return
		}

		// Check if this user's tokens were invalidated after logout
		if rdb != nil {
			key := "token_invalidated:" + claims.UserID
			exists, _ := rdb.Exists(context.Background(), key).Result()
			if exists > 0 {
				utils.ErrorResponse(c, 401, "Session expired, please log in again")
				c.Abort()
				return
			}
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("org_id", claims.OrgID)
		c.Set("member_role", claims.Role)

		c.Next()
	}
}
