DROP TABLE IF EXISTS task_submissions;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'closed'));
