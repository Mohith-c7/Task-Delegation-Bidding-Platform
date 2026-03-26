# Requirements Document: TaskFlow Platform — Tier 1 Intelligence Features

## Introduction

This document defines the requirements for Phase 2 of the TaskFlow SaaS task marketplace platform.
Phase 1 established the multi-tenant organization architecture, RBAC, billing tiers, real-time
notifications, and the Material Design 3 UI system. Phase 2 introduces four industry-grade Tier 1
intelligence features that transform TaskFlow from a task management tool into a disruptive,
AI-powered work marketplace:

1. **AI-Powered Task Matching & Recommendations** — surface the right people for every task
2. **Reputation & Trust System** — build verifiable credibility for every worker
3. **Payments & Escrow Engine** — secure, transparent financial flows for every transaction
4. **SLA & Contract Engine** — enforceable agreements with automated compliance tracking

The existing platform provides: Go/Gin backend, PostgreSQL/Neon, Redis/Upstash, React/TypeScript
frontend (Vite, Tailwind, Zustand, React Query), multi-tenant org system with RBAC
(org_admin/manager/employee), task CRUD with status machine, bidding system, SSE notifications,
analytics, billing tiers, and JWT auth.

The UI for all new features SHALL follow Google Material Design 3 principles: rounded corners
(12–16px radius on cards, 8px on chips/badges), elevation-based depth, accessible color contrast
ratios (≥ 4.5:1 for body text), and smooth 200ms transitions.

---

## Glossary

- **AI_Matching_Service**: The backend service that computes bidder recommendations and bid scores.
- **Recommendation**: A ranked list of Members suggested as best-fit bidders for a given Task.
- **Confidence_Score**: A floating-point value in [0.0, 1.0] representing the AI model's certainty that a bid will succeed.
- **Similarity_Score**: A floating-point value in [0.0, 1.0] representing semantic overlap between two Tasks.
- **Skill_Taxonomy**: The platform-wide controlled vocabulary of skill tags (e.g., "React", "Go", "Data Analysis").
- **Reputation_Service**: The backend service that computes and maintains Member reputation data.
- **Reputation_Score**: A floating-point value in [0.0, 5.0] representing a Member's overall quality rating.
- **Trust_Tier**: A categorical level assigned to a Member based on Reputation_Score and task volume. One of: Newcomer, Rising, Trusted, Expert, Elite.
- **Badge**: A named achievement awarded to a Member when specific performance thresholds are met.
- **Review**: A post-completion rating (1–5 stars + optional comment) submitted by one party about the other.
- **Payment_Service**: The backend service managing budgets, escrow, payouts, and transaction records.
- **Escrow**: A held balance that is locked when a bid is approved and released when work is accepted.
- **Wallet**: A virtual balance account. Each Organization has an Org_Wallet; each Member has a Worker_Wallet.
- **Platform_Fee**: A 5% commission deducted from each transaction and credited to the platform revenue account.
- **Dispute**: A formal objection raised by either party when a transaction or deliverable is contested.
- **Contract_Service**: The backend service that generates, tracks, and enforces SLA contracts.
- **Contract**: An auto-generated agreement binding a task owner and worker to scope, deadline, and payment terms.
- **SLA**: Service Level Agreement — the deadline and quality commitments encoded in a Contract.
- **Breach**: The state when a Contract's deadline passes without the Task reaching `completed` status.
- **Penalty_Clause**: A configurable late-delivery deduction expressed as a percentage of payment per day overdue.
- **Contract_Template**: An org-level reusable set of default contract terms.
- **Digital_Signature**: A checkbox-based acceptance action that legally binds a party to a Contract.

---

## Requirements

### Requirement 1: AI-Powered Bidder Recommendations

**User Story:** As a task owner, I want the platform to automatically surface the best-fit bidders
when I post a task, so that I can quickly identify and invite the most qualified people without
manually searching through member profiles.

#### Acceptance Criteria

1. WHEN a Task is created with a title, description, and required skills, THE AI_Matching_Service
   SHALL compute a ranked Recommendation list of up to 10 Members within 2 seconds of task
   creation.
2. THE AI_Matching_Service SHALL score each candidate Member using a weighted composite of:
   skill overlap with the Task's required skills (weight 40%), Reputation_Score (weight 30%),
   historical completion rate for similar tasks (weight 20%), and current availability
   (no active in-progress tasks, weight 10%).
3. THE AI_Matching_Service SHALL return each Recommendation with a Confidence_Score in [0.0, 1.0]
   and a human-readable explanation string (e.g., "Matches 4/5 required skills, 4.8★ reputation").
