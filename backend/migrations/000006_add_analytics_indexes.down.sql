-- Remove analytics indexes

DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_owner_id;
DROP INDEX IF EXISTS idx_tasks_assigned_to;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_updated_at;
DROP INDEX IF EXISTS idx_bids_status;
DROP INDEX IF EXISTS idx_bids_bidder_id;
DROP INDEX IF EXISTS idx_bids_task_id;
DROP INDEX IF EXISTS idx_tasks_completed_deadline;
DROP INDEX IF EXISTS idx_bids_approved;
