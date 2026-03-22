# Requirements Document

## Introduction

This document defines the requirements for transforming the existing task delegation platform into a world-class B2B SaaS product. The platform enables companies (organizations) to manage internal task delegation, where managers post tasks, employees bid on or are assigned tasks, and administrators oversee the entire organization's workflow.

The transformation covers six major pillars:
1. Multi-tenant organization architecture
2. Role-based access control (Admin, Manager, Employee)
3. Subscription and billing tiers
4. Guided onboarding flow
5. Real-time notifications and updates
6. Complete UI/UX overhaul inspired by Google Material Design 3

### Audit of Existing Capabilities

**Already built:**
- User registration, login, JWT auth, OTP email verification, password reset
- Task CRUD with priorities (low/medium/high/critical), deadlines, skills, statuses (open/assigned/in_progress/completed/closed)
- Bid lifecycle: place, approve, reject
- Basic analytics: task trends, top bidders/owners, skill demand, user analytics
- Frontend pages: Login, Register, Dashboard, MyTasks, MyBids, Analytics, MyAnalytics
- Go/Gin backend, PostgreSQL (Neon), Redis (Upstash), React/Vite/TypeScript/Tailwind

**Missing for SaaS:**
- Organizations / multi-tenancy (no org concept exists at all)
- Roles and permissions (role column was removed in migration 000004)
- Subscription tiers and billing
- Onboarding flow
- In-app and email notifications
- Real-time updates (WebSocket/SSE)
- Team management (invite members, manage roles)
- Advanced search and filtering
- Task comments and activity feed
- Mobile-responsive redesign
- Modern UI design system (currently plain/unstyled)
- Organization-scoped analytics
- Audit logs

---

## Glossary

- **Platform**: The SaaS task delegation web application being built.
- **Organization**: A company or team that subscribes to the Platform. All data is scoped to an Organization.
- **Member**: A user who belongs to an Organization with an assigned Role.
- **Role**: A permission level within an Organization. One of: `org_admin`, `manager`, or `employee`.
- **Org_Admin**: A Member with full administrative control over their Organization.
- **Manager**: A Member who can create tasks, manage team members, and view organization-wide analytics.
- **Employee**: A Member who can bid on tasks and complete assigned work.
- **Task**: A unit of work created within an Organization, with a title, description, required skills, deadline, and priority.
- **Bid**: An Employee's proposal to complete a Task, including a message and estimated completion date.
- **Subscription**: A billing plan that grants an Organization access to Platform features.
- **Invitation**: A token-based email link that allows a new user to join an Organization.
- **Notification**: An in-app or email alert triggered by a Platform event.
- **Activity_Feed**: A chronological log of events on a Task or within an Organization.
- **Design_System**: The Platform's visual language based on Google Material Design 3 principles.
- **Auth_Service**: The backend service responsible for authentication and authorization.
- **Org_Service**: The backend service responsible for organization and membership management.
- **Task_Service**: The backend service responsible for task lifecycle management.
- **Bid_Service**: The backend service responsible for bid lifecycle management.
- **Notification_Service**: The backend service responsible for delivering in-app and email notifications.
- **Analytics_Service**: The backend service responsible for generating usage and performance reports.
- **Billing_Service**: The backend service responsible for subscription and plan management.
- **UI**: The React/TypeScript frontend application.

---

## Requirements

### Requirement 1: Multi-Tenant Organization Architecture

**User Story:** As a company administrator, I want to create an organization on the Platform, so that my company's tasks and members are isolated from other companies.

#### Acceptance Criteria

1. THE Org_Service SHALL store each Organization with a unique identifier, name, slug, logo URL, and creation timestamp.
2. WHEN a user registers without an invitation token, THE UI SHALL present the user with a choice to create a new Organization or join an existing one via invitation.
3. WHEN a user creates an Organization, THE Org_Service SHALL automatically assign that user the `org_admin` Role within that Organization.
4. THE Platform SHALL enforce data isolation such that Members of one Organization cannot read, write, or enumerate data belonging to another Organization.
5. WHEN any API request is authenticated, THE Auth_Service SHALL resolve the requesting Member's Organization and Role and attach them to the request context.
6. IF a user attempts to access a resource belonging to an Organization they are not a Member of, THEN THE Platform SHALL return a 403 Forbidden response.
7. THE Org_Service SHALL allow an Organization to have a maximum of one `org_admin` Role transfer at a time, requiring explicit confirmation from both parties.

