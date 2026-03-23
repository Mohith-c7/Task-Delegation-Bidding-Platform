# Implementation Plan: SaaS Platform Transformation

## Overview

Incremental implementation from foundational design system through multi-tenant backend, billing, notifications, and advanced frontend features. Each task builds on the previous, ending with full integration and property-based test coverage.

## Tasks

- [x] 1. Design system foundation
  - [x] 1.1 Create `frontend/src/design-system/tokens.css` with all CSS custom properties
  - [x] 1.2 Extend `frontend/tailwind.config.js` to consume design tokens
  - [x] 1.3 Implement `Button` component
  - [x] 1.4 Implement `Card`, `Badge`, `Avatar`, `Skeleton`, `EmptyState` components
  - [x] 1.5 Implement `Input` component with label, helper text, and error state
  - [x] 1.6 Implement `Modal` component (desktop modal / mobile bottom sheet)
  - [x] 1.7 Implement `Toast` notification component with swipe-to-dismiss
  - [x] 1.8 Create `frontend/src/design-system/index.ts` barrel export

  - [ ] 1.5 Implement `Input` component with label, helper text, and error state
    - Controlled component; accessible label association; error styling using `--color-error`
    - _Requirements: 11.8_

  - [ ] 1.6 Implement `Modal` component (desktop modal / mobile bottom sheet)
    - Detects viewport width; renders as bottom sheet on < 768px; focus trap; ESC to close
    - 200ms open/close transition using `--transition-normal`
    - _Requirements: 11.5, 11.8, 12.4_

  - [ ] 1.7 Implement `Toast` notification component with swipe-to-dismiss
    - Auto-dismiss after 4s; swipe-to-dismiss on mobile; stacking support; success/error/info variants
    - Wire to a global toast context/store so any component can trigger toasts
    - _Requirements: 11.8, 11.11, 12.6_

  - [ ] 1.8 Create `frontend/src/design-system/index.ts` barrel export
    - _Requirements: 11.8_

  - [ ]* 1.9 Write unit tests for design system components
    - Test Button variants, disabled/loading states; Modal open/close; Toast auto-dismiss; Badge variants
    - _Requirements: 11.8_


- [ ] 2. Redesign existing pages with design system
  - [ ] 2.1 Redesign `frontend/src/components/common/Layout.tsx` with sidebar + bottom nav
    - Collapsible desktop sidebar with nav links; bottom navigation bar on mobile (< 768px)
    - Notification bell icon placeholder in header; responsive breakpoints at 768px and 1200px
    - _Requirements: 11.6, 11.7, 12.2_

  - [ ] 2.2 Create `frontend/src/components/common/Sidebar.tsx` and `BottomNav.tsx`
    - Sidebar: collapsible, role-aware nav items (hide admin links for employees)
    - BottomNav: Dashboard, Tasks, Bids, Notifications icons with labels; 44px touch targets
    - _Requirements: 2.8, 11.7, 12.2, 12.5_

  - [ ] 2.3 Redesign `Login.tsx` and `Register.tsx` pages
    - Use `Input`, `Button`, `Card` components; replace `alert()` with Toast
    - Register page: add org create vs. join choice UI (join path shows invitation token field)
    - Skeleton loading states; form validation with inline error messages
    - _Requirements: 1.2, 11.9, 11.10, 11.11_

  - [ ] 2.4 Redesign `Dashboard.tsx` page
    - Stats cards using `Card` + `Badge`; skeleton loaders; empty state when no tasks
    - Onboarding progress banner (shown when org onboarding status is incomplete)
    - _Requirements: 5.5, 11.9, 11.10, 11.12_

  - [ ] 2.5 Redesign `MyTasks.tsx`, `MyBids.tsx`, `Analytics.tsx`, `MyAnalytics.tsx`
    - Apply design system components throughout; replace spinners with `Skeleton`
    - Empty states with contextual messages and CTA buttons; Toast for all actions
    - _Requirements: 11.9, 11.10, 11.11, 11.12_

  - [ ]* 2.6 Write unit tests for redesigned pages
    - Test skeleton rendering during loading; empty state rendering; Toast on action
    - _Requirements: 11.9, 11.10, 11.11, 11.12_


