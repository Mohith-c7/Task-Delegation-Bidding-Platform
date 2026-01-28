-- Add role column back to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'task_owner' CHECK (role IN ('task_owner', 'bidder', 'manager', 'admin'));

-- Recreate role index
CREATE INDEX idx_users_role ON users(role);
