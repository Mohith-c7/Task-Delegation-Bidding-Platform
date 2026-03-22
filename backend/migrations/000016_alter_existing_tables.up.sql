-- Add org_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);

-- Full-text search vector on tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(search_vector);

-- Extend users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills       TEXT[]  DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_prefs  JSONB   DEFAULT '{}';