- [x] 3. Database migrations
  - [x] 3.1 Create migration `000007_create_organizations.up.sql`
  - [x] 3.2 Create migration `000008_create_memberships.up.sql`
  - [x] 3.3 Create migration `000009_create_invitations.up.sql`
  - [x] 3.4 Create migration `000010_create_subscriptions.up.sql`
  - [x] 3.5 Create migration `000011_create_notifications.up.sql`
  - [x] 3.6 Create migration `000012_create_activity_feed.up.sql`
  - [x] 3.7 Create migration `000013_create_comments.up.sql`
  - [x] 3.8 Create migration `000014_create_checklist_items.up.sql`
  - [x] 3.9 Create migration `000015_create_audit_log.up.sql`
  - [x] 3.10 Create migration `000016_alter_existing_tables.up.sql`
  - [x] 3.11 Update `backend/internal/database/migrate.go`

- [x] 4. Go models and JWT extension
  - [x] 4.1 Create `backend/internal/models/org.go`
  - [x] 4.2 Create notification, activity, comment, checklist, audit models
  - [x] 4.3 Extend `backend/internal/utils/jwt.go` with org/role claims

- [x] 5. RBAC middleware and auth middleware extension
  - [x] 5.1 Create `backend/internal/middleware/rbac.go`
  - [x] 5.2 Implement `RequireRole` middleware helper
  - [x] 5.3 Create `backend/internal/middleware/ratelimit.go`
  - [x] 5.4 Update `backend/internal/middleware/auth.go`

- [x] 6. Checkpoint — ensure migrations apply cleanly and middleware compiles

- [x] 7. Organization service and handlers
  - [x] 7.1 Create `backend/internal/repository/org_repo.go`
  - [x] 7.2 Create `backend/internal/services/org_service.go`
  - [x] 7.3 Create `backend/internal/handlers/org.go`
  - [x] 7.4 Register org routes in `backend/cmd/api/main.go`
    - `organizations` table: id (UUID PK), name, slug (UNIQUE), logo_url, onboarding_status (CHECK), onboarding_step, created_at, updated_at
    - Index on slug; corresponding `.down.sql`
    - _Requirements: 1.1_

  - [ ] 3.2 Create migration `000008_create_memberships.up.sql`
    - `memberships` table: id, org_id (FK → organizations), user_id (FK → users), role (CHECK: org_admin/manager/employee), created_at, updated_at; UNIQUE(org_id, user_id)
    - Indexes on org_id and user_id; corresponding `.down.sql`
    - _Requirements: 1.3, 2.1_

  - [ ] 3.3 Create migration `000009_create_invitations.up.sql`
    - `invitations` table: id, org_id, invited_by, email, role, token (UNIQUE), status (CHECK), expires_at, created_at
    - Indexes on token and org_id; corresponding `.down.sql`
    - _Requirements: 3.1_

  - [ ] 3.4 Create migration `000010_create_subscriptions.up.sql`
    - `subscriptions` table: id, org_id (UNIQUE FK), tier (CHECK: free/pro/enterprise), started_at, renews_at, created_at, updated_at
    - Corresponding `.down.sql`
    - _Requirements: 4.1, 4.7_

  - [ ] 3.5 Create migration `000011_create_notifications.up.sql`
    - `notifications` table: id, user_id, org_id, type, title, body, resource_type, resource_id, is_read, created_at
    - Indexes on (user_id, is_read) and created_at DESC; corresponding `.down.sql`
    - _Requirements: 6.10_

  - [ ] 3.6 Create migration `000012_create_activity_feed.up.sql`
    - `activity_feed` table: id, task_id, org_id, actor_id, event_type, old_value, new_value, field_name, created_at
    - Index on (task_id, created_at DESC); corresponding `.down.sql`
    - _Requirements: 7.3_

  - [ ] 3.7 Create migration `000013_create_comments.up.sql`
    - `comments` table: id, task_id, org_id, author_id, body, created_at, updated_at
    - Index on (task_id, created_at ASC); corresponding `.down.sql`
    - _Requirements: 7.5_

  - [ ] 3.8 Create migration `000014_create_checklist_items.up.sql`
    - `checklist_items` table: id, task_id, title, is_done, position, created_at
    - Index on (task_id, position ASC); corresponding `.down.sql`
    - _Requirements: 7.8_

  - [ ] 3.9 Create migration `000015_create_audit_log.up.sql`
    - `audit_log` table: id, org_id, actor_id, action, target_id, target_type, metadata (JSONB), created_at
    - Index on (org_id, created_at DESC); corresponding `.down.sql`
    - _Requirements: 13.9_

  - [ ] 3.10 Create migration `000016_alter_existing_tables.up.sql`
    - Add `org_id` (UUID FK → organizations) to `tasks` table; index on tasks(org_id)
    - Add `search_vector` tsvector generated column to tasks; GIN index for full-text search
    - Add `skills TEXT[]`, `avatar_url TEXT`, `notif_prefs JSONB` columns to `users` table
    - Corresponding `.down.sql`
    - _Requirements: 8.1, 10.1, 10.3, 10.4_

  - [ ] 3.11 Update `backend/internal/database/migrate.go` to register all new migrations
    - _Requirements: 1.1_


