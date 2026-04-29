ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('open', 'assigned', 'in_progress', 'submitted_for_review', 'revision_requested', 'disputed', 'completed', 'closed'));

CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  pr_url TEXT NOT NULL DEFAULT '',
  demo_url TEXT NOT NULL DEFAULT '',
  attachment_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'revision_requested', 'accepted', 'disputed')),
  review_reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_task_created ON task_submissions(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_submissions_submitter ON task_submissions(submitted_by, created_at DESC);
