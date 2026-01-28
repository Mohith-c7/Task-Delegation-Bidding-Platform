# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Go installed
- ✅ Node.js installed
- ✅ Docker Desktop running

---

## Step 1: Start Databases (30 seconds)

```bash
docker compose up -d
```

Wait for containers to be healthy.

---

## Step 2: Run Migrations (30 seconds)

```powershell
Get-Content backend\migrations\000001_create_users_table.up.sql | docker exec -i taskdb psql -U postgres -d taskdb
Get-Content backend\migrations\000002_create_tasks_table.up.sql | docker exec -i taskdb psql -U postgres -d taskdb
Get-Content backend\migrations\000003_create_bids_table.up.sql | docker exec -i taskdb psql -U postgres -d taskdb
```

---

## Step 3: Start Backend (10 seconds)

```bash
cd backend
go run cmd/api/main.go
```

You should see: `🚀 Server starting on http://localhost:8080`

---

## Step 4: Start Frontend (1 minute first time, 10 seconds after)

**First time only:**
```bash
cd frontend
npm install
```

**Every time:**
```bash
npm run dev
```

You should see: `Local: http://localhost:5173/`

---

## Step 5: Test the Application

1. **Open browser:** http://localhost:5173

2. **Login with test account:**
   - Email: `john@example.com`
   - Password: `password123`

3. **You should see:**
   - Dashboard with welcome message
   - Real tasks from database
   - Task cards with details

---

## 🎯 What You Can Do Now

### As Task Owner (john@example.com)
- View all open tasks
- See your posted tasks
- (API ready: Create, edit, delete tasks)
- (API ready: Approve/reject bids)

### As Bidder (jane@example.com)
- View all open tasks
- (API ready: Place bids on tasks)
- (API ready: View your bids)

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill the process if needed
taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill the process if needed
taskkill /PID <PID> /F
```

### Database connection failed
```bash
# Check if Docker is running
docker ps

# Restart containers
docker compose restart
```

### Can't login
- Make sure backend is running on port 8080
- Check browser console for errors
- Verify .env file exists in frontend folder

---

## 📚 Next Steps

1. **Explore the API:**
   - Check `API_TEST_RESULTS.md` for all endpoints
   - Test with PowerShell or Postman

2. **Read Documentation:**
   - `PROJECT_STATUS.md` - Complete overview
   - `architecture.md` - System design
   - `TASK_MODULE_COMPLETE.md` - Tasks API
   - `BIDS_MODULE_COMPLETE.md` - Bids API

3. **Extend the Frontend:**
   - Add task creation form
   - Add bidding interface
   - Add more pages

---

## 🎉 You're All Set!

The platform is running with:
- ✅ Backend API on port 8080
- ✅ Frontend on port 5173
- ✅ PostgreSQL on port 5432
- ✅ Redis on port 6379

**Happy coding! 🚀**