- [ ] 4. Go models and JWT extension
  - [ ] 4.1 Create `backend/internal/models/org.go`
    - Define `Organization`, `Membership`, `Role` (org_admin/manager/employee constants), `Invitation`, `Subscription`, `SubscriptionTier` types
    - Define `TierLimits` map: free (5 members, 20 tasks), pro (50 members, unlimited), enterprise (unlimited)
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [ ] 4.2 Create `backend/internal/models/notification.go`, `activity.go`, `comment.go`, `checklist.go`, `audit.go`
    - `Notification`, `NotificationEvent`, `ActivityEntry`, `Comment`, `ChecklistItem`, `AuditEntry` structs
    - _Requirements: 6.10, 7.3, 7.5, 7.8, 13.9_

  - [ ] 4.3 Extend `backend/internal/utils/jwt.go` with org/role claims
    - Add `OrgID` and `Role` fields to `Claims` struct
    - Update `GenerateAccessToken` to accept and embed org_id and role
    - Access token lifetime: 15 min; refresh token lifetime: 7 days
    - _Requirements: 1.5, 13.6_

  - [ ]* 4.4 Write property test for JWT token expiry (Property 36)
    - **Property 36: JWT tokens have correct expiry**
    - **Validates: Requirements 13.6**

  - [ ]* 4.5 Write property test for password validation (Property 33)
    - **Property 33: Password validation rejects non-compliant passwords**
    - **Validates: Requirements 13.1**


