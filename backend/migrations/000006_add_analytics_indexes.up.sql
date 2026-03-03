-- Add indexes to optimize analytics queries

-- Index for task status queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Index for task priority queries
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Index for task owner queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);

-- Index for task assigned_to queries
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Index for task created_at for trend analysis
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Index for task updated_at for completion time calculations
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- Index for bid status queries
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Index for bid bidder_id queries
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);

-- Index for bid task_id queries
CREATE INDEX IF NOT EXISTS idx_bids_task_id ON bids(task_id);

-- Composite index for completed tasks with deadlines
CREATE INDEX IF NOT EXISTS idx_tasks_completed_deadline ON tasks(status, updated_at, deadline) WHERE status = 'completed';

-- Composite index for approved bids
CREATE INDEX IF NOT EXISTS idx_bids_approved ON bids(status, bidder_id) WHERE status = 'approved';
