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

		// 000004: Remove role column (make it optional - already handled above with nullable role)
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
	}

	for i, migration := range migrations {
		_, err := pool.Exec(ctx, migration)
		if err != nil {
			log.Printf("Migration %d failed: %v", i+1, err)
			return err
		}
	}

	log.Println("✓ Database migrations completed")
	return nil
}
