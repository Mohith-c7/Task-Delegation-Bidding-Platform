# Deep Platform Audit Report
**Scope:** Full-stack — Backend (Go/Gin), Frontend (React/TypeScript), Infrastructure

---

## CRITICAL BUGS

### 1. SSE (Real-time Notifications) Sends Token in URL Query String
**File:** `frontend/src/hooks/useSSE.ts`
**Problem:** `EventSource` doesn't support custom headers, so the token is appended as `?token=...` in the URL. The backend `AuthMiddleware` only reads from the `Authorization` header — it never reads the query param. Every SSE connection returns 401 and silently fails.
**Impact:** Real-time notifications are completely broken for all users.

### 2. MyBids Page Shows Task ID Instead of Task Title
**File:** `frontend/src/pages/MyBids.tsx` + `backend/internal/repository/bid_repo.go`
**Problem:** `GetByBidderID` query does NOT join the tasks table, so `bid.task_title` is always `undefined`. The UI falls back to `Task #${bid.task_id.slice(0, 8)}`.
**Impact:** Every bid in "My Bids" shows a truncated UUID instead of the task name.

### 3. TaskDetail Shows Assigned User ID Instead of Name
**File:** `frontend/src/pages/TaskDetail.tsx` line ~220
**Problem:** `task.assigned_to` is a UUID string. The UI renders it directly: `{task.assigned_to}`. There is no name lookup.
**Impact:** "Assigned to: 3f4a9b2c-..." shown instead of the user's name.

### 4. Status Transition Has No Authorization Check
**File:** `backend/internal/services/task_service.go` — `TransitionStatus`
**Problem:** Any authenticated user can call `PATCH /tasks/:id/status` and transition any task to any allowed next state. There is no check that the actor is either the task owner or the assigned user.
**Impact:** Any user can close, complete, or reassign any task they didn't create.

### 5. ForgotPassword Endpoint is a Stub — Does Nothing
**File:** `backend/internal/handlers/auth.go` — `ForgotPassword`
**Problem:** The handler returns a success response without actually sending any email or generating any reset token. `GeneratePasswordResetToken` exists in `auth_service.go` but is never called from this handler.
**Impact:** "Forgot password" flow is completely non-functional. Users cannot reset passwords.

### 6. VerifyEmailAndRegister Has No OTP Verification
**File:** `backend/internal/handlers/auth.go` — `VerifyEmailAndRegister`
**Problem:** The comment says "This endpoint assumes OTP is already verified" but there is no session/state tracking. Anyone can call this endpoint with any email and OTP field and get a registered account — the OTP value is never actually checked.
**Impact:** Email verification is bypassable. Anyone can register with any email.

### 7. Token Refresh Does Not Issue a New Refresh Token
**File:** `backend/internal/handlers/auth.go` — `RefreshToken`
**Problem:** The refresh endpoint only returns a new `access_token`. It never issues a new `refresh_token`. The frontend stores the original refresh token forever. When the refresh token expires (168h), the user is silently logged out with no way to recover without re-logging in.
**Impact:** Users get logged out after 7 days with no warning.

### 8. Logout Does Not Invalidate the Refresh Token
**File:** `backend/internal/handlers/auth.go` — `Logout` + `auth_service.go`
**Problem:** `InvalidateUserTokens` sets a Redis key for 15 minutes. But the `AuthMiddleware` never checks this key — it only validates the JWT signature. So after logout, the old access token remains valid for its full TTL (24h). The refresh token is never invalidated at all.
**Impact:** Stolen tokens remain valid after logout. Security vulnerability.

### 9. RequireOrgMember Middleware Checks JWT Claim, Not DB Membership
**File:** `backend/internal/middleware/rbac.go`
**Problem:** `RequireOrgMember` checks `org_id` from the JWT claim. But the JWT is generated at login time with an empty `org_id` (see `auth_service.go` Login — passes `""` to `GenerateToken`). So all org-protected routes return 403 for every user.
**Impact:** All `/orgs/:id/*` routes are inaccessible. Org settings, members, billing — all broken.

