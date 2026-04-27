package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/yourusername/task-delegation-platform/internal/config"
	"github.com/yourusername/task-delegation-platform/internal/database"
	"github.com/yourusername/task-delegation-platform/internal/handlers"
	"github.com/yourusername/task-delegation-platform/internal/middleware"
	"github.com/yourusername/task-delegation-platform/internal/models"
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
		log.Fatal("Unable to connect to database:", err)
	}
	log.Println("✓ Connected to PostgreSQL (Neon)")

	// Run auto-migrations
	if err := database.RunMigrations(dbPool); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Connect to Redis (parse full URL with auth)
	redisOpts, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		log.Printf("⚠ Warning: Unable to parse Redis URL: %v\n", err)
		log.Println("  Falling back to localhost:6379")
		redisOpts = &redis.Options{
			Addr: "localhost:6379",
			DB:   0,
		}
	}

	redisClient := redis.NewClient(redisOpts)
	defer redisClient.Close()

	// Test Redis connection
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		log.Fatal("Unable to connect to Redis (Upstash):", err)
	}
	log.Println("✓ Connected to Redis (Upstash)")

	// Initialize repositories
	userRepo := repository.NewUserRepository(dbPool)
	taskRepo := repository.NewTaskRepository(dbPool)
	bidRepo := repository.NewBidRepository(dbPool)
	analyticsRepo := repository.NewAnalyticsRepository(dbPool)
	orgRepo := repository.NewOrgRepository(dbPool)
	billingRepo := repository.NewBillingRepository(dbPool)
	notifRepo := repository.NewNotificationRepository(dbPool)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg)
	authService.SetRedisClient(redisClient)
	taskService := services.NewTaskService(taskRepo)
	bidService := services.NewBidService(bidRepo, taskRepo)
	analyticsService := services.NewAnalyticsService(analyticsRepo)
	orgService := services.NewOrgService(orgRepo, userRepo)
	billingService := services.NewBillingService(billingRepo)
	notifService := services.NewNotificationService(notifRepo, redisClient)

	// Wire billing into org and task services
	orgService.SetBillingService(billingService)
	taskService.SetBillingService(billingService)

	// Wire notifications into bid service
	bidService.SetNotificationService(notifService)

	// Start deadline reminder background job
	notifService.StartDeadlineReminderJob(context.Background())

	// Initialize email and OTP services if Redis is available
	var emailService *services.EmailService
	var otpService *services.OTPService

	if redisClient != nil {
		emailService = services.NewEmailService(cfg)
		otpService = services.NewOTPService(redisClient, emailService)

		// Set services in auth service
		authService.SetEmailService(emailService)
		authService.SetOTPService(otpService)

		log.Println("✓ Email and OTP services initialized")
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	taskHandler := handlers.NewTaskHandler(taskService)
	bidHandler := handlers.NewBidHandler(bidService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	orgHandler := handlers.NewOrgHandlerWithConfig(orgService, cfg)
	billingHandler := handlers.NewBillingHandler(billingService)
	notifHandler := handlers.NewNotificationHandler(notifService)

	var otpHandler *handlers.OTPHandler
	if otpService != nil {
		otpHandler = handlers.NewOTPHandler(otpService, authService)
	}

	// Setup Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORSMiddleware(cfg))
	router.Use(middleware.RateLimit(redisClient, "ip", 100, time.Minute)) // 100 req/min per IP

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
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/verify-email", authHandler.VerifyEmailAndRegister)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)

			// OTP routes (if available)
			if otpHandler != nil {
				auth.POST("/send-otp", otpHandler.SendOTP)
				auth.POST("/verify-otp", otpHandler.VerifyOTP)
				auth.POST("/resend-otp", otpHandler.ResendOTP)
			}
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.GET("/users/me", authHandler.GetMe)
			protected.GET("/users/me/profile", authHandler.GetMyProfile)
			protected.GET("/users/:id/profile", authHandler.GetPublicProfile)
			protected.PUT("/users/me", authHandler.UpdateMe)
			protected.PUT("/users/me/password", authHandler.ChangePassword)
			protected.PUT("/users/me/notifications", authHandler.UpdateNotificationPrefs)
			protected.POST("/auth/logout", authHandler.Logout)

			// Task routes
			protected.POST("/tasks", taskHandler.CreateTask)
			protected.GET("/tasks", taskHandler.GetAllTasks)
			protected.GET("/tasks/my", taskHandler.GetMyTasks)
			protected.GET("/tasks/:id", taskHandler.GetTaskDetail)
			protected.PUT("/tasks/:id", taskHandler.UpdateTask)
			protected.DELETE("/tasks/:id", taskHandler.DeleteTask)
			protected.PATCH("/tasks/:id/status", taskHandler.TransitionStatus)
			protected.POST("/tasks/:id/comments", taskHandler.AddComment)
			protected.PUT("/tasks/:id/checklist", taskHandler.UpdateChecklist)
			protected.POST("/tasks/:id/rate", taskHandler.RateTask)

			// Bid routes
			protected.POST("/tasks/:id/bids", bidHandler.CreateBid)
			protected.GET("/tasks/:id/bids", bidHandler.GetTaskBids)
			protected.GET("/bids/my", bidHandler.GetMyBids)
			protected.PATCH("/bids/:id/approve", bidHandler.ApproveBid)
			protected.PATCH("/bids/:id/reject", bidHandler.RejectBid)

			// Analytics routes
			protected.GET("/analytics/dashboard", analyticsHandler.GetDashboardAnalytics)
			protected.GET("/analytics/me", analyticsHandler.GetUserAnalytics)

			// Notification routes
			protected.GET("/notifications", notifHandler.GetNotifications)
			protected.PATCH("/notifications/read-all", notifHandler.MarkAllRead)
			protected.PATCH("/notifications/:id/read", notifHandler.MarkRead)
			protected.GET("/notifications/stream", notifHandler.Stream)

			// Org routes
			protected.POST("/orgs", orgHandler.CreateOrg)
			protected.POST("/orgs/accept-invitation", orgHandler.AcceptInvitation)

			orgs := protected.Group("/orgs/:id")
			orgs.Use(middleware.RequireOrgMember())
			{
				orgs.GET("", orgHandler.GetOrg)
				orgs.PUT("", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.UpdateOrg)
				orgs.PATCH("/onboarding", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.UpdateOnboarding)

				// Members
				orgs.GET("/members", orgHandler.ListMembers)
				orgs.DELETE("/members/:userID", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.RemoveMember)
				orgs.PATCH("/members/:userID/role", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.ChangeRole)

				// Invitations
				orgs.POST("/invitations", middleware.RequireRole(models.RoleOrgAdmin, models.RoleManager), orgHandler.SendInvitation)
				orgs.GET("/invitations", middleware.RequireRole(models.RoleOrgAdmin, models.RoleManager), orgHandler.ListInvitations)
				orgs.DELETE("/invitations/:invID", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.RevokeInvitation)

				// Audit log (enterprise)
				orgs.GET("/audit-log", middleware.RequireRole(models.RoleOrgAdmin), orgHandler.GetAuditLog)

				// Billing
				orgs.GET("/billing/subscription", billingHandler.GetSubscription)
				orgs.PUT("/billing/subscription", middleware.RequireRole(models.RoleOrgAdmin), billingHandler.UpdateSubscription)

				// Org analytics
				orgs.GET("/analytics", analyticsHandler.GetOrgDashboard)
				orgs.GET("/analytics/trends", analyticsHandler.GetTrends)
			}
		}
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Server starting on http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}