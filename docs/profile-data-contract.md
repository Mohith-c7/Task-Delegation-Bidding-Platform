# Profile Data Contract

This document defines the profile API response shape used by frontend profile pages.

## Private Profile (`GET /api/v1/users/me/profile`)

- Includes personally identifiable and private user fields.
- Includes task history for tasks posted by the user.
- Includes bid history for bids placed by the user.

### Key fields

- `email` is present.
- `bid_history` is present.
- `task_history` entries include:
  - `id`, `title`, `status`, `priority`, `deadline`, `created_at`, `assigned_to`, `rating`, `points`

## Public Profile (`GET /api/v1/users/:id/profile`)

- Exposes only public-safe profile fields.
- Excludes private fields and account management data.
- `task_history` is tailored to completed work for credibility display.

### Public constraints

- `email` is always blank/omitted.
- `bid_history` is always omitted.
- `task_history` returns only tasks where:
  - `assigned_to = :user_id`
  - `status = 'completed'`

## Frontend rendering expectations

- Profile hero should show:
  - Name, member since date, bio, skills, optional resume link.
- History tables should show:
  - Task history: task, priority, status, deadline, date posted, rating.
  - Bid history (private only): task, task status, bid status, estimated completion, bid date.

