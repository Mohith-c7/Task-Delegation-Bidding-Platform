# Task Delegation and Bidding Platform - Architecture

## Overview
A high-performance, secure task delegation platform with separate frontend and backend architecture.

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI / Radix UI

### Backend
- **Language:** Go 1.21+
- **Web Framework:** Gin
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Database Driver:** pgx/v5
- **Authentication:** JWT (golang-jwt/jwt)
- **Password Hashing:** bcrypt
- **Validation:** go-playground/validator/v10
- **Configuration:** viper
- **Migrations:** golang-migrate
- **CORS:** gin-contrib/cors

### DevOps & Deployment
- **Containerization:** Docker + Docker Compose
- **Database Migrations:** golang-migrate
- **Environment Management:** .env files
- **Reverse Proxy:** Nginx (production)
- **SSL/TLS:** Let's Encrypt (production)

## System Architecture

### High-Level Architecture
```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │  React App   │ ◄─────► │   Go API     │
│   (Client)  │  HTTPS  │  (Frontend)  │   REST  │  (Backend)   │
└─────────────┘         └──────────────┘         └──────┬───────┘
                                                         │
                                                         ├─────► PostgreSQL
                                                         │
                                                         └─────► Redis
```

### Backend Architecture (Clean Architecture)
```
┌─────────────────────────────────────────────────────┐
│                   HTTP Layer (Gin)                   │
│              Routes, Middleware, Handlers            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  Service Layer                       │
│              Business Logic & Rules                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                Repository Layer                      │
│            Database Operations (CRUD)                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              PostgreSQL + Redis                      │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
task-delegation-platform/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go                 # Application entry point
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go               # Configuration management
│   │   ├── handlers/
│   │   │   ├── auth.go                 # Authentication handlers
│   │   │   ├── task.go                 # Task handlers
│   │   │   ├── bid.go                  # Bid handlers
│   │   │   └── user.go                 # User handlers
│   │   ├── middleware/
│   │   │   ├── auth.go                 # JWT authentication
│   │   │   ├── cors.go                 # CORS configuration
│   │   │   ├── ratelimit.go            # Rate limiting
│   │   │   └── logger.go               # Request logging
│   │   ├── models/
│   │   │   ├── user.go                 # User model
│   │   │   ├── task.go                 # Task model
│   │   │   └── bid.go                  # Bid model
│   │   ├── repository/
│   │   │   ├── user_repo.go            # User database operations
│   │   │   ├── task_repo.go            # Task database operations
│   │   │   └── bid_repo.go             # Bid database operations
│   │   ├── services/
│   │   │   ├── auth_service.go         # Authentication logic
│   │   │   ├── task_service.go         # Task business logic
│   │   │   ├── bid_service.go          # Bid business logic
│   │   │   └── notification_service.go # Notification logic
│   │   └── utils/
│   │       ├── jwt.go                  # JWT utilities
│   │       ├── password.go             # Password hashing
│   │       └── response.go             # API response helpers
│   ├── migrations/
│   │   ├── 000001_create_users_table.up.sql
│   │   ├── 000001_create_users_table.down.sql
│   │   ├── 000002_create_tasks_table.up.sql
│   │   ├── 000002_create_tasks_table.down.sql
│   │   ├── 000003_create_bids_table.up.sql
│   │   └── 000003_create_bids_table.down.sql
│   ├── .env.example
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── Makefile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   └── TaskForm.tsx
│   │   │   └── bids/
│   │   │       ├── BidCard.tsx
│   │   │       └── BidForm.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── BidsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useBids.ts
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── taskService.ts
│   │   │   └── bidService.ts
│   │   ├── store/
│   │   │   └── authStore.ts            # Zustand store
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── task.ts
│   │   │   └── bid.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── architecture.md                      # This file
└── README.md
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('task_owner', 'bidder', 'manager', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    deadline TIMESTAMP NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'assigned', 'in_progress', 'completed', 'closed')),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bids Table
```sql
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    estimated_completion TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, bidder_id)
);
```

### Indexes
```sql
CREATE INDEX idx_tasks_owner ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_bids_task ON bids(task_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

### Tasks
- `GET /api/v1/tasks` - List all open tasks (with filters)
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create new task (Task Owner)
- `PUT /api/v1/tasks/:id` - Update task (Task Owner)
- `DELETE /api/v1/tasks/:id` - Delete task (Task Owner)
- `PATCH /api/v1/tasks/:id/status` - Update task status

### Bids
- `GET /api/v1/tasks/:id/bids` - Get all bids for a task
- `POST /api/v1/tasks/:id/bids` - Place a bid (Bidder)
- `GET /api/v1/bids/my-bids` - Get user's bids
- `PATCH /api/v1/bids/:id/approve` - Approve bid (Manager)
- `PATCH /api/v1/bids/:id/reject` - Reject bid (Manager)

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users` - List users (Admin)

## Security Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Role-based access control (RBAC)
- Password hashing with bcrypt (cost factor: 12)

### API Security
- HTTPS only in production
- CORS configuration with whitelist
- Rate limiting: 100 requests per minute per IP
- Request size limits: 10MB max
- SQL injection prevention (parameterized queries)
- XSS protection via input sanitization
- CSRF protection for state-changing operations

### Headers (via Gin middleware)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Performance Optimizations

### Backend
- Connection pooling for PostgreSQL (max 25 connections)
- Redis caching for frequently accessed data
- Database query optimization with proper indexes
- Goroutines for concurrent operations
- Response compression (gzip)
- Pagination for list endpoints (default: 20 items)

### Frontend
- Code splitting and lazy loading
- TanStack Query for automatic caching
- Optimistic UI updates
- Debounced search inputs
- Virtual scrolling for large lists
- Image optimization and lazy loading

### Caching Strategy
- User sessions: Redis (TTL: 7 days)
- Task lists: Redis (TTL: 5 minutes)
- User profiles: Redis (TTL: 30 minutes)
- Cache invalidation on data mutations

## Monitoring & Logging

### Backend Logging
- Structured logging with log levels (DEBUG, INFO, WARN, ERROR)
- Request/response logging
- Error tracking and stack traces
- Performance metrics (response times)

### Metrics to Track
- API response times
- Database query performance
- Cache hit/miss rates
- Active user sessions
- Error rates by endpoint

## Deployment

### Development
```bash
docker-compose up -d
cd backend && go run cmd/api/main.go
cd frontend && npm run dev
```

### Production
- Frontend: Build static files, serve via Nginx/CDN
- Backend: Compile Go binary, run as systemd service
- Database: Managed PostgreSQL (AWS RDS, DigitalOcean)
- Cache: Managed Redis
- SSL: Let's Encrypt with auto-renewal
- Reverse Proxy: Nginx with rate limiting

## Environment Variables

### Backend (.env)
```
PORT=8080
DATABASE_URL=postgresql://user:pass@localhost:5432/taskdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=168h
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Task Delegation Platform
```

## Testing Strategy

### Backend
- Unit tests for services and utilities
- Integration tests for repositories
- API endpoint tests with httptest
- Test coverage target: 80%+

### Frontend
- Component tests with Vitest + Testing Library
- E2E tests with Playwright (optional)
- Test coverage target: 70%+

## Future Enhancements

### Phase 2
- Real-time notifications with WebSockets
- File attachments for tasks
- Task comments and discussions
- Email notifications
- Advanced search and filtering

### Phase 3
- Integration with Jira/GitHub
- Mobile application (React Native)
- Analytics dashboard
- Task templates
- Automated task assignment based on skills

### Phase 4
- Multi-organization support
- Advanced reporting
- AI-powered task matching
- Gamification (points, badges)
- API rate limiting per user

## Performance Targets

- **Response Time:** < 3 seconds for all endpoints
- **Concurrent Users:** 500+ simultaneous users
- **Uptime:** 99% availability
- **Database Queries:** < 100ms for simple queries
- **API Throughput:** 1000+ requests per second
- **Frontend Load Time:** < 2 seconds (initial load)

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (scale with load balancer)
- Database read replicas for read-heavy operations
- Redis cluster for distributed caching
- CDN for static frontend assets

### Vertical Scaling
- Optimize database queries and indexes
- Increase connection pool sizes
- Add more CPU/RAM to servers as needed

## Compliance & Data Privacy

- User data encrypted at rest and in transit
- GDPR-compliant data handling
- User data export functionality
- Right to be forgotten (data deletion)
- Audit logs for sensitive operations
- Regular security audits

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** Finalized
