-- Add email verification fields to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;

-- Create index for faster queries on email_verified
CREATE INDEX idx_users_email_verified ON users(email_verified);
