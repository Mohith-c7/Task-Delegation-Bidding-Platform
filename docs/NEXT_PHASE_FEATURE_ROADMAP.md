# Senior Design Project: Next Phase Feature Roadmap

## Purpose
This document defines the next phase of development after the current authentication, task marketplace, bidding, analytics, profile, leaderboard, recommendation, search, notification, and Kanban work. The goal is to make the platform feel like a complete workflow system for internal task delegation, not just a task listing app.

## Priority Order

1. Full User Profile
2. Task Lifecycle Timeline
3. Manager Review Queue
4. Task Completion Evidence
5. Dispute and Revision Flow
6. Bid Ranking Score
7. Availability Calendar
8. Workload Dashboard
9. Organization Invite Flow Polish
10. Real-Time Notifications

---

## 1. Full User Profile

### Goal
Create a complete private and public user profile that communicates credibility, skills, task history, bid performance, and customer feedback.

### Required Profile Fields

| Section | Fields |
| --- | --- |
| Identity | Name, Email, Role, Avatar, Bio/About, Member Since |
| Performance | Tasks Applied, Tasks Accepted, Tasks Posted, Tasks Completed, Overall Rating, Total Points, Success Rate |
| Skills | Editable skill tag chips |
| Resume | Resume, portfolio, or LinkedIn URL |
| Reviews | Reviews by customers/task owners |
| Histories | Task history and bid history |
| Settings | Password change and notification preferences |

### Backend Plan

#### Database
Add or verify these columns:

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_sum INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notif_prefs JSONB DEFAULT '{}';
```

Add a review table:

```sql
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, reviewer_id, reviewee_id)
);
```

#### Model Updates
Extend `UserProfile` to include:

- `role`
- `tasks_applied`
- `tasks_accepted`
- `overall_rating`
- `reviews`
- `review_count`

Add:

```go
type UserReview struct {
    ID           string    `json:"id"`
    TaskID       string    `json:"task_id"`
    TaskTitle    string    `json:"task_title"`
    ReviewerID   string    `json:"reviewer_id"`
    ReviewerName string    `json:"reviewer_name"`
    RevieweeID   string    `json:"reviewee_id"`
    Rating       int       `json:"rating"`
    Comment      string    `json:"comment"`
    CreatedAt    time.Time `json:"created_at"`
}
```

#### API Endpoints

```http
GET /api/v1/users/me/profile
GET /api/v1/users/:id/profile
PUT /api/v1/users/me
PUT /api/v1/users/me/password
PUT /api/v1/users/me/notifications
POST /api/v1/tasks/:id/reviews
GET /api/v1/users/:id/reviews
```

### Frontend Plan

#### Private Profile Tabs

- Overview
- Task History
- Bid History
- Reviews
- Settings
- Notifications
- Password

#### Public Profile

Show:

- Name
- Role
- Avatar
- Bio
- Member since
- Skills
- Resume button
- Tasks accepted
- Tasks completed
- Overall rating
- Reviews by customers

Hide:

- Email
- Notification settings
- Password settings
- Private bid history details

### Edge Cases

- User has no avatar: show initials fallback.
- User has no role: show default `Member`.
- User has no skills: show empty state and edit prompt on private profile only.
- User has no resume URL: hide public resume button; show add prompt privately.
- Resume URL is invalid: reject on save or show validation error.
- User has no reviews: show "No reviews yet."
- Rating count is zero: show `Not rated yet`, not `0.0`.
- User has bids but no accepted bids: success rate should be `0%`, not blank.
- User has no bid history: show empty state.
- Deleted task linked to review: preserve review text, show task as unavailable.
- Current user views their own public URL: offer "Edit profile" CTA.
- Unauthorized user tries to update another profile: return 403.
- Profile image fails to load: fallback to initials.
- Very long bio, name, skill, or resume URL: truncate in UI and validate max length.
- Duplicate skills with different casing: normalize or prevent duplicates.
- Reviews must only be allowed after task completion.
- A task owner should not review a user who was never assigned to that task.
- A reviewer should not review themselves.
- One review per task/reviewer/reviewee.

### Acceptance Criteria

- Profile updates persist after refresh and logout/login.
- Public profile hides private fields.
- Skills, resume, bio, avatar, and notification settings save correctly.
- Task history and bid history match backend data.
- Reviews affect overall rating.
- Empty states look intentional.

---

## 2. Task Lifecycle Timeline

### Goal
Show a chronological audit trail for every task.

### Events

- Task created
- Task edited
- Bid placed
- Bid approved
- Bid rejected
- Task assigned
- Status changed
- Comment added
- Checklist updated
- Completion submitted
- Revision requested
- Task closed
- Review submitted

### Backend Plan

- Continue using `activity_feed`.
- Add event rows for every meaningful mutation.
- Add actor names in the task detail response.
- Include event metadata for changed fields.

### Frontend Plan

- Add timeline panel to task detail page.
- Group events by date.
- Show actor avatar/initials, event label, timestamp, and field delta.

### Edge Cases

- Missing actor because user was deleted: show `Deleted user`.
- Very noisy updates: collapse repeated edits.
- Legacy tasks with no events: show task creation fallback if available.
- Timezone display should use user locale.

---

## 3. Manager Review Queue

### Goal
Give managers one place to review pending work.

### Queue Items

- Bids awaiting approval
- Completed tasks awaiting review
- Tasks overdue
- Tasks with requested revisions
- High-priority tasks with no bids

### Backend Plan

```http
GET /api/v1/manager/review-queue
PATCH /api/v1/tasks/:id/review
PATCH /api/v1/bids/:id/approve
PATCH /api/v1/bids/:id/reject
```

### Frontend Plan

- Add `/manager/review`.
- Cards or table grouped by review type.
- Bulk filters: overdue, pending approval, completion review.

### Edge Cases

- User is not a manager/admin: 403.
- Task has no organization: only owner can review.
- Manager belongs to multiple orgs: scope by current org.
- Bid was already approved by another manager: show stale-state message.

---

## 4. Task Completion Evidence

### Goal
Require assignees to submit proof when marking work complete.

### Evidence Fields

- Completion notes
- GitHub PR URL
- Demo URL
- File/document URL
- Optional screenshot URL

### Backend Plan

Add `task_submissions` table:

```sql
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  pr_url TEXT,
  demo_url TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'revision_requested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Frontend Plan