4. THE UI SHALL display the Recommendation list on the task detail page in a "Suggested Bidders"
   panel, showing each Member's avatar, name, Trust_Tier badge, top 3 matching skills, and
   Confidence_Score as a percentage.
5. WHEN a task owner clicks "Invite to Bid" on a Recommendation, THE Notification_Service SHALL
   send an in-app notification to that Member within 5 seconds.
6. WHERE an Organization is on the `free` tier, THE AI_Matching_Service SHALL limit
   Recommendations to the top 3 Members; `pro` and `enterprise` tiers SHALL receive up to 10.
7. IF fewer than 3 eligible Members exist in the Organization, THEN THE AI_Matching_Service SHALL
   return all eligible Members without padding the list.

---

### Requirement 2: Smart Bid Ranking

**User Story:** As a task owner or manager, I want each bid to be automatically scored and ranked,
so that I can evaluate bids at a glance without reading every message in detail.

#### Acceptance Criteria

1. WHEN a Bid is placed on a Task, THE AI_Matching_Service SHALL compute a Confidence_Score for
   that Bid within 1 second of bid submission.
2. THE AI_Matching_Service SHALL compute the Bid Confidence_Score using: bidder's skill match to
   task requirements (40%), bidder's Reputation_Score normalized to [0.0, 1.0] (30%), bidder's
   on-time delivery rate (20%), and proposed deadline vs. AI-recommended deadline proximity (10%).
3. THE UI SHALL display bids sorted by Confidence_Score descending by default on the bid review
   panel, with the score shown as a colored chip (green ≥ 0.75, amber 0.50–0.74, red < 0.50).
4. THE UI SHALL allow a manager to re-sort bids by: Confidence_Score (default), bid submission
   time, and bidder Reputation_Score.
5. WHEN a Bid's Confidence_Score is below 0.30, THE UI SHALL display a low-confidence warning
   indicator on that bid card.
6. THE AI_Matching_Service SHALL recompute Confidence_Scores for all open bids on a Task when
   the Task's required skills are updated.

---

### Requirement 3: Task Similarity Detection

**User Story:** As a task owner, I want to be warned if a near-duplicate task already exists,
so that I avoid creating redundant work items and can link related tasks instead.

#### Acceptance Criteria

1. WHEN a task owner submits a new Task creation form, THE AI_Matching_Service SHALL compute
   Similarity_Scores between the new task's title and description and all existing open Tasks
   in the same Organization.
2. IF any existing Task has a Similarity_Score ≥ 0.80 with the new Task, THEN THE UI SHALL
   display a non-blocking warning banner listing up to 3 similar tasks with their titles,
   statuses, and Similarity_Scores before the owner confirms creation.
3. THE UI SHALL allow the task owner to proceed with creation despite the warning, or navigate
   to a listed similar task.
4. THE AI_Matching_Service SHALL compute Similarity_Scores using TF-IDF cosine similarity on
   the combined title and description text, normalized to [0.0, 1.0].
5. THE AI_Matching_Service SHALL complete similarity detection within 500ms for Organizations
   with up to 10,000 active Tasks.
6. THE Similarity_Score computation SHALL be symmetric: similarity(Task A, Task B) SHALL equal
   similarity(Task B, Task A) for any two Tasks.

---

### Requirement 4: Auto-Suggest Skills and Recommended Deadline

**User Story:** As a task owner, I want the platform to suggest required skills and a realistic
deadline as I type the task title and description, so that I create well-formed tasks faster.

#### Acceptance Criteria

1. WHEN a task owner types at least 10 characters in the task title or description field, THE
   AI_Matching_Service SHALL return up to 8 skill suggestions from the Skill_Taxonomy within
   300ms.
2. THE AI_Matching_Service SHALL derive skill suggestions by matching keywords in the title and
   description against the Skill_Taxonomy using exact and fuzzy matching (edit distance ≤ 2).
3. THE UI SHALL display skill suggestions as dismissible chips below the skills input field;
   clicking a chip SHALL add it to the task's required skills list.
4. WHEN a task owner has entered a title, description, and priority, THE AI_Matching_Service
   SHALL compute a recommended deadline as: current date + base_days[priority] + complexity_days,
   where base_days is {low: 7, medium: 5, high: 3, critical: 1} and complexity_days is derived
   from description word count (1 day per 100 words, capped at 14 days).
5. THE UI SHALL display the recommended deadline as a pre-filled suggestion in the deadline date
   picker, which the task owner can override.
