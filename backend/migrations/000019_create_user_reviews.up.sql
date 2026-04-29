CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, reviewer_id, reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee_created ON user_reviews(reviewee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_created ON user_reviews(reviewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_task ON user_reviews(task_id);
