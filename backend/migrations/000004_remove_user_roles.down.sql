-- Add role column back (for rollback)
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'task_owner' CHECK (role IN ('task_owner', 'bidder', 'manager', 'admin'));
CREATE INDEX idx_users_role ON users(role);