6. THE recommended deadline SHALL always be strictly greater than the current timestamp.
7. THE AI_Matching_Service SHALL factor in the Organization's current average task completion
   time (from analytics) when computing complexity_days, adjusting the recommendation upward
   if the org average exceeds the base estimate.

---

### Requirement 5: Bidder Reputation Profile

**User Story:** As a task owner or manager, I want to view a comprehensive reputation profile for
any bidder, so that I can make informed bid approval decisions based on verified track records.

#### Acceptance Criteria

1. THE Reputation_Service SHALL maintain a profile for every Member containing: Reputation_Score
   (0.0–5.0), completion_rate (%), on_time_delivery_rate (%), total_tasks_completed (integer),
   total_tasks_attempted (integer), Trust_Tier, active Badges, and specialization tags.
2. THE Reputation_Service SHALL compute Reputation_Score as the weighted average of all received
   Review ratings, where more recent reviews are weighted more heavily using exponential decay
   with a half-life of 90 days.
3. THE Reputation_Service SHALL compute completion_rate as:
   total_tasks_completed / total_tasks_attempted, expressed as a percentage rounded to one
   decimal place.
4. THE Reputation_Service SHALL compute on_time_delivery_rate as: tasks completed on or before
   deadline / total_tasks_completed, expressed as a percentage rounded to one decimal place.
5. THE UI SHALL display a Member's reputation profile as a card showing: star rating with
   numeric score, Trust_Tier badge, completion rate progress bar, on-time delivery rate
   progress bar, total tasks completed, and top 3 specialization tags.
6. THE UI SHALL display the reputation profile card inline within the bid review panel and as
   a standalone profile page accessible via the Member's name link.
7. WHEN a Member has zero completed tasks, THE Reputation_Service SHALL display their
   Reputation_Score as "No reviews yet" rather than 0.0.

---

### Requirement 6: Post-Completion Reviews

**User Story:** As a task owner or worker, I want to rate and review the other party after a task
is completed, so that the platform builds a trustworthy record of everyone's performance.

#### Acceptance Criteria

1. WHEN a Task transitions to `completed` status, THE Reputation_Service SHALL create two pending
   Review requests: one prompting the task owner to review the worker, and one prompting the
   worker to review the task owner.
2. THE UI SHALL display a review prompt modal to each party within 24 hours of task completion,
   showing the other party's name, avatar, and the task title.
3. WHEN a Member submits a Review, THE Reputation_Service SHALL record: reviewer_id, reviewee_id,
   task_id, rating (integer 1–5), optional comment (max 500 characters), and timestamp.
4. IF a Member does not submit a Review within 7 days of task completion, THEN THE
   Reputation_Service SHALL automatically close the Review request without penalizing either party.
5. THE Reputation_Service SHALL update the reviewee's Reputation_Score within 60 seconds of a
   Review being submitted.
6. THE UI SHALL display all Reviews received by a Member on their profile page in reverse
   chronological order, showing the reviewer's name (anonymized to first name + last initial),
   rating, comment, and task title.
7. IF a Member attempts to submit more than one Review for the same Task, THEN THE
   Reputation_Service SHALL return a 409 Conflict response.
8. THE Reputation_Service SHALL allow a Member to edit their submitted Review within 48 hours
   of submission; after 48 hours the Review SHALL be locked.

---

### Requirement 7: Trust Tiers and Badges

**User Story:** As a platform member, I want to earn trust tiers and badges that reflect my
performance, so that my reputation is visible and I can stand out to task owners.

#### Acceptance Criteria

1. THE Reputation_Service SHALL assign every Member exactly one Trust_Tier based on the
   following thresholds (Reputation_Score × total_tasks_completed):
   - Newcomer: 0 tasks completed (regardless of score)
   - Rising: ≥ 1 task completed AND Reputation_Score ≥ 3.0
   - Trusted: ≥ 10 tasks completed AND Reputation_Score ≥ 3.5
   - Expert: ≥ 25 tasks completed AND Reputation_Score ≥ 4.0
   - Elite: ≥ 50 tasks completed AND Reputation_Score ≥ 4.5
2. THE Reputation_Service SHALL re-evaluate a Member's Trust_Tier within 60 seconds of any
   Review submission that changes their Reputation_Score or task count.
