package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/yourusername/task-delegation-platform/internal/models"
	"github.com/yourusername/task-delegation-platform/internal/repository"
)

var ErrTierLimitExceeded = errors.New("TIER_LIMIT_EXCEEDED")

type BillingService struct {
	billingRepo *repository.BillingRepository
}

func NewBillingService(billingRepo *repository.BillingRepository) *BillingService {
	return &BillingService{billingRepo: billingRepo}
}

func (s *BillingService) GetSubscription(ctx context.Context, orgID string) (*models.Subscription, error) {
	sub, err := s.billingRepo.GetSubscription(ctx, orgID)
	if err != nil {
		return nil, err
	}
	// Auto-create free subscription if none exists
	if sub == nil {
		sub = &models.Subscription{OrgID: orgID, Tier: models.TierFree}
		if err := s.billingRepo.UpsertSubscription(ctx, sub); err != nil {
			return nil, err
		}
	}
	return sub, nil
}

func (s *BillingService) UpdateTier(ctx context.Context, orgID string, tier models.SubscriptionTier) (*models.Subscription, error) {
	sub := &models.Subscription{OrgID: orgID, Tier: tier}
	if err := s.billingRepo.UpsertSubscription(ctx, sub); err != nil {
		return nil, err
	}
	return sub, nil
}

func (s *BillingService) CheckMemberLimit(ctx context.Context, orgID string) error {
	sub, err := s.GetSubscription(ctx, orgID)
	if err != nil {
		return err
	}
	limits := models.TierLimits[sub.Tier]
	if limits.MaxMembers == -1 {
		return nil
	}
	count, err := s.billingRepo.CountActiveMembers(ctx, orgID)
	if err != nil {
		return err
	}
	if count >= limits.MaxMembers {
		return fmt.Errorf("%w: member limit %d reached on %s plan", ErrTierLimitExceeded, limits.MaxMembers, sub.Tier)
	}
	return nil
}

func (s *BillingService) CheckTaskLimit(ctx context.Context, orgID string) error {
	sub, err := s.GetSubscription(ctx, orgID)
	if err != nil {
		return err
	}
	limits := models.TierLimits[sub.Tier]
	if limits.MaxTasks == -1 {
		return nil
	}
	count, err := s.billingRepo.CountActiveTasks(ctx, orgID)
	if err != nil {
		return err
	}
	if count >= limits.MaxTasks {
		return fmt.Errorf("%w: task limit %d reached on %s plan", ErrTierLimitExceeded, limits.MaxTasks, sub.Tier)
	}
	return nil
}