- Add "Submit Completion" modal.
- Add submission section to task detail page.
- Owner/manager can approve or request revision.

### Edge Cases

- Only assigned user can submit completion.
- Cannot submit completion for open or closed task.
- Required notes cannot be empty.
- Invalid URLs rejected.
- Multiple submissions allowed only after revision requested.
- Completion approval should close task or move to completed based on workflow.

---

## 5. Dispute and Revision Flow

### Goal
Support realistic task review when submitted work is incomplete or disputed.

### Statuses

- `open`
- `assigned`
- `in_progress`
- `submitted_for_review`
- `revision_requested`
- `completed`
- `closed`
- `disputed`

### Backend Plan

- Extend task status enum/check constraint.
- Update allowed transitions.
- Add revision reason and dispute reason.
- Add notification events for revision/dispute.

### Frontend Plan

- Add status actions based on role.
- Add revision request modal.
- Add dispute banner and resolution state.

### Edge Cases

- Invalid transition should return clear error.
- Owner cannot request revision before submission.
- Assignee cannot approve their own submission.
- Closed tasks cannot be reopened except by admin.
- Dispute should freeze rating until resolved.

---

## 6. Bid Ranking Score

### Goal
Rank bids using measurable bidder quality and task fit.

### Scoring Inputs

- Skill match percentage
- Bidder average rating
- Bid success rate
- Tasks completed
- On-time completion rate
- Estimated completion vs deadline
- Current active workload

### Backend Plan

Return computed fields on bid list:

```json
{
  "match_score": 92,
  "skill_match": 80,
  "rating_score": 95,
  "availability_score": 90
}
```

### Frontend Plan

- Sort bids by match score by default.
- Show score pill: `Best Match`, `Strong Match`, `Risky ETA`.
- Explain score factors in tooltip.

### Edge Cases

- New user with no rating: use neutral score.
- User with no skills: score should not crash.
- Bid ETA after task deadline: penalize heavily.
- Identical scores: sort by earliest bid time.

---

## 7. Availability Calendar

### Goal
Let users communicate availability and prevent over-assignment.

### Availability States

- Available
- Busy
- On leave
- Overloaded

### Backend Plan

Add `user_availability` table:

```sql
CREATE TABLE IF NOT EXISTS user_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'on_leave', 'overloaded')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Frontend Plan

- Add profile availability widget.
- Add calendar/list view.
- Show availability on bidder cards and public profile.

### Edge Cases

- Overlapping availability entries: merge or reject.
- Expired availability should not show as current.
- User on leave should be warned before bidding.
- Timezone boundaries must be handled consistently.

---

## 8. Workload Dashboard

### Goal
Give managers visibility into team capacity.

### Metrics

- Active assigned tasks
- Open bids
- Completed tasks this month
- Overdue tasks
- Upcoming deadlines
- Availability status

### Backend Plan

```http
GET /api/v1/orgs/:id/workload
GET /api/v1/users/me/workload
```

### Frontend Plan

- Add `/workload`.
- Team table with load indicators.
- Filters by skill, role, availability, deadline risk.

### Edge Cases

- User belongs to no org: show personal workload only.
- Manager sees only org members.
- Deleted users should not appear in active workload.
- Tasks with null assignee should be excluded from assignee workload.

---

## 9. Organization Invite Flow Polish

### Goal
Make organization onboarding and team expansion complete.

### Features

- Email invite
- Accept invite page
- Role assignment
- Invite expiration
- Revoke invite
- Org switcher
- Member list

### Backend Plan

- Verify invitation token.
- Prevent accepting expired/revoked invites.
- Create membership on accept.
- Add audit log event.

### Frontend Plan

- `/invite/:token`
- Org switcher in sidebar/header.
- Member management page.

### Edge Cases

- Invite email does not match logged-in user email.
- User already belongs to org.
- Token expired or revoked.
- Org member limit reached.
- Last org admin cannot be removed.

---

## 10. Real-Time Notifications

### Goal
Make updates visible instantly without manual refresh.

### Events

- Bid placed
- Bid approved/rejected
- Task assigned
- Deadline soon
- Comment added
- Revision requested
- Review submitted

### Backend Plan

- Use existing notification stream endpoint.
- Store notification in database before publish.
- Publish event to Redis/SSE.
- Respect notification preferences.

### Frontend Plan

- Notification bell badge.
- Toast on real-time event.
- Notification drawer/list.
- Mark one/all as read.

### Edge Cases

- SSE reconnect after network loss.
- Duplicate events should be ignored by ID.
- User has disabled an event type: do not send toast/email.
- If Redis is down, database notification should still persist.
- Browser tab inactive: notification should appear when user returns.

---

## Cross-Cutting Edge Cases

### Authentication and Authorization

- Expired access token should refresh silently.
- Expired refresh token should log out user cleanly.
- Users cannot edit other users' data.
- Organization-scoped data must require membership.
- Manager/admin routes must reject normal employees.

### Data Integrity

- No duplicate bids by same user on same task.
- A user cannot bid on their own task.
- A task cannot have multiple approved bids.
- Ratings cannot be submitted twice for the same task.
- Reviews must be tied to completed work.
- Deleted tasks should not break profile histories.

### UI and UX

- Every table needs empty, loading, and error states.
- Long text must truncate safely.
- Dates must be formatted consistently.
- Buttons should disable during submission.
- Stale modal state should reset on close.
- Mobile layout must support dashboard tables and profile tabs.

### Performance

- Paginate task history, bid history, reviews, and notifications.
- Avoid N+1 queries in profile and workload APIs.
- Add indexes for `task_id`, `bidder_id`, `owner_id`, `reviewee_id`, and `created_at`.
- Cache leaderboard if needed.

### Security

- Validate URLs before storing resume, PR, demo, or attachment links.
- Do not expose email on public profiles.
- Do not expose private bid details publicly.
- Sanitize or escape user-generated text.
- Enforce rate limits on auth, bids, comments, reviews, and notifications.

---

## Suggested Sprint Plan

### Sprint 1: Profile and Reviews

- Finalize profile schema.
- Add reviews table and APIs.
- Build private profile tabs.
- Build public profile.
- Add review submission after completed tasks.

### Sprint 2: Workflow Depth

- Add task lifecycle timeline.
- Add completion evidence.
- Add revision and dispute statuses.
- Update status transition rules.

### Sprint 3: Manager Tools

- Add manager review queue.
- Add workload dashboard.
- Add org invite polish.

### Sprint 4: Intelligence and Real Time

- Add bid ranking score.
- Add availability calendar.
- Add real-time notification toasts and badge.

### Sprint 5: Hardening

- Add service tests.
- Add OpenAPI/Swagger documentation.
- Add pagination to histories.
- Add audit/security checks.
- Update README and demo script.