3. THE Reputation_Service SHALL award Badges automatically when the following conditions are met:
   - "Fast Deliverer": on_time_delivery_rate ≥ 95% across ≥ 5 completed tasks
   - "Top Rated": Reputation_Score ≥ 4.8 across ≥ 10 reviews
   - "Specialist in [Skill]": ≥ 5 tasks completed with [Skill] as a required skill
   - "Century Club": total_tasks_completed ≥ 100
   - "Reliable": completion_rate ≥ 90% across ≥ 20 attempted tasks
4. THE Reputation_Service SHALL revoke a Badge if the Member's metrics fall below the award
   threshold (e.g., on_time_delivery_rate drops below 95% after a late delivery).
5. THE UI SHALL display Trust_Tier as a colored badge chip on all Member name references
   (bid cards, profile pages, recommendation panels) using the color scheme:
   Newcomer (gray), Rising (blue), Trusted (teal), Expert (purple), Elite (gold).
6. THE UI SHALL display earned Badges as icon chips on the Member's profile page with a
   tooltip explaining the award criteria.
7. WHEN a Member earns a new Badge or advances to a higher Trust_Tier, THE Notification_Service
   SHALL send an in-app notification to that Member within 60 seconds.

---

### Requirement 8: Reputation History Timeline

**User Story:** As a platform member or task owner, I want to see a chronological history of a
member's reputation events, so that I can understand how their performance has evolved over time.

#### Acceptance Criteria

1. THE Reputation_Service SHALL maintain a Reputation_History timeline for each Member recording
   every event that changes their Reputation_Score or Trust_Tier, including: Review received,
   Badge awarded, Badge revoked, and Trust_Tier change.
2. THE Reputation_Service SHALL store each timeline entry with: event_type, old_value,
   new_value, related_task_id (if applicable), and timestamp.
3. THE UI SHALL display the Reputation_History as a vertical timeline on the Member's profile
   page, showing the most recent 20 events with a "Load more" control.
4. THE Reputation_History entries SHALL be returned in strictly descending chronological order
   (most recent first) by the API.
5. THE Reputation_Service SHALL never delete or modify historical timeline entries; entries are
   append-only.

---

### Requirement 9: Task Budget and Escrow

**User Story:** As a task owner, I want to set a budget for my task and have funds automatically
held in escrow when a bid is approved, so that workers are guaranteed payment and I maintain
financial control.

#### Acceptance Criteria

1. WHEN creating a Task, THE Payment_Service SHALL require the task owner to specify either a
   fixed budget (single amount) or a budget range (min_amount and max_amount), where
   min_amount SHALL be ≥ 1.00 and max_amount SHALL be ≥ min_amount.
2. WHEN a Bid is approved on a Task with a fixed budget, THE Payment_Service SHALL immediately
   lock the full budget amount from the task owner's Org_Wallet into Escrow.
3. WHEN a Bid is approved on a Task with a budget range, THE Payment_Service SHALL lock the
   bid's agreed amount (which must be within the budget range) from the Org_Wallet into Escrow.
4. IF the task owner's Org_Wallet has insufficient balance to cover the escrow lock, THEN THE
   Payment_Service SHALL reject the bid approval with a 402 Payment Required response and
   display a top-up prompt in the UI.
5. WHEN a Task reaches `completed` status AND the task owner explicitly approves the work,
   THE Payment_Service SHALL release the escrowed funds: (bid_amount × 0.95) to the worker's
   Worker_Wallet and (bid_amount × 0.05) to the platform revenue account, within 60 seconds.
6. THE Payment_Service SHALL ensure that the sum of (worker_payout + platform_fee) equals
   the escrowed bid_amount exactly for every transaction (no rounding loss).
7. WHEN a bid is rejected after escrow lock (e.g., due to dispute resolution), THE
   Payment_Service SHALL return the full escrowed amount to the task owner's Org_Wallet.
8. THE UI SHALL display the current escrow status on the task detail page: "Funds locked:
   [amount]" when in escrow, "Funds released" after payout, or "Funds returned" after refund.

---

### Requirement 10: Wallet System

**User Story:** As an organization admin or worker, I want a wallet to manage funds on the
platform, so that I can top up, receive payouts, and withdraw without leaving the platform.

#### Acceptance Criteria

1. THE Payment_Service SHALL maintain an Org_Wallet for each Organization and a Worker_Wallet
   for each Member, each with a balance in the platform's base currency (USD) with 2 decimal
   place precision.
2. THE Payment_Service SHALL ensure that no Wallet balance ever goes below 0.00 as a result
   of any platform operation.
3. WHEN an org_admin tops up the Org_Wallet, THE Payment_Service SHALL record a credit
   transaction with: transaction_id, wallet_id, amount, type ("top_up"), and timestamp.
