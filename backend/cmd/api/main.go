package main

import (
	"context"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/handlers"
	"github.com/yourusername/task-delegation-platform/internal/middleware"
	"github.com/yourusername/task-delegation-platform/internal/repository"
	"github.com/yourusername/task-delegation-platform/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	dbPool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}
	defer dbPool.Close()

	// Test database connection
	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatal("Unable to ping database:", err)
	}
	log.Println("✓ Connected to PostgreSQL")

	// Initialize repositories
	userRepo := repository.NewUserRepository(dbPool)
	taskRepo := repository.NewTaskRepository(dbPool)
	bidRepo := repository.NewBidRepository(dbPool)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg)
	taskService := services.NewTaskService(taskRepo)
	bidService := services.NewBidService(bidRepo, taskRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	taskHandler := handlers.NewTaskHandler(taskService)
	bidHandler := handlers.NewBidHandler(bidService)

	// Setup Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORSMiddleware(cfg))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Task Delegation API is running",
		})
	})

	// API routes
	v1 := router.Group("/api/v1")
	{
		// Public routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.GET("/users/me", authHandler.GetMe)

			// Task routes
			protected.POST("/tasks", taskHandler.CreateTask)
			protected.GET("/tasks", taskHandler.GetAllTasks)
			protected.GET("/tasks/my", taskHandler.GetMyTasks)
			protected.GET("/tasks/:id", taskHandler.GetTask)
			protected.PUT("/tasks/:id", taskHandler.UpdateTask)
			protected.DELETE("/tasks/:id", taskHandler.DeleteTask)

			// Bid routes
			protected.POST("/tasks/:id/bids", bidHandler.CreateBid)
			protected.GET("/tasks/:id/bids", bidHandler.GetTaskBids)
			protected.GET("/bids/my", bidHandler.GetMyBids)
			protected.PATCH("/bids/:id/approve", bidHandler.ApproveBid)
			protected.PATCH("/bids/:id/reject", bidHandler.RejectBid)
		}
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Server starting on http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
