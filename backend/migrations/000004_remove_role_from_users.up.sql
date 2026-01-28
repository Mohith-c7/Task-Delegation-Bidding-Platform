-- Remove role column from users table
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Remove role index if it exists
DROP INDEX IF EXISTS idx_users_role;