4. WHEN a worker requests a payout from their Worker_Wallet, THE Payment_Service SHALL create
   a pending payout record and process it within 2 business days via the configured payout
   method (bank transfer or wallet-to-wallet).
5. THE Payment_Service SHALL support the following payout methods: bank transfer (ACH/SEPA)
   and internal wallet-to-wallet transfer.
6. THE UI SHALL display the Org_Wallet balance and Worker_Wallet balance in the respective
   settings pages, with a transaction history table showing the last 50 transactions.
7. THE Payment_Service SHALL generate a downloadable invoice PDF for each completed task
   transaction, containing: invoice number, date, parties, task title, gross amount,
   platform fee, and net payout.
8. THE Payment_Service SHALL generate a monthly tax summary document for each Member listing
   all earnings, platform fees, and net income for the calendar month.

---

### Requirement 11: Dispute Resolution

**User Story:** As a task owner or worker, I want a formal dispute process when there is a
disagreement about work quality or payment, so that conflicts are resolved fairly with platform
mediation.

#### Acceptance Criteria

1. WHEN a Task is in `completed` status and the task owner has not approved the work within
   7 days, THE Payment_Service SHALL automatically release the escrowed funds to the worker.
2. WHILE a Task is in `in_progress` or `completed` status, either the task owner or the
   assigned worker MAY raise a Dispute by submitting a reason (min 20 characters) and
   optional evidence (up to 5 file attachments, max 10MB each).
3. WHEN a Dispute is raised, THE Payment_Service SHALL freeze the escrowed funds and notify
   both parties and an org_admin via in-app notification within 5 seconds.
4. THE Dispute SHALL follow the state machine: `open` → `under_review` → `resolved_for_owner`
   | `resolved_for_worker` | `resolved_split`.
5. WHEN a Dispute is resolved, THE Payment_Service SHALL disburse funds according to the
   resolution: full amount to owner (resolved_for_owner), full amount to worker
   (resolved_for_worker), or split by the specified percentage (resolved_split).
6. THE UI SHALL display an active Dispute banner on the task detail page with the dispute
   status, submission date, and a link to the dispute detail page.
7. IF a Dispute is not resolved within 30 days, THEN THE Payment_Service SHALL escalate it
   by notifying the platform support team via email.

---

### Requirement 12: Transaction History and Financial Documents

**User Story:** As an organization admin or worker, I want a complete transaction history and
downloadable financial documents, so that I can track spending, earnings, and meet tax obligations.

#### Acceptance Criteria

1. THE Payment_Service SHALL record every financial event as an immutable transaction entry
   with: transaction_id, wallet_id, counterparty_wallet_id, amount, type
   (escrow_lock | escrow_release | payout | top_up | refund | platform_fee), task_id
   (if applicable), and created_at timestamp.
2. THE Payment_Service SHALL expose a paginated transaction history API returning up to 25
   transactions per page, filterable by type, date range, and task_id.
3. THE UI SHALL display the transaction history as a table with columns: date, description,
   type badge, amount (color-coded: green for credits, red for debits), and running balance.
4. THE Payment_Service SHALL generate invoice PDFs that are parseable and contain all required
   fields: invoice_number, issue_date, seller (worker), buyer (org), line items, subtotal,
   platform_fee, and total.
5. THE Payment_Service SHALL generate monthly tax summary PDFs available for download from
   the Member's settings page under "Financial Documents".
6. THE Payment_Service SHALL assign sequential invoice numbers per Organization in the format
   `INV-{ORG_SLUG}-{YEAR}-{SEQUENCE}` (e.g., `INV-ACME-2025-0042`).

---

### Requirement 13: Auto-Generated Contracts

**User Story:** As a task owner or worker, I want a formal contract automatically generated when
a bid is approved, so that both parties have a clear, binding record of the agreed scope,
deadline, and payment terms.

#### Acceptance Criteria

1. WHEN a Bid is approved, THE Contract_Service SHALL automatically generate a Contract
   containing: contract_id, task_id, task_owner (name + org), worker (name), scope
   (task title + description), agreed_amount, deadline, penalty_clause terms, platform_fee
   rate, and generation timestamp.
2. THE Contract_Service SHALL set the Contract status to `pending_signatures` immediately
   after generation and notify both parties via in-app notification within 5 seconds.
3. WHEN both the task owner and the worker have provided their Digital_Signature (checkbox
   acceptance), THE Contract_Service SHALL transition the Contract status to `active`.