---

### Requirement 2: Role-Based Access Control (RBAC)

**User Story:** As an organization admin, I want to assign roles to members, so that each person has the right level of access and capability within the platform.

#### Acceptance Criteria

1. THE Platform SHALL support exactly three Roles within an Organization: `org_admin`, `manager`, and `employee`.
2. WHEN a Member holds the `org_admin` Role, THE Platform SHALL grant that Member full read and write access to all Organization resources including members, tasks, bids, analytics, and billing.
3. WHEN a Member holds the `manager` Role, THE Platform SHALL grant that Member the ability to create tasks, view all tasks within the Organization, approve or reject bids, and view organization-wide analytics.
4. WHEN a Member holds the `employee` Role, THE Platform SHALL restrict that Member to viewing open tasks, placing bids on tasks they do not own, and viewing their own analytics.
5. IF a Member with the `employee` Role attempts to create a task, THEN THE Task_Service SHALL return a 403 Forbidden response.
6. IF a Member with the `employee` Role attempts to view another Member's personal analytics, THEN THE Analytics_Service SHALL return a 403 Forbidden response.
7. WHEN an `org_admin` changes a Member's Role, THE Auth_Service SHALL invalidate that Member's active JWT tokens within 60 seconds.
8. THE Platform SHALL display navigation items and action buttons conditionally based on the authenticated Member's Role.

---

### Requirement 3: Team Management and Member Invitations

**User Story:** As an organization admin or manager, I want to invite colleagues by email, so that they can join the organization and start collaborating on tasks.

#### Acceptance Criteria

1. WHEN an `org_admin` or `manager` submits an invitation with a valid email address and a target Role, THE Org_Service SHALL generate a unique, single-use invitation token with a 72-hour expiry.
2. WHEN an invitation token is generated, THE Notification_Service SHALL send an invitation email to the specified address containing a link with the embedded token.
3. WHEN a recipient clicks the invitation link, THE UI SHALL present a registration form pre-filled with the invited email address.
4. WHEN a new user completes registration via an invitation link, THE Org_Service SHALL automatically add that user as a Member of the inviting Organization with the specified Role.
5. IF an invitation token has expired or has already been used, THEN THE Org_Service SHALL return an error message stating the invitation is invalid.
6. THE Org_Service SHALL allow an `org_admin` to view all pending, accepted, and expired invitations for their Organization.
7. THE Org_Service SHALL allow an `org_admin` to revoke a pending invitation before it is accepted.
8. WHEN an `org_admin` removes a Member from the Organization, THE Platform SHALL reassign all open tasks owned by that Member to unassigned status and cancel all pending bids placed by that Member.

---

### Requirement 4: Subscription and Billing Tiers

**User Story:** As a company administrator, I want to choose a subscription plan, so that I can access the features appropriate for my team's size and needs.

#### Acceptance Criteria

1. THE Billing_Service SHALL support three subscription tiers: `free`, `pro`, and `enterprise`.
2. WHILE an Organization is on the `free` tier, THE Platform SHALL limit that Organization to a maximum of 5 Members, 20 active Tasks, and access to basic analytics only.
3. WHILE an Organization is on the `pro` tier, THE Platform SHALL allow up to 50 Members, unlimited Tasks, advanced analytics, and priority email support.
4. WHILE an Organization is on the `enterprise` tier, THE Platform SHALL allow unlimited Members, unlimited Tasks, full analytics with export, audit logs, and dedicated support.
5. WHEN an Organization exceeds the Member limit for their current tier, THE Org_Service SHALL reject new Member invitations and return an error message specifying the current plan limit.
6. WHEN an Organization exceeds the Task limit for their current tier, THE Task_Service SHALL reject new Task creation and return an error message specifying the current plan limit.
7. THE Billing_Service SHALL record the current tier, subscription start date, and renewal date for each Organization.
8. WHEN an Organization's subscription is downgraded to a lower tier, THE Platform SHALL preserve all existing data but enforce the lower tier's limits on new operations.
9. THE UI SHALL display the current subscription tier and usage metrics (Members used / limit, Tasks used / limit) on the Organization settings page.

