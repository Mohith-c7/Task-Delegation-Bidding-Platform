# Setup Guide - Task Delegation Platform

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Go 1.21+** - [Download](https://go.dev/dl/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### Optional
- **golang-migrate** - For database migrations
  ```bash
  go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
  ```

## Quick Start

### 1. Clone and Navigate
```bash
cd Task-Delegation-Bidding-Platform
```

### 2. Start Database Services
```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Setup Backend

```bash
cd backend

# Copy environment file
copy .env.example .env

# Download Go dependencies
go mod download
go mod tidy

# Run the backend (will be available on http://localhost:8080)
go run cmd/api/main.go
```

### 4. Setup Frontend (in a new terminal)

```bash
cd frontend

# Copy environment file
copy .env.example .env

# Install dependencies
npm install

# Start development server (will be available on http://localhost:5173)
npm run dev
```

## Detailed Setup

### Backend Setup

1. **Environment Configuration**
   ```bash
   cd backend
   copy .env.example .env
   ```

   Edit `.env` and update if needed:
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

2. **Install Dependencies**
   ```bash
   go mod download
   go mod tidy
   ```

3. **Run Database Migrations** (once migrations are created)
   ```bash
   make migrate-up
   ```

4. **Run the Server**
   ```bash
   # Using Make
   make run

   # Or directly
   go run cmd/api/main.go
   ```

   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Environment Configuration**
   ```bash
   cd frontend
   copy .env.example .env
   ```

   The default `.env` should work:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   VITE_APP_NAME=Task Delegation Platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Verify Installation

### Check Database Connection
```bash
# Connect to PostgreSQL
docker exec -it taskdb psql -U postgres -d taskdb

# Inside psql, run:
\dt  # List tables (after migrations)
\q   # Quit
```

### Check Redis Connection
```bash
# Connect to Redis
docker exec -it taskredis redis-cli

# Inside redis-cli, run:
PING  # Should return PONG
exit
```

### Check Backend
Open browser or use curl:
```bash
curl http://localhost:8080/health
```

### Check Frontend
Open browser: `http://localhost:5173`

## Common Commands

### Backend
```bash
cd backend

# Run server
make run

# Build binary
make build

# Run tests
make test

# Clean build artifacts
make clean

# Run migrations up
make migrate-up

# Run migrations down
make migrate-down
```

### Frontend
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Project Structure

```
Task-Delegation-Bidding-Platform/
├── backend/              # Go backend
│   ├── cmd/api/         # Application entry point
│   ├── internal/        # Private application code
│   ├── migrations/      # Database migrations
│   ├── .env            # Environment variables (create from .env.example)
│   ├── go.mod          # Go dependencies
│   └── Makefile        # Build commands
│
├── frontend/            # React frontend
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── .env           # Environment variables (create from .env.example)
│   └── package.json   # Node dependencies
│
├── docker-compose.yml  # Database services
├── architecture.md     # Architecture documentation
└── README.md          # Project overview
```

## Troubleshooting

### Port Already in Use
If ports 5432, 6379, 8080, or 5173 are already in use:

**Option 1:** Stop the conflicting service
```bash
# Windows - Find process using port
netstat -ano | findstr :8080
# Kill process by PID
taskkill /PID <PID> /F
```

**Option 2:** Change ports in configuration files

### Docker Issues
```bash
# Restart Docker Desktop
# Then:
docker-compose down
docker-compose up -d
```

### Go Module Issues
```bash
cd backend
go clean -modcache
go mod download
go mod tidy
```

### Node Module Issues
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Database Connection Failed
1. Ensure Docker is running
2. Check if PostgreSQL container is healthy:
   ```bash
   docker ps
   ```
3. Restart the container:
   ```bash
   docker-compose restart postgres
   ```

## Next Steps

1. ✅ Setup complete
2. 📝 Create database migrations
3. 🔧 Implement backend API endpoints
4. 🎨 Build frontend components
5. 🧪 Add tests
6. 🚀 Deploy to production

## Development Workflow

1. Start Docker services: `docker-compose up -d`
2. Start backend: `cd backend && make run`
3. Start frontend: `cd frontend && npm run dev`
4. Make changes and test
5. Commit changes: `git add . && git commit -m "message"`
6. Push to repository: `git push`

## Support

For issues or questions:
- Check `architecture.md` for technical details
- Review `README.md` for project overview
- Check Docker logs: `docker-compose logs -f`
- Check backend logs in terminal
- Check browser console for frontend errors

---

**Happy Coding! 🚀**