- [ ] 5. RBAC middleware and auth middleware extension
  - [ ] 5.1 Create `backend/internal/middleware/rbac.go`
    - `OrgMiddleware`: reads org_id + role from JWT claims, loads membership from DB (or Redis cache), attaches org_id/role/subscription_tier to Gin context
    - Returns 403 with code `FORBIDDEN` if membership not found
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ] 5.2 Implement `RequireRole(roles ...Role)` middleware helper
    - Reads `member_role` from Gin context; returns 403 if role not in allowed list
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 5.3 Create `backend/internal/middleware/ratelimit.go`
    - Redis sliding window rate limiter: `RateLimit(key, limit, window)` gin.HandlerFunc
    - Login: 10 attempts / 15 min per IP; OTP send: 3 requests / 10 min per email
    - Returns 429 with code `RATE_LIMITED` when exceeded
    - _Requirements: 13.2, 13.3_

  - [ ] 5.4 Update `backend/internal/middleware/auth.go` to validate org/role claims
    - After JWT validation, call token invalidation check in Redis (for role-change invalidation)
    - _Requirements: 2.7, 13.6_

  - [ ]* 5.5 Write property test for RBAC permissions (Property 5)
    - **Property 5: RBAC permissions are enforced by role**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 5.6 Write property test for JWT context resolution (Property 4)
    - **Property 4: JWT context resolution**
    - **Validates: Requirements 1.5**

  - [ ]* 5.7 Write property test for rate limiting (Property 34)
    - **Property 34: Rate limiting blocks excess requests**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 6. Checkpoint — ensure migrations apply cleanly and middleware compiles
  - Run `go build ./...` in backend; verify no compile errors
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 7. Organization service and handlers
  - [ ] 7.1 Create `backend/internal/repository/org_repo.go`
    - CRUD for organizations, memberships, invitations, audit_log
    - Methods: `CreateOrg`, `GetOrgByID`, `GetOrgBySlug`, `UpdateOrg`, `CreateMembership`, `GetMembership`, `ListMembers`, `RemoveMember`, `UpdateMemberRole`, `CreateInvitation`, `GetInvitationByToken`, `ListInvitations`, `UpdateInvitationStatus`, `CreateAuditEntry`, `ListAuditLog`
    - _Requirements: 1.1, 1.3, 3.1, 3.6, 13.9_

  - [ ] 7.2 Create `backend/internal/services/org_service.go`
    - Implement `OrgService` interface: CreateOrg (auto-assigns org_admin), InviteMember (generates unique token, 72h expiry), AcceptInvitation (validates token, creates membership, marks token used), RevokeInvitation, RemoveMember (cascades tasks + bids), ChangeRole (calls `InvalidateUserTokens`), CompleteOnboarding, GetAuditLog
    - _Requirements: 1.1, 1.3, 2.7, 3.1, 3.4, 3.5, 3.7, 3.8, 5.3, 5.4, 13.9_

  - [ ] 7.3 Create `backend/internal/handlers/org.go`
    - Handlers for all `/orgs/*` endpoints; apply `RequireRole` guards per endpoint
    - Wire invitation email via `NotificationService.SendInvitationEmail`
    - _Requirements: 1.1, 2.2, 3.1, 3.6, 3.7_

  - [ ] 7.4 Register org routes in `backend/cmd/api/main.go`
    - Mount org routes under `/api/v1/orgs` with `OrgMiddleware` applied to protected routes
    - _Requirements: 1.4_

  - [ ]* 7.5 Write property test for organization creation (Property 1)
    - **Property 1: Organization creation stores all required fields**
    - **Validates: Requirements 1.1**

  - [ ]* 7.6 Write property test for org creator receives org_admin role (Property 2)
    - **Property 2: Organization creator receives org_admin role**
    - **Validates: Requirements 1.3**

  - [ ]* 7.7 Write property test for data isolation between organizations (Property 3)
    - **Property 3: Data isolation between organizations**
    - **Validates: Requirements 1.4, 1.6**

  - [ ]* 7.8 Write property test for invitation tokens (Property 7)
    - **Property 7: Invitation tokens are unique and expire correctly**
    - **Validates: Requirements 3.1**

  - [ ]* 7.9 Write property test for invitation acceptance (Property 8)
    - **Property 8: Invitation acceptance creates membership with correct role**
    - **Validates: Requirements 3.4, 3.5**

  - [ ]* 7.10 Write property test for invitation listing completeness (Property 9)
    - **Property 9: Invitation listing is complete**
    - **Validates: Requirements 3.6**

  - [ ]* 7.11 Write property test for invitation revocation (Property 10)
    - **Property 10: Invitation revocation prevents acceptance**
    - **Validates: Requirements 3.7**

  - [ ]* 7.12 Write property test for member removal cascade (Property 11)
    - **Property 11: Member removal cascades to tasks and bids**
    - **Validates: Requirements 3.8**

  - [ ]* 7.13 Write property test for role change token invalidation (Property 6)
    - **Property 6: Role change invalidates existing tokens**
    - **Validates: Requirements 2.7**

  - [ ]* 7.14 Write property test for audit log (Property 39)
    - **Property 39: Audit log records all administrative actions**
    - **Validates: Requirements 13.9**


- [x] 8. Billing service and tier enforcement
  - [x] 8.1 Create `backend/internal/repository/billing_repo.go`
    - Methods: `GetSubscription`, `UpsertSubscription`, `CountActiveMembers`, `CountActiveTasks`
    - _Requirements: 4.1, 4.7_

  - [x] 8.2 Create `backend/internal/services/billing_service.go`
    - Implement `BillingService` interface: `GetSubscription`, `UpdateTier`, `CheckMemberLimit`, `CheckTaskLimit`
    - Enforce `TierLimits` map; return `TIER_LIMIT_EXCEEDED` error with plan details
    - Auto-create free subscription on org creation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8_

  - [x] 8.3 Create `backend/internal/handlers/billing.go`
    - `GET /billing/subscription` and `PUT /billing/subscription` (org_admin only)
    - _Requirements: 4.1, 4.7_

  - [x] 8.4 Inject `BillingService.CheckMemberLimit` into `OrgService.InviteMember` and `BillingService.CheckTaskLimit` into `TaskService.CreateTask`
    - _Requirements: 4.5, 4.6_

  - [ ]* 8.5 Write property test for subscription tier limits (Property 12)
    - **Property 12: Subscription tier limits are enforced**
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [ ]* 8.6 Write property test for subscription record fields (Property 13)
    - **Property 13: Subscription record contains all required fields**
    - **Validates: Requirements 4.1, 4.7**

  - [ ]* 8.7 Write property test for subscription downgrade (Property 14)
    - **Property 14: Subscription downgrade preserves existing data**
    - **Validates: Requirements 4.8**

  - [ ]* 8.8 Write property test for tier-gated features (Property 30)
    - **Property 30: Tier-gated features are enforced**
    - **Validates: Requirements 9.4, 9.5, 13.10**


