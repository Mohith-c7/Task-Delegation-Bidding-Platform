package config

import (
	"os"
	"time"
)

type Config struct {
	Port                string
	DatabaseURL         string
	RedisURL            string
	JWTSecret           string
	JWTExpiry           time.Duration
	RefreshTokenExpiry  time.Duration
	AllowedOrigins      string
	Environment         string
}

func Load() *Config {
	return &Config{
		Port:                getEnv("PORT", "8080"),
		DatabaseURL:         getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/taskdb?sslmode=disable"),
		RedisURL:            getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:           getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiry:           parseDuration(getEnv("JWT_EXPIRY", "15m")),
		RefreshTokenExpiry:  parseDuration(getEnv("REFRESH_TOKEN_EXPIRY", "168h")),
		AllowedOrigins:      getEnv("ALLOWED_ORIGINS", "http://localhost:5173"),
		Environment:         getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 15 * time.Minute
	}
	return d
}
