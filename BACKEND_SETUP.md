# Backend Setup & Testing Guide

## ✅ What's Been Built

**Complete Authentication System:**
- User registration with password hashing (bcrypt)
- User login with JWT tokens
- Protected routes with JWT middleware
- Role-based access control
- PostgreSQL database integration
- Clean architecture (handlers → services → repository)

## Prerequisites

1. **Install Go** (if not already): https://go.dev/dl/
2. **Install Docker Desktop**: https://docker.com/products/docker-desktop/
3. **Install golang-migrate** (optional, for migrations):
   ```bash
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   ```

## Quick Start

### 1. Start Database
```bash
# Start PostgreSQL and Redis
docker compose up -d

# Verify containers are running
docker ps
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
go mod download
go mod tidy

# Run migrations (create users table)
# Option 1: Using migrate CLI
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/taskdb?sslmode=disable" up

# Option 2: Using psql directly
docker exec -i taskdb psql -U postgres -d taskdb < migrations/000001_create_users_table.up.sql

# Run the server
go run cmd/api/main.go
```

Server will start on **http://localhost:8080**

## API Endpoints

### Public Endpoints

**1. Health Check**
```bash
GET http://localhost:8080/health
```

**2. Register User**
```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "task_owner"
}
```

**Roles:** `task_owner`, `bidder`, `manager`, `admin`

**3. Login**
```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "task_owner",
      "created_at": "2026-01-27T..."
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### Protected Endpoints

**4. Get Current User**
```bash
GET http://localhost:8080/api/v1/users/me
Authorization: Bearer <access_token>
```

## Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"role\":\"task_owner\"}"
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Testing with Postman/Insomnia

1. Import the endpoints above
2. Register a new user
3. Login to get access token
4. Copy the `access_token` from login response
5. Add to Authorization header: `Bearer <token>`
6. Test protected endpoints

## Database Management

### Connect to PostgreSQL
```bash
docker exec -it taskdb psql -U postgres -d taskdb
```

### Useful SQL Commands
```sql
-- List all users
SELECT * FROM users;

-- Check user count
SELECT COUNT(*) FROM users;

-- Delete all users (for testing)
DELETE FROM users;

-- Drop and recreate table
DROP TABLE users;
-- Then run migration again
```

### Rollback Migration
```bash
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/taskdb?sslmode=disable" down
```

## Project Structure

```
backend/
├── cmd/api/main.go              # Entry point, server setup
├── internal/
│   ├── config/config.go         # Configuration management
│   ├── models/user.go           # Data models
│   ├── handlers/auth.go         # HTTP handlers
│   ├── services/auth_service.go # Business logic
│   ├── repository/user_repo.go  # Database operations
│   ├── middleware/
│   │   ├── auth.go             # JWT authentication
│   │   └── cors.go             # CORS configuration
│   └── utils/
│       ├── jwt.go              # JWT utilities
│       ├── password.go         # Password hashing
│       └── response.go         # API responses
└── migrations/
    └── 000001_create_users_table.up.sql
```

## Security Features

✅ Password hashing with bcrypt  
✅ JWT-based authentication  
✅ Token expiry (15 min access, 7 days refresh)  
✅ Protected routes with middleware  
✅ Role-based access control  
✅ CORS configuration  
✅ SQL injection prevention (parameterized queries)  

## Next Steps

### Phase 2: Tasks Module
- [ ] Create tasks table migration
- [ ] Task model and repository
- [ ] Task service (CRUD operations)
- [ ] Task handlers (API endpoints)
- [ ] Task filtering and pagination

### Phase 3: Bids Module
- [ ] Create bids table migration
- [ ] Bid model and repository
- [ ] Bid service (place, approve, reject)
- [ ] Bid handlers (API endpoints)
- [ ] Manager approval workflow

### Phase 4: Enhancements
- [ ] Real-time notifications
- [ ] Task search and filters
- [ ] File uploads
- [ ] Email notifications
- [ ] Admin dashboard

## Troubleshooting

### "Unable to connect to database"
- Ensure Docker is running: `docker ps`
- Check PostgreSQL container: `docker logs taskdb`
- Restart containers: `docker compose restart`

### "go: command not found"
- Install Go from https://go.dev/dl/
- Restart terminal after installation

### "Port 8080 already in use"
- Change PORT in `.env` file
- Or kill process: `netstat -ano | findstr :8080`

### Migration Errors
- Ensure database exists: `docker exec -it taskdb psql -U postgres -l`
- Drop and recreate: `docker compose down -v && docker compose up -d`

## Environment Variables

Edit `backend/.env`:
```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=168h
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

---

**Auth system is complete and ready to test! 🚀**