---

### Requirement 5: Guided Onboarding Flow

**User Story:** As a new organization admin, I want a guided setup experience, so that I can configure my organization and invite my team quickly without confusion.

#### Acceptance Criteria

1. WHEN an `org_admin` logs in for the first time after creating an Organization, THE UI SHALL redirect that Member to a multi-step onboarding wizard before showing the main dashboard.
2. THE onboarding wizard SHALL consist of exactly four steps: (1) Organization profile setup, (2) invite team members, (3) create the first task, (4) completion summary.
3. WHEN an `org_admin` completes all four onboarding steps, THE Org_Service SHALL mark the Organization's onboarding status as complete and THE UI SHALL redirect to the main dashboard.
4. WHEN an `org_admin` skips the onboarding wizard, THE Org_Service SHALL mark the Organization's onboarding status as skipped and THE UI SHALL not show the wizard again.
5. WHILE an Organization's onboarding status is incomplete, THE UI SHALL display a persistent onboarding progress banner on the dashboard showing completed and remaining steps.
6. THE UI SHALL allow an `org_admin` to resume the onboarding wizard from the last incomplete step at any time from the Organization settings page.

---

### Requirement 6: Real-Time Notifications

**User Story:** As a platform member, I want to receive instant notifications when important events happen, so that I can respond to task updates and bids without manually refreshing the page.

#### Acceptance Criteria

1. THE Notification_Service SHALL deliver in-app notifications to Members using Server-Sent Events (SSE) or WebSocket connections.
2. WHEN a new Bid is placed on a Task, THE Notification_Service SHALL send an in-app notification to the Task owner within 5 seconds.
3. WHEN a Bid is approved, THE Notification_Service SHALL send an in-app notification to the Bidder within 5 seconds.
4. WHEN a Bid is rejected, THE Notification_Service SHALL send an in-app notification to the Bidder within 5 seconds.
5. WHEN a Task's status changes, THE Notification_Service SHALL send an in-app notification to the Task owner and the assigned Member within 5 seconds.
6. WHEN a Member is invited to an Organization, THE Notification_Service SHALL send an email notification to the invited email address within 60 seconds.
7. WHEN a Task's deadline is within 24 hours and the Task status is not `completed`, THE Notification_Service SHALL send an in-app notification to the Task owner and assigned Member.
8. THE UI SHALL display a notification bell icon in the navigation bar showing the count of unread notifications.
9. WHEN a Member clicks a notification, THE UI SHALL mark that notification as read and navigate to the relevant resource.
10. THE Notification_Service SHALL persist all notifications in the database and allow Members to retrieve their notification history.
11. WHERE a Member has enabled email notifications in their profile settings, THE Notification_Service SHALL also send an email for each in-app notification event.

---

### Requirement 7: Task Workflow and Activity Feed

**User Story:** As a task owner or assignee, I want to track the full history of a task and communicate with collaborators, so that everyone stays aligned on progress.

#### Acceptance Criteria

1. THE Task_Service SHALL support the following status transitions only: `open` → `assigned`, `assigned` → `in_progress`, `in_progress` → `completed`, `completed` → `closed`, and `open` → `closed`.
2. IF a Member attempts an invalid status transition, THEN THE Task_Service SHALL return a 400 Bad Request response with a message describing the allowed transitions.
3. WHEN any field of a Task is updated, THE Task_Service SHALL append an entry to that Task's Activity_Feed recording the changed field, old value, new value, acting Member, and timestamp.
4. WHEN a Bid is placed, approved, or rejected on a Task, THE Task_Service SHALL append an entry to that Task's Activity_Feed.
5. THE Task_Service SHALL allow Members to post text comments on a Task, with each comment stored with the author's identity and timestamp.
6. WHEN a comment is posted on a Task, THE Notification_Service SHALL notify the Task owner and assigned Member if they are not the comment author.
7. THE UI SHALL display the Task's Activity_Feed and comments in chronological order on the Task detail page.
8. THE Task_Service SHALL support attaching a list of checklist items to a Task, where each item has a title and a boolean completion state.
9. WHEN all checklist items on a Task are marked complete, THE UI SHALL visually indicate that the Task checklist is fully done without automatically changing the Task status.