- [x] 9. Auth service extensions (profile, password, token invalidation)
  - [x] 9.1 Extend `backend/internal/services/auth_service.go`
    - Add `UpdateProfile(userID, req)`, `ChangePassword(userID, req)`, `InvalidateUserTokens(userID)` methods
    - `ChangePassword`: reject if new == current (return `SAME_PASSWORD`); bcrypt cost >= 12
    - `InvalidateUserTokens`: write invalidation marker to Redis with 15-min TTL
    - _Requirements: 2.7, 10.1, 10.2, 10.5, 10.6, 13.4, 13.7_

  - [x] 9.2 Extend `backend/internal/handlers/auth.go` with profile and password endpoints
    - `GET /users/me`, `PUT /users/me`, `PUT /users/me/password`, `PUT /users/me/notifications`
    - `POST /auth/logout` — invalidates refresh token in Redis
    - _Requirements: 10.1, 10.2, 10.4, 13.7_

  - [ ]* 9.3 Write property test for profile update round-trip (Property 31)
    - **Property 31: Profile update round-trip**
    - **Validates: Requirements 10.1, 10.3, 10.4**

  - [ ]* 9.4 Write property test for password change (Property 32)
    - **Property 32: Password change enables login with new password**
    - **Validates: Requirements 10.2**

  - [ ]* 9.5 Write property test for logout invalidates refresh token (Property 37)
    - **Property 37: Logout invalidates refresh token**
    - **Validates: Requirements 13.7**

  - [ ]* 9.6 Write property test for bcrypt cost (Property 35)
    - **Property 35: Passwords are stored with bcrypt cost >= 12**
    - **Validates: Requirements 13.4**

  - [ ]* 9.7 Write property test for input sanitization (Property 38)
    - **Property 38: Input sanitization prevents injection**
    - **Validates: Requirements 13.8**

