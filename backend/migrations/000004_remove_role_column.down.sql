-- Add role column back
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'task_owner' CHECK (role IN ('task_owner', 'bidder', 'manager', 'admin'));

-- Add role index back
CREATE INDEX idx_users_role ON users(role);