---

### Requirement 8: Advanced Search and Filtering

**User Story:** As a platform member, I want to search and filter tasks efficiently, so that I can find relevant work without scrolling through long lists.

#### Acceptance Criteria

1. THE Task_Service SHALL support full-text search across Task title and description fields, returning results ranked by relevance.
2. THE Task_Service SHALL support filtering Tasks by one or more of the following fields simultaneously: status, priority, assigned Member, required skills, deadline range, and creator.
3. WHEN a search query is submitted, THE Task_Service SHALL return results within 500ms for datasets up to 10,000 Tasks.
4. THE Task_Service SHALL support sorting Tasks by: creation date (ascending/descending), deadline (ascending/descending), and priority (high to low).
5. THE UI SHALL provide a search input and a filter panel on the Dashboard and My Tasks pages that apply filters without requiring a full page reload.
6. WHEN a Member applies filters, THE UI SHALL update the URL query parameters to reflect the active filters, allowing the filtered view to be bookmarked and shared.
7. THE Task_Service SHALL support pagination, returning a maximum of 25 Tasks per page with total count and page metadata in the response.

---

### Requirement 9: Organization-Scoped Analytics and Reporting

**User Story:** As a manager or organization admin, I want to view analytics scoped to my organization, so that I can understand team performance and workload distribution.

#### Acceptance Criteria

1. THE Analytics_Service SHALL scope all analytics queries to the requesting Member's Organization, returning only data belonging to that Organization.
2. THE Analytics_Service SHALL provide an organization-level dashboard showing: total tasks by status, total tasks by priority, task completion rate, average time from task creation to completion, top performing Members by completed tasks, and skill demand heatmap.
3. THE Analytics_Service SHALL provide a Member-level performance report showing: tasks owned, tasks completed, bids placed, bid success rate, and average task completion time.
4. WHILE an Organization is on the `pro` or `enterprise` tier, THE Analytics_Service SHALL provide trend charts for task creation and completion over configurable time ranges (7, 30, 90, 365 days).
5. WHILE an Organization is on the `enterprise` tier, THE Analytics_Service SHALL allow `org_admin` and `manager` Members to export analytics data as a CSV file.
6. THE Analytics_Service SHALL refresh cached analytics data at most every 5 minutes to reduce database load.
7. WHEN an `org_admin` or `manager` views the analytics dashboard, THE UI SHALL display a last-updated timestamp indicating when the data was last refreshed.

---

### Requirement 10: User Profile and Settings

**User Story:** As a platform member, I want to manage my profile and preferences, so that my account reflects my identity and my notification preferences are respected.

#### Acceptance Criteria

1. THE Auth_Service SHALL allow a Member to update their display name and profile avatar (uploaded image URL).
2. THE Auth_Service SHALL allow a Member to change their password by providing their current password and a new password of at least 8 characters.
3. THE Auth_Service SHALL allow a Member to add a list of skills to their profile, which THE Platform SHALL use to surface relevant open Tasks.
4. THE Auth_Service SHALL allow a Member to configure email notification preferences per event type: bid received, bid approved, bid rejected, task status change, task deadline reminder, and team invitation.
5. WHEN a Member updates their profile, THE Auth_Service SHALL validate and persist the changes and return the updated Member object.
6. IF a Member attempts to set a new password that is identical to their current password, THEN THE Auth_Service SHALL return a 400 Bad Request response.

---

### Requirement 11: UI/UX Design System Overhaul

**User Story:** As a platform user, I want a modern, beautiful, and consistent interface, so that using the platform feels professional and enjoyable.

#### Acceptance Criteria

