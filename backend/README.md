# Backend - Task Delegation Platform

Go backend API with Gin framework, PostgreSQL, and Redis.

## Quick Start

```bash
# Install dependencies
go mod download

# Copy environment file
copy .env.example .env

# Run the server
make run
```

## Available Commands

```bash
make run          # Run development server
make build        # Build production binary
make test         # Run tests
make clean        # Clean build artifacts
make migrate-up   # Run database migrations
make migrate-down # Rollback migrations
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token

### Tasks
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Bids
- `GET /api/v1/tasks/:id/bids` - Get task bids
- `POST /api/v1/tasks/:id/bids` - Place bid
- `PATCH /api/v1/bids/:id/approve` - Approve bid
- `PATCH /api/v1/bids/:id/reject` - Reject bid

## Tech Stack

- **Framework:** Gin
- **Database:** PostgreSQL (pgx driver)
- **Cache:** Redis
- **Auth:** JWT
- **Config:** Viper
- **Validation:** go-playground/validator