4. IF either party has not signed within 48 hours of contract generation, THEN THE
   Contract_Service SHALL send a reminder notification and, if still unsigned after 72 hours,
   SHALL automatically cancel the Contract and return the escrowed funds to the Org_Wallet.
5. THE Contract_Service SHALL allow an org_admin to define Contract_Templates with default
   penalty_clause terms, payment schedule, and custom clauses; templates SHALL be selectable
   at task creation time.
6. THE Contract_Service SHALL expose a PDF export endpoint that generates a formatted Contract
   PDF containing all contract fields, both parties' acceptance timestamps, and a unique
   contract reference number.
7. THE Contract PDF SHALL be parseable such that all fields present in the Contract data model
   are recoverable from the exported PDF (round-trip property for audit purposes).

---

### Requirement 14: SLA Tracking and Deadline Warnings

**User Story:** As a task owner or manager, I want automated SLA tracking with deadline warnings,
so that I can intervene before a task goes overdue and hold workers accountable.

#### Acceptance Criteria

1. WHEN a Contract becomes `active`, THE Contract_Service SHALL begin SLA tracking by
   computing the elapsed percentage as: (current_time - contract_start) / (deadline - contract_start) × 100.
2. WHEN the elapsed percentage reaches 75%, THE Contract_Service SHALL send an in-app
   notification to both the task owner and the worker with the message "Task is 75% through
   its deadline — [X days] remaining."
3. WHEN the elapsed percentage reaches 90%, THE Contract_Service SHALL send an in-app
   notification to both parties and the org_admin with urgency level "high".
4. WHEN the elapsed percentage reaches 100% (deadline passed) and the Task status is not
   `completed`, THE Contract_Service SHALL mark the Contract as `breached` and notify both
   parties and the org_admin immediately.
5. THE UI SHALL display an SLA progress bar on the task detail page showing elapsed percentage,
   color-coded: green (< 75%), amber (75–89%), red (≥ 90%), with a "BREACHED" label when
   the deadline has passed.
6. THE Contract_Service SHALL check SLA status for all active Contracts at most every 15
   minutes using a background job.
7. WHEN a Task reaches `completed` status before the deadline, THE Contract_Service SHALL
   mark the Contract as `fulfilled` and stop SLA tracking.

---

### Requirement 15: Penalty Clauses and Breach Enforcement

**User Story:** As a task owner, I want configurable late-delivery penalties automatically
applied when a worker misses the deadline, so that there is a financial incentive for on-time
delivery.

#### Acceptance Criteria

1. THE Contract_Service SHALL support a configurable Penalty_Clause with: penalty_rate
   (percentage per day, default 2%, max 10%), max_penalty_cap (percentage of total payment,
   default 20%, max 50%), and grace_period_hours (default 0, max 48).
2. WHEN a Contract is `breached`, THE Contract_Service SHALL compute the penalty as:
   min(days_overdue × penalty_rate × agreed_amount, max_penalty_cap × agreed_amount),
   where days_overdue is calculated after the grace_period_hours have elapsed.
3. WHEN the task is eventually completed after a breach, THE Payment_Service SHALL deduct
   the computed penalty from the worker's payout and credit it to the task owner's Org_Wallet.
4. THE Contract_Service SHALL record the penalty calculation details (days_overdue,
   penalty_rate, penalty_amount, cap_applied) in the Contract record for audit purposes.
5. THE UI SHALL display the accruing penalty amount on the task detail page when a Contract
   is in `breached` status, updating in real time.
6. WHERE a Contract_Template specifies penalty_rate = 0, THE Contract_Service SHALL generate
   Contracts with no penalty clause and SHALL NOT deduct any penalty on breach.

---

### Requirement 16: Non-Functional Requirements — Performance

**User Story:** As a platform user, I want all AI and financial operations to respond quickly,
so that the platform feels fast and professional even under load.

#### Acceptance Criteria

1. THE AI_Matching_Service SHALL return bidder Recommendations within 2 seconds for any Task
   in an Organization with up to 500 Members.
2. THE AI_Matching_Service SHALL return skill suggestions within 300ms for any input string
   against a Skill_Taxonomy of up to 1,000 skills.
3. THE AI_Matching_Service SHALL complete task similarity detection within 500ms for
   Organizations with up to 10,000 active Tasks.
4. THE Payment_Service SHALL complete escrow lock and release operations within 3 seconds
   under normal load (up to 100 concurrent transactions).
