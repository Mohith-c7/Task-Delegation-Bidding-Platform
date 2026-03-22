package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// RunMigrations executes all database migrations in order
func RunMigrations(pool *pgxpool.Pool) error {
	ctx := context.Background()

	migrations := []string{
		// 000001: Create users table
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(50) CHECK (role IN ('task_owner', 'bidder', 'manager', 'admin')),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,

		// 000002: Create tasks table
		`CREATE TABLE IF NOT EXISTS tasks (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			skills TEXT[] NOT NULL,
			deadline TIMESTAMP NOT NULL,
			priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
			status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'closed')),
			owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_id);`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);`,

		// 000003: Create bids table
		`CREATE TABLE IF NOT EXISTS bids (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
			bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			message TEXT NOT NULL,
			estimated_completion TIMESTAMP NOT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
			approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(task_id, bidder_id)
		);`,
		`CREATE INDEX IF NOT EXISTS idx_bids_task ON bids(task_id);`,
		`CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);`,
		`CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);`,

		// 000004: Remove role column
		`ALTER TABLE users DROP COLUMN IF EXISTS role;`,
		`DROP INDEX IF EXISTS idx_users_role;`,

		// 000005: Add email verification
		`DO $$ 
		BEGIN 
			IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
				ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
			END IF;
		END $$;`,
		`DO $$ 
		BEGIN 
			IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verified_at') THEN
				ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
			END IF;
		END $$;`,
		`CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);`,

		// Insert test user (john@example.com / password123)
		// Password hash for "password123" using bcrypt
		`INSERT INTO users (name, email, password_hash, email_verified, verified_at)
		VALUES ('John Doe', 'john@example.com', '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW())
		ON CONFLICT (email) DO NOTHING;`,

		// 000007: Create organizations table
		`CREATE TABLE IF NOT EXISTS organizations (
			id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name             TEXT NOT NULL,
			slug             TEXT NOT NULL UNIQUE,
			logo_url         TEXT,
			onboarding_status TEXT NOT NULL DEFAULT 'incomplete' CHECK (onboarding_status IN ('incomplete', 'complete', 'skipped')),
			onboarding_step  INT NOT NULL DEFAULT 1,
			created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);`,

		// 000008: Create memberships table
		`CREATE TABLE IF NOT EXISTS memberships (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
			user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role       TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('org_admin', 'manager', 'employee')),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE (org_id, user_id)
		);`,
		`CREATE INDEX IF NOT EXISTS idx_memberships_org_id  ON memberships(org_id);`,
		`CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);`,

		// 000009: Create invitations table
		`CREATE TABLE IF NOT EXISTS invitations (
			id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
			invited_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			email       TEXT NOT NULL,
			role        TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('org_admin', 'manager', 'employee')),
			token       TEXT NOT NULL UNIQUE,
			status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
			expires_at  TIMESTAMPTZ NOT NULL,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_invitations_token  ON invitations(token);`,
		`CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(org_id);`,

		// 000010: Create subscriptions table
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id     UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
			tier       TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
			started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			renews_at  TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,

		// 000011: Create notifications table
		`CREATE TABLE IF NOT EXISTS notifications (
			id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
			type          TEXT NOT NULL,
			title         TEXT NOT NULL,
			body          TEXT NOT NULL DEFAULT '',
			resource_type TEXT,
			resource_id   UUID,
			is_read       BOOLEAN NOT NULL DEFAULT FALSE,
			created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_created_at  ON notifications(created_at DESC);`,

		// 000012: Create activity_feed table
		`CREATE TABLE IF NOT EXISTS activity_feed (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
			org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
			actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
			event_type TEXT NOT NULL,
			field_name TEXT,
			old_value  TEXT,
			new_value  TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_activity_feed_task ON activity_feed(task_id, created_at DESC);`,

		// 000013: Create comments table
		`CREATE TABLE IF NOT EXISTS comments (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
			org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
			author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			body       TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id, created_at ASC);`,

		// 000014: Create checklist_items table
		`CREATE TABLE IF NOT EXISTS checklist_items (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
			title      TEXT NOT NULL,
			is_done    BOOLEAN NOT NULL DEFAULT FALSE,
			position   INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_checklist_items_task ON checklist_items(task_id, position ASC);`,

		// 000015: Create audit_log table
		`CREATE TABLE IF NOT EXISTS audit_log (
			id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
			actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
			action      TEXT NOT NULL,
			target_id   UUID,
			target_type TEXT,
			metadata    JSONB,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id, created_at DESC);`,

		// 000016: Alter existing tables — add org_id to tasks, search vector, extend users
		`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);`,
		`DO $$ BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name='tasks' AND column_name='search_vector'
			) THEN
				ALTER TABLE tasks ADD COLUMN search_vector tsvector
					GENERATED ALWAYS AS (
						to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
					) STORED;
			END IF;
		END $$;`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(search_vector);`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills      TEXT[]  DEFAULT '{}';`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url  TEXT;`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_prefs JSONB   DEFAULT '{}';`,
	}

	for i, migration := range migrations {
		_, err := pool.Exec(ctx, migration)
		if err != nil {
			log.Printf("Migration %d failed: %v", i+1, err)
			return err
		}
	}

	log.Println("✓ Database migrations completed")
	log.Println("✓ Test user available: john@example.com / password123")
	return nil
}
