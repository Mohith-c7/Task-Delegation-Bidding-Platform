package services

import (
	"context"
	"time"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

type AnalyticsService struct {
	analyticsRepo *repository.AnalyticsRepository
}

func NewAnalyticsService(analyticsRepo *repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{
		analyticsRepo: analyticsRepo,
	}
}

// GetDashboardAnalytics retrieves comprehensive analytics for the dashboard
func (s *AnalyticsService) GetDashboardAnalytics(ctx context.Context, days int) (*models.AnalyticsResponse, error) {
	// Get summary
	summary, err := s.analyticsRepo.GetSummary(ctx)
	if err != nil {
		return nil, err
	}

	// Get task trends
	trends, err := s.analyticsRepo.GetTaskTrends(ctx, days)
	if err != nil {
		return nil, err
	}

	// Get top bidders
	topBidders, err := s.analyticsRepo.GetTopBidders(ctx, 10)
	if err != nil {
		return nil, err
	}

	// Get top task owners
	topOwners, err := s.analyticsRepo.GetTopTaskOwners(ctx, 10)
	if err != nil {
		return nil, err
	}

	// Get skill demands
	skillDemands, err := s.analyticsRepo.GetSkillDemands(ctx, 10)
	if err != nil {
		return nil, err
	}

	return &models.AnalyticsResponse{
		Summary:       *summary,
		TaskTrends:    trends,
		TopBidders:    topBidders,
		TopTaskOwners: topOwners,
		SkillDemands:  skillDemands,
		GeneratedAt:   time.Now(),
	}, nil
}

// GetUserAnalytics retrieves analytics for a specific user
func (s *AnalyticsService) GetUserAnalytics(ctx context.Context, userID string) (*models.UserAnalytics, error) {
	return s.analyticsRepo.GetUserAnalytics(ctx, userID)
}