5. THE Contract_Service SHALL generate a Contract PDF within 5 seconds of the export request.
6. THE Reputation_Service SHALL update a Member's Reputation_Score within 60 seconds of a
   Review submission.
7. THE Platform SHALL maintain API response times below 200ms at the 95th percentile for all
   non-AI endpoints under a load of 500 concurrent users.

---

### Requirement 17: Non-Functional Requirements — Security

**User Story:** As a company administrator, I want all financial and AI operations to be secure
and tamper-proof, so that my organization's funds and data are protected.

#### Acceptance Criteria

1. THE Payment_Service SHALL execute all escrow lock, release, and payout operations within
   database transactions with SERIALIZABLE isolation level to prevent double-spend.
2. THE Payment_Service SHALL validate that the requesting Member is the task owner before
   approving work and releasing escrow funds.
3. THE Contract_Service SHALL store Digital_Signature records with: signer_id, ip_address,
   user_agent, and timestamp to provide a non-repudiation audit trail.
4. THE Payment_Service SHALL never log or expose raw wallet balances or transaction amounts
   in application logs; amounts SHALL be masked as "[REDACTED]" in all log outputs.
5. THE AI_Matching_Service SHALL not expose individual Member performance data to other
   Members; Confidence_Score explanations SHALL use aggregated language only
   (e.g., "high skill match" not "matched 4 of your 5 skills").
6. THE Platform SHALL enforce rate limiting on all Payment_Service endpoints: maximum 10
   escrow operations per minute per Organization.
7. THE Contract_Service SHALL generate contract reference numbers that are non-sequential
   UUIDs to prevent enumeration attacks.

---

### Requirement 18: Non-Functional Requirements — Accessibility

**User Story:** As a platform user with accessibility needs, I want all Tier 1 features to be
fully accessible, so that I can use the platform regardless of disability.

#### Acceptance Criteria

1. THE UI SHALL ensure all interactive elements in the reputation, payment, and contract
   interfaces have visible focus indicators with a minimum 3:1 contrast ratio against the
   background.
2. THE UI SHALL provide text alternatives for all non-text content including Trust_Tier badge
   icons, Badge icons, and SLA progress bars (via aria-label attributes).
3. THE UI SHALL ensure all form inputs in the task creation (budget, skills), bid placement,
   and contract signing flows have associated label elements and descriptive error messages.
4. THE UI SHALL ensure the SLA progress bar communicates its value to screen readers using
   role="progressbar", aria-valuenow, aria-valuemin, and aria-valuemax attributes.
5. THE UI SHALL ensure all color-coded indicators (Confidence_Score chips, SLA bar, wallet
   transaction colors) are accompanied by a text label or icon so that color is not the sole
   means of conveying information.
6. THE UI SHALL support full keyboard navigation for all Tier 1 feature flows: task creation
   with AI suggestions, bid review and approval, contract signing, and wallet top-up.

---

## Correctness Properties

*Properties are formal statements about system behavior that must hold across all valid executions.
They serve as the basis for property-based tests.*

### Property 1: Bidder recommendation list is sorted by Confidence_Score descending

For any Task with at least 2 eligible Members, the Recommendation list returned by
AI_Matching_Service SHALL be sorted such that for every adjacent pair (i, i+1),
score[i] ≥ score[i+1].

**Validates: Requirements 1.1, 1.2**

---

### Property 2: All Confidence_Scores are bounded in [0.0, 1.0]

For any Bid or Recommendation, the Confidence_Score SHALL satisfy 0.0 ≤ score ≤ 1.0.
No score SHALL be NaN, negative, or greater than 1.0.

**Validates: Requirements 1.2, 2.1**

---

### Property 3: Similarity detection is symmetric

For any two Tasks A and B in the same Organization,
similarity(A, B) SHALL equal similarity(B, A) within floating-point tolerance (|diff| < 0.001).

**Validates: Requirement 3.6**

---

### Property 4: Similarity of a task with itself is 1.0

For any Task A, similarity(A, A) SHALL equal 1.0.

**Validates: Requirement 3.4**

---

### Property 5: Recommended deadline is always in the future

For any Task creation request submitted at time T, the recommended deadline computed by
AI_Matching_Service SHALL be strictly greater than T.

**Validates: Requirement 4.6**

---

### Property 6: Recommended deadline is monotonically non-decreasing with complexity

For any two Tasks with identical priority but different description lengths L1 < L2,
the recommended deadline for L2 SHALL be ≥ the recommended deadline for L1.

**Validates: Requirement 4.4**

---

