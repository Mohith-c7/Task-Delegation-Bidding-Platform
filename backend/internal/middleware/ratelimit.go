package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/utils"
)

// RateLimit returns a sliding-window rate limiter middleware using Redis.
// key: context key to rate-limit on (e.g. "ip" or "email")
// limit: max requests allowed in the window
// window: duration of the sliding window
func RateLimit(rdb *redis.Client, keyPrefix string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		var keyVal string
		switch keyPrefix {
		case "ip":
			keyVal = c.ClientIP()
		case "email":
			keyVal = c.PostForm("email")
			if keyVal == "" {
				keyVal = c.ClientIP()
			}
		default:
			keyVal = c.ClientIP()
		}

		redisKey := fmt.Sprintf("ratelimit:%s:%s", keyPrefix, keyVal)
		ctx := context.Background()

		pipe := rdb.Pipeline()
		incr := pipe.Incr(ctx, redisKey)
		pipe.Expire(ctx, redisKey, window)
		_, err := pipe.Exec(ctx)

		if err != nil {
			// Redis unavailable — fail open (don't block the request)
			c.Next()
			return
		}

		if incr.Val() > int64(limit) {
			utils.ErrorResponse(c, 429, "RATE_LIMITED: too many requests, please try again later")
			c.Abort()
			return
		}

		c.Next()
	}
}
