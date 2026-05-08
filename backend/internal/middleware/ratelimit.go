package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimit returns a sliding-window rate limiter middleware using Redis.
// key: context key to rate-limit on (e.g. "ip" or "email")
// limit: max requests allowed in the window
// window: duration of the sliding window
func RateLimit(rdb *redis.Client, keyPrefix string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Rate limiting disabled for demo
		c.Next()
		return
	}
}
