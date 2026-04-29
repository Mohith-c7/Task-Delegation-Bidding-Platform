# Implementation Task List

## Project Title
A Web-Based Platform for Task Sharing and Workload Optimization

## Execution Rule
Every feature must pass three checkpoints before it is considered complete:

1. Backend compiles and tests pass with `go test ./...`.
2. Frontend production build passes with `npm run build`.
3. The feature has empty, loading, error, authorization, and duplicate-action handling where applicable.

---

## Phase 1: Full User Profile and Reviews

### Backend Schema
- Add `user_reviews` table with task, reviewer, reviewee, rating, comment, and created timestamp.
- Add unique constraint so the same task owner cannot review the same assignee twice for one task.
- Add indexes for review lookup by `reviewee_id`, `reviewer_id`, `task_id`, and newest-first display.
- Ensure automatic runtime migration creates the same schema as SQL migration files.
- Keep existing user profile columns working: `bio`, `avatar_url`, `skills`, `resume_url`, `total_points`, `rating_sum`, `rating_count`, and `notif_prefs`.

### Backend Models
- Extend `UserProfile` with `role`, `tasks_applied`, `tasks_accepted`, `overall_rating`, `review_count`, and `reviews`.
- Add `UserReview` model for profile display.
- Add `CreateUserReviewRequest` model for review submission.
- Keep public profile responses private-safe by hiding email and bid history.

### Backend Repository
- Load role from organization membership when available; default to `member`.
- Compute `tasks_applied` from total bids placed.
- Compute `tasks_accepted` from approved bids.
- Compute `overall_rating` from rating aggregate.
- Load reviews by customer/task owner with reviewer name and task title.
- Create review only when:
  - task exists,
  - task is completed,
  - task has an assigned user,
  - actor is the task owner,
  - actor is not reviewing themselves,
  - assigned user is the reviewee,
  - task has not already been rated/reviewed,
  - duplicate review does not already exist.
- Review creation must update task rating, task points, user total points, rating sum, and rating count in one transaction.

### Backend Service and API
- Add `POST /api/v1/tasks/:id/reviews`.
- Add `GET /api/v1/users/:id/reviews`.
- Keep existing `POST /api/v1/tasks/:id/rate` compatible by routing it through the same review-safe logic where possible.
- Add clear errors for unauthorized owner, duplicate review, incomplete task, unassigned task, and invalid rating.

### Frontend Profile
- Show private profile fields: name, email, role, avatar, bio, member since, skills, resume.
- Show performance metrics: tasks applied, tasks accepted, tasks posted, tasks completed, overall rating, points, success rate.
- Add Reviews tab with customer reviews.
- Keep Task History and Bid History tabs working.
- Keep Settings, Notifications, and Password tabs working.
- Show initials when avatar is missing or fails to load.
- Show "Not rated yet" when rating count is zero.
- Show `0%` success rate when there are bids but no accepted bids.

### Frontend Public Profile
- Show name, role, avatar, bio, member since, skills, resume, tasks accepted, tasks completed, overall rating, and reviews.
- Hide email, bid history, password settings, and notification settings.
- Provide an edit-profile action when the current user opens their own public profile.

### Frontend Review Submission
- On completed tasks, allow the task owner to submit rating, points, and review comment for the assigned user.
- Disable submit while saving.
- Prevent submission without rating.
- Show existing rating/review state after submission.
- Refresh task detail and relevant profile data after submission.

### Edge Cases
- User has no avatar.
- User has no role.
- User has no skills.
- User has no resume URL.
- Invalid resume or avatar URL.
- User has no reviews.
- Rating count is zero.
- User has bids but no accepted bids.
- User has no bid history.
- Deleted task linked to review.
- Current user opens own public profile.
- Unauthorized user tries to update another user.
- Profile image fails to load.
- Very long bio, name, skill, review, or URL.
- Duplicate skills with different casing.
- Review before completion.
- Review for unassigned task.
- Review by non-owner.
- Self-review.
- Duplicate review.

---

## Phase 2: Task Lifecycle Timeline
- Record activity for task create, edit, bid placed, bid approved, bid rejected, assignment, status change, comment, checklist update, completion, revision, close, and review.
- Add actor names and timestamps to timeline responses.
- Add task detail timeline UI grouped by date.
- Handle missing actor, legacy tasks with no events, noisy repeated updates, and timezone display.

## Phase 3: Manager Review Queue
- Add manager queue API for pending bids, completed tasks awaiting review, overdue tasks, revision requests, and high-priority tasks with no bids.
- Add manager review UI with filters and direct actions.
- Enforce manager/admin authorization and stale-state handling.

## Phase 4: Task Completion Evidence
- Add task submission schema with notes, PR URL, demo URL, attachment URL, status, and timestamps.
- Add submit-completion API and UI.
- Require assigned user, valid status, non-empty notes, valid URLs, and revision-aware resubmission.

## Phase 5: Dispute and Revision Flow
- Extend statuses with `submitted_for_review`, `revision_requested`, and `disputed`.
- Update transition rules and UI actions.
- Add revision/dispute reason capture and notifications.
- Freeze rating while a task is disputed.

## Phase 6: Bid Ranking Score
- Compute skill match, rating score, success score, ETA fit, and workload score.
- Return bid match score to frontend.
- Sort bids by best match and explain score factors in UI.
- Handle new users, missing skills, late ETA, and tied scores.

## Phase 7: Availability Calendar
- Add user availability schema.
- Add profile availability widget and calendar/list view.
- Warn users before bidding while unavailable.
- Handle overlapping entries, expired availability, leave, and timezone boundaries.

## Phase 8: Workload Dashboard
- Add personal and organization workload APIs.
- Show active tasks, open bids, completed work, overdue tasks, upcoming deadlines, and availability.
- Scope manager visibility by organization membership.

## Phase 9: Organization Invite Flow Polish
- Add accept invite page, invite expiration messaging, revoke support, org switcher, and member management polish.
- Enforce email match, duplicate membership prevention, member limits, and last-admin protection.

## Phase 10: Real-Time Notifications
- Use persisted notifications plus Redis/SSE publishing.
- Add notification bell badge, toast events, drawer, and mark read/all read.
- Respect notification preferences.
- Handle reconnect, duplicate events, disabled event types, and Redis failure fallback.

---

## Hardening Tasks
- Add service tests for bidding, task transitions, rating/reviews, and profile aggregation.
- Add OpenAPI/Swagger coverage for new endpoints.
- Add pagination for histories, reviews, and notifications.
- Run dependency/security checks.
- Update README and final demo script.
