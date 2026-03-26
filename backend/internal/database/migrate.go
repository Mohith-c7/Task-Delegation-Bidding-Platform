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

		// Insert test user with fixed UUID (john@example.com / password123)
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
				DELETE FROM users WHERE email = 'john@example.com';
				INSERT INTO users (id, name, email, password_hash, email_verified, verified_at)
				VALUES ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com',
					'$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW());
			END IF;
		END $$;`,

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

		// 000017: Add questionnaire support
		`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS questions TEXT[] DEFAULT '{}';`,
		`ALTER TABLE bids ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';`,

		// SEED DATA — realistic users, tasks, and bids so the platform never looks empty
		`DO $$ BEGIN

		-- Seed extra users (idempotent)
		INSERT INTO users (id, name, email, password_hash, email_verified, verified_at, skills) VALUES
		  ('00000000-0000-0000-0000-000000000002', 'Sarah Chen',    'sarah@example.com',   '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['React','TypeScript','Node.js']),
		  ('00000000-0000-0000-0000-000000000003', 'Marcus Rivera',  'marcus@example.com',  '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['Go','PostgreSQL','Docker']),
		  ('00000000-0000-0000-0000-000000000004', 'Priya Patel',    'priya@example.com',   '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['Python','Machine Learning','Data Analysis']),
		  ('00000000-0000-0000-0000-000000000005', 'Alex Thompson',  'alex@example.com',    '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['iOS','Swift','Objective-C']),
		  ('00000000-0000-0000-0000-000000000006', 'Emma Wilson',    'emma@example.com',    '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['UI/UX','Figma','CSS']),
		  ('00000000-0000-0000-0000-000000000007', 'James Okafor',   'james@example.com',   '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['DevOps','Kubernetes','AWS']),
		  ('00000000-0000-0000-0000-000000000008', 'Lena Müller',    'lena@example.com',    '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['Java','Spring Boot','Microservices']),
		  ('00000000-0000-0000-0000-000000000009', 'Carlos Mendez',  'carlos@example.com',  '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['Android','Kotlin','Firebase']),
		  ('00000000-0000-0000-0000-000000000010', 'Aisha Nkosi',    'aisha@example.com',   '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['Blockchain','Solidity','Web3']),
		  ('00000000-0000-0000-0000-000000000011', 'Ryan Park',      'ryan@example.com',    '$2a$10$YZcA2Bp65W2GThWSNniY3e9BfpVgjHnxnea08Y9KkH5UNmfeFUkiq', true, NOW(), ARRAY['React Native','Expo','Redux'])
		ON CONFLICT (id) DO NOTHING;

		-- Seed tasks (idempotent via title+owner check)
		INSERT INTO tasks (id, title, description, skills, deadline, priority, status, owner_id) VALUES

		  ('10000000-0000-0000-0000-000000000001',
		   'Build a real-time chat feature for our SaaS dashboard',
		   'We need a real-time chat module integrated into our existing React dashboard. Requirements: WebSocket support, message history, online presence indicators, typing indicators, and mobile-responsive UI. Must integrate with our existing auth system.',
		   ARRAY['React','TypeScript','WebSockets','Node.js'],
		   NOW() + INTERVAL '14 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000001'),

		  ('10000000-0000-0000-0000-000000000002',
		   'Migrate PostgreSQL database to multi-tenant architecture',
		   'Our single-tenant Postgres DB needs to be migrated to a multi-tenant schema using row-level security (RLS). Must maintain zero downtime, write migration scripts, update all queries, and document the new schema thoroughly.',
		   ARRAY['PostgreSQL','Go','Database Design','RLS'],
		   NOW() + INTERVAL '21 days', 'critical', 'open',
		   '00000000-0000-0000-0000-000000000002'),

		  ('10000000-0000-0000-0000-000000000003',
		   'Design and implement a mobile-first onboarding flow',
		   'Create a beautiful 5-step onboarding wizard for new users. Steps: account setup, team invite, first task creation, notification preferences, and completion celebration. Must work on iOS and Android via React Native.',
		   ARRAY['React Native','UI/UX','Figma','TypeScript'],
		   NOW() + INTERVAL '10 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000003'),

		  ('10000000-0000-0000-0000-000000000004',
		   'Set up CI/CD pipeline with GitHub Actions and Kubernetes',
		   'Implement a full CI/CD pipeline: automated testing on PR, Docker image build and push to ECR, blue-green deployment to EKS, Slack notifications on deploy, and rollback capability. Include staging and production environments.',
		   ARRAY['DevOps','Kubernetes','GitHub Actions','Docker','AWS'],
		   NOW() + INTERVAL '7 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000004'),

		  ('10000000-0000-0000-0000-000000000005',
		   'Build ML model for task priority prediction',
		   'Train a machine learning model that predicts the optimal priority level for new tasks based on title, description, historical data, and team workload. Expose as a REST API endpoint. Use Python with scikit-learn or PyTorch.',
		   ARRAY['Python','Machine Learning','scikit-learn','REST API','Data Analysis'],
		   NOW() + INTERVAL '30 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000005'),

		  ('10000000-0000-0000-0000-000000000006',
		   'Implement Stripe payment integration with escrow',
		   'Integrate Stripe Connect for marketplace payments. Features: task budget setting, escrow on bid approval, automatic release on completion, dispute handling, payout to workers, and invoice generation. Must be PCI compliant.',
		   ARRAY['Node.js','Stripe','TypeScript','PostgreSQL'],
		   NOW() + INTERVAL '18 days', 'critical', 'open',
		   '00000000-0000-0000-0000-000000000006'),

		  ('10000000-0000-0000-0000-000000000007',
		   'Create iOS app for task notifications and quick actions',
		   'Build a native iOS app that mirrors the web dashboard with push notifications, quick bid placement, task status updates, and offline support. Use Swift with SwiftUI. Must support iOS 16+.',
		   ARRAY['iOS','Swift','SwiftUI','Push Notifications'],
		   NOW() + INTERVAL '45 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000007'),

		  ('10000000-0000-0000-0000-000000000008',
		   'Refactor monolith to microservices architecture',
		   'Break down our Go monolith into 4 microservices: auth-service, task-service, bid-service, and notification-service. Each service should have its own DB, communicate via gRPC, and be independently deployable.',
		   ARRAY['Go','gRPC','Microservices','Docker','PostgreSQL'],
		   NOW() + INTERVAL '60 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000008'),

		  ('10000000-0000-0000-0000-000000000009',
		   'Build Web3 wallet integration for crypto payments',
		   'Add MetaMask and WalletConnect support to allow task payments in USDC on Ethereum mainnet. Smart contract for escrow, gas fee estimation, transaction history, and ENS name resolution.',
		   ARRAY['Blockchain','Solidity','Web3','React','Ethereum'],
		   NOW() + INTERVAL '25 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000009'),

		  ('10000000-0000-0000-0000-000000000010',
		   'Implement advanced search with Elasticsearch',
		   'Replace current full-text search with Elasticsearch. Index tasks, users, and bids. Support fuzzy matching, filters, faceted search, search-as-you-type, and relevance tuning. Include search analytics dashboard.',
		   ARRAY['Elasticsearch','Go','TypeScript','React'],
		   NOW() + INTERVAL '20 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000010'),

		  ('10000000-0000-0000-0000-000000000011',
		   'Fix authentication bug causing session expiry on mobile',
		   'Users on mobile devices are being logged out after 15 minutes despite selecting "remember me". Root cause appears to be in the JWT refresh token flow. Needs investigation and fix across iOS, Android, and mobile web.',
		   ARRAY['React Native','JWT','Node.js','Debugging'],
		   NOW() + INTERVAL '3 days', 'critical', 'open',
		   '00000000-0000-0000-0000-000000000011'),

		  ('10000000-0000-0000-0000-000000000012',
		   'Design system audit and accessibility improvements',
		   'Conduct a full WCAG 2.1 AA audit of the platform. Fix color contrast issues, add ARIA labels, ensure keyboard navigation works throughout, add screen reader support, and document all accessibility improvements.',
		   ARRAY['UI/UX','Accessibility','CSS','React','WCAG'],
		   NOW() + INTERVAL '12 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000001'),

		  ('10000000-0000-0000-0000-000000000013',
		   'Build analytics dashboard with real-time charts',
		   'Create a comprehensive analytics dashboard showing task completion rates, team performance, bid success rates, revenue metrics, and trend analysis. Use Chart.js with real-time WebSocket updates. Export to CSV/PDF.',
		   ARRAY['React','Chart.js','TypeScript','WebSockets','Go'],
		   NOW() + INTERVAL '16 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000002'),

		  ('10000000-0000-0000-0000-000000000014',
		   'Implement email notification system with templates',
		   'Build a transactional email system using SendGrid. Templates needed: welcome, bid placed, bid approved/rejected, task completed, deadline reminder, weekly digest. Must support HTML and plain text, unsubscribe links.',
		   ARRAY['Node.js','SendGrid','HTML Email','TypeScript'],
		   NOW() + INTERVAL '8 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000003'),

		  ('10000000-0000-0000-0000-000000000015',
		   'Performance optimization — reduce API response time by 50%',
		   'Profile and optimize the backend API. Current p95 latency is 800ms, target is 400ms. Areas to investigate: N+1 queries, missing indexes, Redis caching opportunities, connection pooling, and query optimization.',
		   ARRAY['Go','PostgreSQL','Redis','Performance','Profiling'],
		   NOW() + INTERVAL '9 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000004'),

		  ('10000000-0000-0000-0000-000000000016',
		   'Add video call integration for task kickoff meetings',
		   'Integrate Daily.co or Jitsi for in-platform video calls. Features: schedule call from task detail page, join link in notifications, recording support, screen sharing, and meeting notes saved to task activity feed.',
		   ARRAY['React','WebRTC','TypeScript','Node.js'],
		   NOW() + INTERVAL '35 days', 'low', 'open',
		   '00000000-0000-0000-0000-000000000005'),

		  ('10000000-0000-0000-0000-000000000017',
		   'Build reputation scoring algorithm',
		   'Design and implement a reputation system for bidders. Score based on: task completion rate, on-time delivery, review ratings, and bid quality. Expose scores via API, show on profiles, and use in bid ranking.',
		   ARRAY['Go','PostgreSQL','Algorithms','Data Analysis'],
		   NOW() + INTERVAL '22 days', 'high', 'open',
		   '00000000-0000-0000-0000-000000000006'),

		  ('10000000-0000-0000-0000-000000000018',
		   'Implement dark mode with system preference detection',
		   'Add full dark mode support to the React frontend. Must respect system preference, allow manual toggle, persist preference, and ensure all components look great in both modes. Use CSS custom properties.',
		   ARRAY['React','CSS','TypeScript','UI/UX'],
		   NOW() + INTERVAL '6 days', 'low', 'open',
		   '00000000-0000-0000-0000-000000000007'),

		  ('10000000-0000-0000-0000-000000000019',
		   'Create Android app with offline-first architecture',
		   'Build an Android app using Kotlin and Jetpack Compose. Must work offline with local SQLite storage, sync when online, handle conflicts gracefully, and support background sync. Target Android 10+.',
		   ARRAY['Android','Kotlin','Jetpack Compose','SQLite','Firebase'],
		   NOW() + INTERVAL '50 days', 'medium', 'open',
		   '00000000-0000-0000-0000-000000000008'),

		  ('10000000-0000-0000-0000-000000000020',
		   'Security audit and penetration testing',
		   'Conduct a comprehensive security audit: SQL injection testing, XSS vulnerability scan, CSRF protection review, JWT security analysis, rate limiting verification, and dependency vulnerability scan. Provide detailed report with fixes.',
		   ARRAY['Security','Penetration Testing','Go','PostgreSQL'],
		   NOW() + INTERVAL '11 days', 'critical', 'open',
		   '00000000-0000-0000-0000-000000000009')

		ON CONFLICT (id) DO NOTHING;

		-- Seed some bids on the first few tasks
		INSERT INTO bids (id, task_id, bidder_id, message, estimated_completion, status) VALUES
		  ('20000000-0000-0000-0000-000000000001',
		   '10000000-0000-0000-0000-000000000001',
		   '00000000-0000-0000-0000-000000000002',
		   'I have 5 years of React experience and have built real-time chat systems before using Socket.io and Redis pub/sub. I can deliver a fully tested, production-ready chat module with all the features you listed within 10 days.',
		   NOW() + INTERVAL '10 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000002',
		   '10000000-0000-0000-0000-000000000001',
		   '00000000-0000-0000-0000-000000000011',
		   'Built a similar chat feature for a fintech startup last year. I use React Query for state management and WebSockets for real-time updates. Can integrate with your existing auth in day 1 and deliver the full feature in 12 days.',
		   NOW() + INTERVAL '12 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000003',
		   '10000000-0000-0000-0000-000000000002',
		   '00000000-0000-0000-0000-000000000003',
		   'I specialize in PostgreSQL multi-tenancy. Have migrated 3 production databases to RLS-based multi-tenancy with zero downtime. I will write comprehensive migration scripts with rollback support and full documentation.',
		   NOW() + INTERVAL '18 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000004',
		   '10000000-0000-0000-0000-000000000004',
		   '00000000-0000-0000-0000-000000000007',
		   'DevOps is my specialty. I have set up 20+ CI/CD pipelines with GitHub Actions and Kubernetes. I can have your full pipeline running in 5 days including staging and production environments with automated rollback.',
		   NOW() + INTERVAL '5 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000005',
		   '10000000-0000-0000-0000-000000000006',
		   '00000000-0000-0000-0000-000000000008',
		   'I have implemented Stripe Connect for 4 marketplace platforms. I know the escrow flow inside out and can handle all edge cases including disputes, refunds, and international payouts. PCI compliance is standard in my work.',
		   NOW() + INTERVAL '15 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000006',
		   '10000000-0000-0000-0000-000000000005',
		   '00000000-0000-0000-0000-000000000004',
		   'Data scientist with 4 years experience in NLP and classification models. I will build a priority prediction model using a fine-tuned BERT model for text understanding combined with XGBoost for the final classification. Expected accuracy: 85%+.',
		   NOW() + INTERVAL '25 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000007',
		   '10000000-0000-0000-0000-000000000010',
		   '00000000-0000-0000-0000-000000000002',
		   'Elasticsearch expert here. I have built search systems handling 100M+ documents. I will set up the cluster, design the index mappings, implement the search API in Go, and build the React search UI with all the features you need.',
		   NOW() + INTERVAL '18 days', 'pending'),

		  ('20000000-0000-0000-0000-000000000008',
		   '10000000-0000-0000-0000-000000000015',
		   '00000000-0000-0000-0000-000000000003',
		   'Go performance optimization is my niche. I will profile your API with pprof, identify all N+1 queries, add strategic Redis caching, optimize connection pooling, and add database indexes. Guaranteed to hit your 400ms p95 target.',
		   NOW() + INTERVAL '7 days', 'pending')

		ON CONFLICT (id) DO NOTHING;

		END $$;`,
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