1. THE Design_System SHALL implement a color palette with a primary color of `#1A73E8` (Google Blue), a surface color of `#FFFFFF`, a background color of `#F8F9FA`, and semantic colors for success (`#34A853`), warning (`#FBBC04`), error (`#EA4335`), and info (`#4285F4`).
2. THE Design_System SHALL use the Inter typeface as the primary font, with a type scale of: display (32px/700), headline (24px/600), title (18px/600), body (14px/400), and label (12px/500).
3. THE Design_System SHALL implement Material Design 3 elevation using box shadows at three levels: level-1 (0 1px 3px rgba(0,0,0,0.12)), level-2 (0 4px 6px rgba(0,0,0,0.10)), and level-3 (0 8px 24px rgba(0,0,0,0.12)).
4. THE Design_System SHALL define a spacing scale based on 4px increments (4, 8, 12, 16, 24, 32, 48, 64px) applied consistently across all UI components.
5. THE Design_System SHALL implement interactive state transitions using CSS transitions of 150ms ease-in-out for hover and focus states, and 200ms ease-in-out for modal and panel open/close animations.
6. THE UI SHALL be fully responsive, adapting layouts for three breakpoints: mobile (< 768px), tablet (768px–1199px), and desktop (≥ 1200px).
7. THE UI SHALL implement a collapsible sidebar navigation on desktop and a bottom navigation bar on mobile, replacing the current top navigation bar.
8. THE Design_System SHALL define reusable components for: Button (primary, secondary, ghost, danger variants), Card (with elevation levels), Badge (status and priority variants), Input (with label, helper text, and error state), Modal, Toast notification, Avatar, Skeleton loader, and Empty state illustration.
9. ALL existing pages (Login, Register, Dashboard, MyTasks, MyBids, Analytics, MyAnalytics) SHALL be redesigned using the Design_System components.
10. THE UI SHALL implement skeleton loading states for all data-fetching operations, replacing the current spinner-only loading indicators.
11. THE UI SHALL display Toast notifications for all user-initiated actions (task created, bid placed, error occurred) replacing the current `alert()` calls.
12. WHERE a page has no data to display, THE UI SHALL render a contextual empty state illustration with a descriptive message and a primary call-to-action button.

---

### Requirement 12: Mobile Responsiveness

**User Story:** As a platform member using a mobile device, I want the platform to be fully usable on my phone, so that I can manage tasks and bids on the go.

#### Acceptance Criteria

1. THE UI SHALL render all pages without horizontal scrolling on viewports as narrow as 320px.
2. THE UI SHALL display a bottom navigation bar with icons and labels for Dashboard, Tasks, Bids, and Notifications on viewports narrower than 768px.
3. THE UI SHALL stack all multi-column grid layouts into a single column on viewports narrower than 768px.
4. THE UI SHALL render modals as full-screen bottom sheets on viewports narrower than 768px.
5. ALL interactive touch targets in THE UI SHALL have a minimum size of 44×44px on mobile viewports.
6. THE UI SHALL implement swipe-to-dismiss gestures for Toast notifications on mobile viewports.

---

### Requirement 13: Security and Compliance

**User Story:** As a company administrator, I want the platform to follow security best practices, so that my company's data is protected.

#### Acceptance Criteria

1. THE Auth_Service SHALL enforce a minimum password length of 8 characters and require at least one uppercase letter, one lowercase letter, and one digit.
2. THE Auth_Service SHALL implement rate limiting on the login endpoint, blocking further attempts from an IP address after 10 failed attempts within a 15-minute window.
3. THE Auth_Service SHALL implement rate limiting on the OTP send endpoint, allowing a maximum of 3 OTP requests per email address per 10-minute window.
4. THE Platform SHALL store all passwords using bcrypt with a minimum cost factor of 12.
5. THE Platform SHALL transmit all data over HTTPS and set the `Secure` and `HttpOnly` flags on all cookies.
6. THE Auth_Service SHALL rotate JWT access tokens with a maximum lifetime of 15 minutes and refresh tokens with a maximum lifetime of 7 days.
7. WHEN a Member logs out, THE Auth_Service SHALL invalidate the Member's refresh token in Redis.
8. THE Platform SHALL sanitize all user-supplied text inputs before storing them in the database to prevent SQL injection and XSS attacks.
9. THE Org_Service SHALL log all administrative actions (role changes, member removal, invitation revocation) to an immutable audit log with actor identity and timestamp.
10. WHILE an Organization is on the `enterprise` tier, THE Org_Service SHALL expose the audit log to `org_admin` Members via a paginated API endpoint.
