package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"net/http"
	"strings"
)

func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	normalize := func(o string) string {
		o = strings.TrimSpace(o)
		// Browsers send Origin without a trailing slash. Normalize config values too.
		o = strings.TrimRight(o, "/")
		return o
	}

	allowed := make(map[string]struct{})
	allowAny := false
	for _, o := range strings.Split(cfg.AllowedOrigins, ",") {
		origin := normalize(o)
		if origin == "" {
			continue
		}
		if origin == "*" {
			allowAny = true
			continue
		}
		allowed[origin] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := normalize(c.Request.Header.Get("Origin"))
		if origin != "" {
			if allowAny {
				// With credentials, we must echo a specific origin (not "*").
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				c.Writer.Header().Set("Vary", "Origin")
			} else {
				if _, ok := allowed[origin]; ok {
					c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
					c.Writer.Header().Set("Vary", "Origin")
				}
			}
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