### Property 7: Reputation_Score is bounded in [0.0, 5.0]

For any Member with at least one Review, their Reputation_Score SHALL satisfy
0.0 ≤ score ≤ 5.0 at all times.

**Validates: Requirement 5.1, 5.2**

---

### Property 8: Completion rate invariant

For any Member, completion_rate SHALL equal
(total_tasks_completed / total_tasks_attempted) × 100, rounded to one decimal place.
This invariant SHALL hold after every task completion or abandonment event.

**Validates: Requirement 5.3**

---

### Property 9: Trust_Tier assignment is deterministic

For any Member with a given (Reputation_Score, total_tasks_completed) pair, the assigned
Trust_Tier SHALL always be the same regardless of the order in which tasks were completed
or reviews were received.

**Validates: Requirement 7.1**

---

### Property 10: Trust_Tier is monotonically non-decreasing with score and volume

For any two Members M1 and M2 where M1.score ≥ M2.score AND
M1.total_tasks_completed ≥ M2.total_tasks_completed, tier_rank(M1) SHALL be ≥ tier_rank(M2),
where tier_rank maps Newcomer=0, Rising=1, Trusted=2, Expert=3, Elite=4.

**Validates: Requirement 7.1**

---

### Property 11: Escrow conservation — lock

When a bid is approved and escrow is locked, the following invariant SHALL hold:
new_org_wallet_balance = old_org_wallet_balance - escrow_amount, and
escrow_balance = escrow_amount. Total funds (wallet + escrow) are conserved.

**Validates: Requirement 9.2, 9.3**

---

### Property 12: Escrow conservation — release

When escrow is released on task approval, the following invariant SHALL hold:
worker_payout + platform_fee = escrow_amount (no rounding loss), and
new_worker_wallet_balance = old_worker_wallet_balance + worker_payout.

**Validates: Requirement 9.5, 9.6**

---

### Property 13: Wallet balance never goes negative

For any sequence of Payment_Service operations on any Wallet, the balance SHALL never
be less than 0.00 after any operation completes.

**Validates: Requirement 10.2**

---

### Property 14: Transaction history sum equals wallet balance

For any Wallet, the sum of all credit transactions minus the sum of all debit transactions
in the transaction history SHALL equal the current wallet balance.

**Validates: Requirement 12.1**

---

### Property 15: Platform fee is exactly 5%

For any completed transaction with bid_amount B, platform_fee SHALL equal
round(B × 0.05, 2) and worker_payout SHALL equal B - platform_fee.
The sum platform_fee + worker_payout SHALL equal B exactly.

**Validates: Requirement 9.5, 9.6**

---

### Property 16: Penalty is capped at max_penalty_cap

For any breached Contract with agreed_amount A, penalty_rate R, and max_penalty_cap C,
the computed penalty SHALL satisfy: penalty ≤ C × A, regardless of how many days overdue.

**Validates: Requirement 15.2**

---

### Property 17: Penalty is zero within grace period

For any breached Contract with grace_period_hours G, if the task is completed within
G hours after the deadline, the computed penalty SHALL be 0.00.

**Validates: Requirement 15.2**

---

### Property 18: Contract is not active until both parties sign

For any Contract in `pending_signatures` status, the Contract status SHALL remain
`pending_signatures` until both the task owner's Digital_Signature and the worker's
Digital_Signature have been recorded. A single signature SHALL NOT transition the
Contract to `active`.

**Validates: Requirement 13.3**

---

### Property 19: SLA elapsed percentage is monotonically non-decreasing

For any active Contract, the elapsed percentage computed at time T2 SHALL be ≥ the
elapsed percentage computed at time T1, for any T2 > T1.

**Validates: Requirement 14.1**

---

### Property 20: Contract PDF round-trip — all fields recoverable

For any Contract C, parsing the exported PDF of C SHALL yield a data structure where
every field in C's data model (contract_id, parties, scope, amount, deadline, penalty terms)
is present and matches the original value.

**Validates: Requirement 13.6, 13.7**

---

### Property 21: Duplicate review is rejected

For any Member M and Task T, if M has already submitted a Review for T, any subsequent
Review submission by M for T SHALL return a 409 Conflict response and SHALL NOT create
a second Review record.

**Validates: Requirement 6.7**

---

### Property 22: Reputation history is append-only and chronologically ordered

For any Member, the Reputation_History timeline SHALL never have entries deleted or
modified, and the sequence of entries returned by the API SHALL be in strictly descending
order by timestamp (most recent first).

**Validates: Requirement 8.4, 8.5**