### 10. Login Does Not Include org_id/role in JWT
**File:** `backend/internal/services/auth_service.go` — `Login`
**Problem:** `GenerateToken(user.ID, user.Email, "", ...)` — the third argument (orgID) is always `""`. The role is also empty. So `c.Get("org_id")` and `c.Get("member_role")` are always empty strings in every request.
**Impact:** RBAC is completely broken. No user has any org role. All org-scoped features fail.

### 11. `GetMyBids` Returns `[]*models.Bid` But Frontend Expects `task_title`
**File:** `backend/internal/repository/bid_repo.go` — `GetByBidderID`
**Problem:** The query only selects from `bids` table with no join to `tasks`. The `Bid` model has no `TaskTitle` field. The frontend `Bid` interface has `task_title?: string` but it's never populated.
**Impact:** My Bids page shows UUID fragments instead of task names (same as bug #2 — root cause here).

### 12. `TransitionStatus` Allows `in_progress → completed` Directly
**File:** `backend/internal/models/task.go` — `AllowedTransitions`
**Problem:** `StatusInProgress: {StatusSubmitted, StatusCompleted}` — a task can jump from `in_progress` directly to `completed` without going through `submitted_for_review`. This bypasses the entire review/submission workflow.
**Impact:** Task owners can mark tasks complete without the assignee submitting evidence.

### 13. Checklist Toggle Has No Authorization — Anyone Can Toggle
**File:** `backend/internal/handlers/task.go` — `UpdateChecklist`
**Problem:** `UpdateChecklist` has no check that the caller is the task owner or assignee. Any authenticated user can modify any task's checklist.
**Impact:** Data integrity issue — any user can check/uncheck items on any task.

### 14. `RateTask` and `CreateReview` Are Duplicate Endpoints Doing the Same Thing
**File:** `backend/internal/handlers/task.go` + `task_repo.go`
**Problem:** Both `POST /tasks/:id/rate` and `POST /tasks/:id/reviews` update `tasks.rating` and `tasks.points` and `users.rating_sum`. Calling both will double-count the rating and points for the assignee.
**Impact:** If both endpoints are called, user points and ratings are corrupted.

### 15. `SubmitCompletion` Does Not Check That Caller Is the Assignee
**File:** `backend/internal/services/task_service.go` — `SubmitCompletion`
**Problem:** Any authenticated user can submit completion evidence for any task. There is no check that `userID == task.AssignedTo`.
**Impact:** Anyone can submit fake completion evidence for tasks they didn't work on.

---

## HIGH PRIORITY BUGS

### 16. Dashboard Seed Tasks Have Hardcoded Non-UUID owner_ids
**File:** `frontend/src/pages/Dashboard.tsx`
**Problem:** Seed tasks use `owner_id: '00000000-0000-0000-0000-000000000001'` etc. When `isTaskOwner(task)` is called, it compares against the real user's UUID — always false. So "Place Bid" is shown even for seed tasks owned by the current user (if IDs happened to match). More importantly, clicking "Place Bid" on a seed task shows an error toast but still opens the modal briefly.
**Impact:** Confusing UX, potential for error states.

### 17. `useSSE` Passes Token as Query Param — Backend Auth Middleware Ignores It
**File:** `frontend/src/hooks/useSSE.ts` + `backend/internal/middleware/auth.go`
**Problem:** SSE URL is `...stream?token=${token}`. The `AuthMiddleware` only reads `Authorization` header. The SSE endpoint is behind `AuthMiddleware`, so every SSE connection gets a 401 and the EventSource retries with exponential backoff up to 30s, then stops. No real-time notifications ever arrive.
**Impact:** Notification bell never updates in real-time. SSE stream is dead.

### 18. `MyTasks` Page Does Not Show `submitted_for_review`, `revision_requested`, `disputed` Tasks
**File:** `frontend/src/pages/MyTasks.tsx`
**Problem:** `STATUS_SECTIONS` only includes `open`, `assigned`, `in_progress`, `completed`. Tasks in `submitted_for_review`, `revision_requested`, `disputed`, or `closed` status are silently dropped from the grouped display.
**Impact:** Task owners lose visibility of tasks in review/dispute states.

### 19. `ViewBidsModal` Shows Approve/Reject to Non-Owners
**File:** `frontend/src/components/bids/ViewBidsModal.tsx`
**Problem:** `isOwner` is computed as `task.owner_id === user.id`. But `task` comes from the Dashboard where `owner_id` is the real UUID. However, if the modal is opened from a context where `task` is a seed task (owner_id is a fake UUID), `isOwner` is always false and buttons are hidden. The real issue: there's no error handling when `approveBid` or `rejectBid` fails — errors are only `console.error`'d, never shown to the user.
**Impact:** Silent failures on bid approve/reject — user gets no feedback on error.

### 20. `OrgSettings` — `editingName` State Initializes `orgName` as Empty String
**File:** `frontend/src/pages/OrgSettings.tsx`
**Problem:** `orgName` state is initialized as `''`. When the user clicks "Edit", the input is empty instead of showing the current org name. The `useEffect` to sync `orgData?.name` to `orgName` is missing.
**Impact:** Editing org name always starts with a blank field, risking accidental name deletion.

### 21. `AcceptInvite` Page — Token Read From URL But Invitation Flow Broken
**File:** `frontend/src/pages/AcceptInvite.tsx` (not read but inferred from routes)
**Problem:** The `RequireOrgMember` middleware wraps `POST /orgs/accept-invitation`. But a user accepting an invite is NOT yet a member — they have no `org_id` in their JWT. The route will always return 403 before the handler runs.
**Impact:** Invitation acceptance is completely broken.

### 22. `GetMyBids` Response Not Null-Safe in Frontend
**File:** `frontend/src/services/bidService.ts`
**Problem:** `getMyBids()` returns `response.data.data` directly. If the API returns `null` or `undefined` (e.g., no bids), `setBids(data)` sets state to null, and `bids.filter(...)` throws a TypeError.
**Impact:** MyBids page crashes with "Cannot read properties of null" when user has no bids.

### 23. `TransitionStatus` Frontend Allows All Transitions for All Users
**File:** `frontend/src/pages/TaskDetail.tsx`
**Problem:** `nextStatuses` is computed from `allowedTransitions[task.status]` with no check on who the current user is. Both the task owner and the assignee see all transition buttons. The owner can click "in_progress" (which should only be done by the assignee), and the assignee can click "completed" (which should only be done by the owner).
**Impact:** Wrong users can trigger wrong status transitions from the UI.

---

## MEDIUM PRIORITY BUGS

### 24. `useSSE` Stops Retrying After 30s — Permanent Disconnect
**File:** `frontend/src/hooks/useSSE.ts`
**Problem:** `if (retryDelay.current >= 30000) return` — once the backoff hits 30s, it stops retrying entirely. If the server was temporarily down, the SSE connection is never re-established for the rest of the session.
**Impact:** After any network hiccup, real-time notifications stop permanently until page reload.

### 25. `SearchTasks` PageSize Capped at 25 in Backend But Frontend Sends 25
**File:** `backend/internal/repository/task_repo.go`
**Problem:** `if p.PageSize <= 0 || p.PageSize > 25 { p.PageSize = 25 }` — the cap is 25. The frontend also sends `page_size: 25`. This is fine, but the cap silently overrides any larger value without telling the client. If the frontend ever tries to load more, it silently gets 25.
**Impact:** Minor — pagination works but is inflexible.

### 26. `NotificationBell` Unread Count Can Go Negative
**File:** `frontend/src/store/notificationStore.ts`
**Problem:** `markRead` does `Math.max(0, state.unreadCount - 1)`. This is correct. But `setHistory` recalculates from scratch. If `markRead` is called before `setHistory` runs (race condition on page load), the count can be wrong.
**Impact:** Notification badge shows wrong count occasionally.

### 27. `ForgotPassword` Handler Returns 200 Even When Email Doesn't Exist
**File:** `backend/internal/handlers/auth.go`
**Problem:** This is intentional for security (don't reveal if email exists), but the handler doesn't even attempt to send an email. It's a pure stub.
**Impact:** Password reset is non-functional (same as bug #5).

### 28. `SubmitCompletion` — `task_submissions` Table May Not Exist
**File:** `backend/internal/repository/task_repo.go`
**Problem:** `CreateTaskSubmission` inserts into `task_submissions`. Looking at the migrations list, there is no migration for `task_submissions`. The table likely doesn't exist in production.
**Impact:** All submission evidence uploads fail with a DB error.

### 29. `user_availability` Table May Not Exist
**File:** `backend/migrations/` — no migration for `user_availability`
**Problem:** The migrations go up to `000016`. There is no migration creating `user_availability`. The `ListAvailability`, `CreateAvailability`, `DeleteAvailability` endpoints will all fail.
**Impact:** Availability feature is broken in production.

### 30. `Bid.GetByBidderID` Returns `[]*models.Bid` But Service Returns `[]*models.Bid`
**File:** `backend/internal/services/bid_service.go` — `GetMyBids`
**Problem:** Returns `[]*models.Bid` (pointer slice). Frontend receives this fine, but the `Bid` struct has no `TaskTitle` field. The frontend `Bid` interface expects `task_title?: string`. This is always undefined.
**Impact:** Same as bug #2/#11 — task titles missing in My Bids.

---

## SUMMARY TABLE

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | CRITICAL | Notifications | SSE token sent as query param, backend ignores it |
| 2 | CRITICAL | My Bids | Task title never populated (missing JOIN) |
| 3 | CRITICAL | Task Detail | Assigned user shows UUID not name |
| 4 | CRITICAL | Security | Any user can transition any task status |
| 5 | CRITICAL | Auth | ForgotPassword is a stub — does nothing |
| 6 | CRITICAL | Auth | Email verification OTP never actually checked |
| 7 | CRITICAL | Auth | Refresh token never rotated — users logged out after 7 days |
| 8 | CRITICAL | Security | Logout doesn't invalidate tokens |
| 9 | CRITICAL | Org | RequireOrgMember always 403 — JWT has no org_id |
| 10 | CRITICAL | Auth/RBAC | Login JWT missing org_id and role — all RBAC broken |
| 11 | CRITICAL | My Bids | GetByBidderID missing task JOIN |
| 12 | CRITICAL | Workflow | in_progress → completed bypasses review workflow |
| 13 | CRITICAL | Security | Anyone can modify any task's checklist |
| 14 | CRITICAL | Data | RateTask + CreateReview both update same fields — double-counts |
| 15 | CRITICAL | Security | Anyone can submit completion evidence for any task |
| 16 | HIGH | Dashboard | Seed task owner_ids are fake UUIDs |
| 17 | HIGH | Notifications | SSE dead — same root cause as #1 |
| 18 | HIGH | My Tasks | Tasks in review/dispute states invisible |
| 19 | HIGH | Bids | Approve/reject errors silently swallowed |
| 20 | HIGH | Org Settings | Edit org name starts blank |
| 21 | HIGH | Invitations | Accept invite route behind wrong middleware — always 403 |
| 22 | HIGH | My Bids | Null response crashes page |
| 23 | HIGH | Task Detail | All users see all transition buttons regardless of role |
| 24 | MEDIUM | Notifications | SSE stops retrying after 30s permanently |
| 25 | MEDIUM | Search | PageSize cap silent |
| 26 | MEDIUM | Notifications | Unread count race condition |
| 27 | MEDIUM | Auth | ForgotPassword stub |
| 28 | MEDIUM | Submissions | task_submissions table likely missing |
| 29 | MEDIUM | Availability | user_availability table likely missing |
| 30 | MEDIUM | My Bids | Bid model missing task_title field |