- [x] 10. Checkpoint — ensure all backend services compile and unit tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Notification service and SSE
  - [x] 11.1 Create `backend/internal/repository/notification_repo.go`
    - Methods: `CreateNotification`, `GetNotificationHistory`, `MarkRead`, `MarkAllRead`
    - _Requirements: 6.10_

  - [x] 11.2 Create `backend/internal/services/notification_service.go`
    - Implement `NotificationService` interface: `Publish` (writes to DB + publishes to Redis pub/sub channel `user:{id}:notifications`), `GetHistory`, `MarkRead`, `MarkAllRead`, `Subscribe` (returns channel + unsubscribe fn)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.10_

  - [x] 11.3 Create `backend/internal/handlers/notification.go`
    - `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
    - `GET /notifications/stream` — SSE handler using `c.Stream`; subscribes to Redis pub/sub; reconnect with `Retry-After` on Redis failure
    - _Requirements: 6.1, 6.8, 6.9, 6.10_

  - [x] 11.4 Inject `NotificationService.Publish` calls into bid and task handlers
    - Bid placed → notify task owner; bid approved/rejected → notify bidder; task status changed → notify owner + assignee
    - Comment posted → notify owner + assignee (if not author)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.6_

  - [x] 11.5 Implement deadline reminder notification job
    - Background goroutine or cron: query tasks with deadline within 24h and status not completed/closed; publish notifications
    - _Requirements: 6.7_

  - [ ]* 11.6 Write property test for notification creation on events (Property 16)
    - **Property 16: Notifications are created for all triggering events**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

  - [ ]* 11.7 Write property test for deadline reminder notifications (Property 17)
    - **Property 17: Deadline reminder notifications are generated**
    - **Validates: Requirements 6.7**

  - [ ]* 11.8 Write property test for notification persistence round-trip (Property 18)
    - **Property 18: Notification persistence and retrieval round-trip**
    - **Validates: Requirements 6.10**


- [x] 12. Task service extensions (org scoping, status machine, activity feed, comments, checklist)
  - [x] 12.1 Extend `backend/internal/repository/task_repo.go` with org scoping and new tables
    - All task queries filter by `org_id`; add methods: `GetTaskDetail` (joins activity + comments + checklist), `AppendActivity`, `CreateComment`, `UpsertChecklist`
    - _Requirements: 1.4, 7.3, 7.5, 7.8_

  - [x] 12.2 Implement task status machine in `backend/internal/services/task_service.go`
    - `TransitionStatus`: validate (S, S') against allowed pairs; return `INVALID_TRANSITION` (400) for invalid pairs
    - Allowed: open→assigned, assigned→in_progress, in_progress→completed, completed→closed, open→closed
    - _Requirements: 7.1, 7.2_

  - [x] 12.3 Implement activity feed appending in task service
    - On any field update: append activity entry with field_name, old_value, new_value, actor_id, timestamp
    - On bid placed/approved/rejected: append activity entry with event_type
    - _Requirements: 7.3, 7.4_

  - [x] 12.4 Implement `AddComment` and `UpdateChecklist` in task service
    - `AddComment`: store comment, trigger notification (req 7.6)
    - `UpdateChecklist`: replace checklist items for task; validate items
    - _Requirements: 7.5, 7.6, 7.8_

  - [x] 12.5 Extend `backend/internal/handlers/task.go` with new endpoints
    - `GET /tasks/:id` returns `TaskDetail` (activity + comments + checklist)
    - `PATCH /tasks/:id/status`, `POST /tasks/:id/comments`, `PUT /tasks/:id/checklist`
    - Apply `RequireRole` guards: task creation requires manager+
    - _Requirements: 2.3, 2.5, 7.1, 7.5, 7.8_

  - [ ]* 12.6 Write property test for task status machine (Property 19)
    - **Property 19: Task status machine enforces valid transitions only**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 12.7 Write property test for activity feed (Property 20)
    - **Property 20: Activity feed records all task mutations**
    - **Validates: Requirements 7.3, 7.4**

  - [ ]* 12.8 Write property test for comment round-trip (Property 21)
    - **Property 21: Comment round-trip**
    - **Validates: Requirements 7.5**

  - [ ]* 12.9 Write property test for comment notifications (Property 22)
    - **Property 22: Comment triggers notifications to non-author recipients**
    - **Validates: Requirements 7.6**

  - [ ]* 12.10 Write property test for checklist completion (Property 23)
    - **Property 23: Checklist completion does not change task status**
    - **Validates: Requirements 7.9**


- [-] 13. Advanced search, filtering, sorting, and pagination
  - [x] 13.1 Implement `SearchTasks` in `backend/internal/repository/task_repo.go`
    - Full-text search using `search_vector @@ plainto_tsquery('english', $1)` with relevance ranking
    - Filter by: status, priority, assigned_to, skills (array overlap), deadline range, creator
    - Sort by: created_at asc/desc, deadline asc/desc, priority high-to-low
    - Pagination: max 25 per page; return total count + page metadata
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7_

  - [-] 13.2 Expose search/filter/sort/pagination via `GET /tasks` handler
    - Parse query params: `q`, `status`, `priority`, `assigned_to`, `skills`, `deadline_from`, `deadline_to`, `creator`, `sort`, `page`, `page_size`
    - Update URL query param handling in handler
    - _Requirements: 8.1, 8.2, 8.4, 8.7_

  - [ ]* 13.3 Write property test for full-text search (Property 24)
    - **Property 24: Full-text search returns all matching tasks**
    - **Validates: Requirements 8.1**

  - [ ]* 13.4 Write property test for filter correctness (Property 25)
    - **Property 25: Filter correctness**
    - **Validates: Requirements 8.2**

  - [ ]* 13.5 Write property test for sort order correctness (Property 26)
    - **Property 26: Sort order correctness**
    - **Validates: Requirements 8.4**

  - [ ]* 13.6 Write property test for pagination correctness (Property 27)
    - **Property 27: Pagination correctness**
    - **Validates: Requirements 8.7**

- [ ] 14. Analytics service extensions (org scoping, trends, CSV export)
  - [ ] 14.1 Extend `backend/internal/repository/analytics_repo.go` with org-scoped queries
    - All queries filter by org_id; add: `GetOrgDashboard`, `GetMemberReport`, `GetTrends` (7/30/90/365 days), `ExportCSV`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 14.2 Extend `backend/internal/services/analytics_service.go`
    - Implement `GetOrgDashboard`, `GetMemberReport`, `GetTrends` (pro+ gate), `ExportCSV` (enterprise gate)
    - Redis cache with 5-min TTL; include `last_updated` timestamp in response
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ] 14.3 Extend `backend/internal/handlers/analytics.go` with new endpoints
    - `GET /analytics/dashboard`, `GET /analytics/me`, `GET /analytics/trends`, `GET /analytics/export`
    - Apply tier gates via `RequireTier` helper or inline subscription check
    - _Requirements: 9.1, 9.4, 9.5_

  - [ ]* 14.4 Write property test for analytics org scoping (Property 28)
    - **Property 28: Analytics are scoped to the requesting organization**
    - **Validates: Requirements 9.1**

  - [ ]* 14.5 Write property test for analytics response fields (Property 29)
    - **Property 29: Analytics response contains all required fields**
    - **Validates: Requirements 9.2, 9.3**

- [ ] 15. Checkpoint — full backend integration test
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 16. Frontend: Zustand store extensions and service layer
  - [ ] 16.1 Extend `frontend/src/store/authStore.ts` with org and role fields
    - Add `orgID`, `role`, `subscriptionTier` to auth state; update login/register actions to persist these
    - _Requirements: 1.5, 2.8_

  - [ ] 16.2 Create `frontend/src/store/notificationStore.ts`
    - State: `notifications[]`, `unreadCount`; actions: `addNotification`, `markRead`, `markAllRead`, `setHistory`
    - _Requirements: 6.8, 6.9, 6.10_

  - [ ] 16.3 Create `frontend/src/hooks/useRBAC.ts`
    - Returns `{ isOrgAdmin, isManager, isEmployee, can(action) }` based on role from auth store
    - _Requirements: 2.8_

  - [ ] 16.4 Create `frontend/src/services/orgService.ts`
    - API calls for all `/orgs/*` endpoints: createOrg, getOrg, updateOrg, listMembers, removeMember, changeRole, sendInvitation, listInvitations, revokeInvitation, acceptInvitation, updateOnboarding
    - _Requirements: 1.1, 3.1, 5.3_

  - [ ] 16.5 Create `frontend/src/services/billingService.ts` and `notificationService.ts`
    - `billingService`: getSubscription, updateTier
    - `notificationService`: getHistory, markRead, markAllRead
    - _Requirements: 4.1, 6.10_

  - [ ]* 16.6 Write unit tests for useRBAC hook
    - Test each role returns correct permission flags
    - _Requirements: 2.8_


- [ ] 17. Frontend: SSE integration and notification bell
  - [ ] 17.1 Create `frontend/src/hooks/useSSE.ts`
    - Manages `EventSource` connection to `/api/v1/notifications/stream`
    - Exponential backoff reconnect: starts at 1s, doubles up to 30s max
    - On message: dispatches to `notificationStore`
    - _Requirements: 6.1, 6.8_

  - [ ] 17.2 Create `frontend/src/hooks/useNotifications.ts`
    - Wraps `notificationStore` + `notificationService`; exposes `notifications`, `unreadCount`, `markRead`, `markAllRead`
    - _Requirements: 6.8, 6.9, 6.10_

  - [ ] 17.3 Create `frontend/src/components/common/NotificationBell.tsx`
    - Bell icon with unread count badge; dropdown showing recent notifications
    - Click on notification: marks as read + navigates to resource
    - _Requirements: 6.8, 6.9_

  - [ ] 17.4 Wire `useSSE` into `Layout.tsx` so SSE connection is active for all authenticated pages
    - _Requirements: 6.1_

  - [ ]* 17.5 Write unit tests for useSSE reconnection logic
    - Test exponential backoff timing; test message dispatch to store
    - _Requirements: 6.1_


- [ ] 18. Frontend: New pages (TaskDetail, OrgSettings, Profile, Notifications)
  - [ ] 18.1 Create `frontend/src/pages/TaskDetail.tsx`
    - Display task fields, status badge, checklist with completion toggle
    - Activity feed and comments in chronological order; add comment form
    - Status transition buttons (role-gated via `useRBAC`)
    - Skeleton loading; empty states for activity/comments
    - _Requirements: 7.1, 7.5, 7.7, 7.8, 7.9, 11.9, 11.10, 11.12_

  - [ ] 18.2 Create `frontend/src/pages/OrgSettings.tsx`
    - Tabs: Members list (with role badges, remove/change-role actions for org_admin), Invitations (send form + pending list + revoke), Billing (current tier + usage meters + upgrade CTA)
    - Onboarding resume link; audit log tab (enterprise only)
    - _Requirements: 2.8, 3.6, 3.7, 4.9, 5.6, 13.10_

  - [ ] 18.3 Create `frontend/src/pages/Profile.tsx`
    - Edit display name, avatar URL, skills list; change password form
    - Notification preferences checkboxes per event type
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 18.4 Create `frontend/src/pages/Notifications.tsx`
    - Paginated notification history; mark all read button; click-to-navigate
    - _Requirements: 6.9, 6.10_

  - [ ] 18.5 Add routes for new pages in `frontend/src/App.tsx`
    - `/tasks/:id`, `/org/settings`, `/profile`, `/notifications`
    - _Requirements: 7.7_

  - [ ]* 18.6 Write unit tests for TaskDetail page
    - Test checklist toggle does not change task status; test comment form submission
    - _Requirements: 7.9_


- [ ] 19. Frontend: Onboarding wizard
  - [ ] 19.1 Create `frontend/src/components/onboarding/OnboardingWizard.tsx`
    - Four steps: (1) org profile setup, (2) invite team members, (3) create first task, (4) completion summary
    - Progress indicator; skip button (calls `updateOnboarding` with skipped status)
    - On complete: calls `updateOnboarding` with complete status; redirects to dashboard
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 19.2 Add onboarding redirect logic in `frontend/src/App.tsx`
    - After login: if org_admin and onboarding_status === 'incomplete', redirect to `/onboarding`
    - _Requirements: 5.1_

  - [ ] 19.3 Add onboarding progress banner to `Dashboard.tsx`
    - Show persistent banner with step progress when onboarding_status === 'incomplete'
    - _Requirements: 5.5_

  - [ ]* 19.4 Write unit tests for OnboardingWizard step progression
    - Test each step advances correctly; test skip sets status to skipped; test complete redirects
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 19.5 Write property test for onboarding status transitions (Property 15)
    - **Property 15: Onboarding status transitions are correct**
    - **Validates: Requirements 5.3, 5.4**


- [ ] 20. Frontend: Search, filter UI, and URL state
  - [ ] 20.1 Create search input and filter panel components
    - `SearchBar.tsx`: debounced text input (300ms); `FilterPanel.tsx`: status, priority, skills, deadline range, assigned member dropdowns
    - _Requirements: 8.5_

  - [ ] 20.2 Integrate search/filter into `Dashboard.tsx` and `MyTasks.tsx`
    - Apply filters without full page reload; sync active filters to URL query params
    - _Requirements: 8.5, 8.6_

  - [ ] 20.3 Implement pagination controls component
    - Previous/next buttons; page indicator; total count display
    - _Requirements: 8.7_

  - [ ]* 20.4 Write property test for frontend filter correctness (Property 25 — frontend)
    - **Property 25: Filter correctness (frontend `applyFilters` utility)**
    - **Validates: Requirements 8.2**

  - [ ]* 20.5 Write property test for frontend sort order (Property 26 — frontend)
    - **Property 26: Sort order correctness (frontend sort utility)**
    - **Validates: Requirements 8.4**

  - [ ]* 20.6 Write property test for frontend pagination (Property 27 — frontend)
    - **Property 27: Pagination correctness (frontend page slice utility)**
    - **Validates: Requirements 8.7**

- [ ] 21. Frontend: Mobile responsiveness
  - [ ] 21.1 Audit and fix all pages for mobile viewports (≥ 320px, no horizontal scroll)
    - Stack multi-column grids to single column on < 768px; verify all touch targets ≥ 44×44px
    - _Requirements: 12.1, 12.3, 12.5_

  - [ ] 21.2 Verify Modal renders as bottom sheet on mobile and Toast supports swipe-to-dismiss
    - Test at 320px, 375px, 414px viewport widths
    - _Requirements: 12.4, 12.6_

  - [ ]* 21.3 Write unit tests for responsive layout breakpoints
    - Test BottomNav renders on < 768px; Sidebar renders on ≥ 768px
    - _Requirements: 12.2_

- [ ] 22. Final checkpoint — full end-to-end validation
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 6, 10, 15, and 22 ensure incremental validation
- Backend property tests use `pgregory.net/rapid`; frontend property tests use `fast-check`
- Each property test MUST include the comment tag: `Feature: saas-platform-transformation, Property N: <title>`
- All 39 correctness properties from the design document are covered across tasks 4–21
- Migrations are additive (no destructive changes to existing tables)
- The org middleware must be applied before any handler that needs org/role context
