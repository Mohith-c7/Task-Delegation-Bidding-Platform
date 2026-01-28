# Phase 1: Backend Restructuring - COMPLETE ✅

## 🎯 Goal: Unified Platform (No Role-Based Restrictions)

**Concept:** Like GitHub/LinkedIn - everyone is equal, anyone can post tasks and bid on tasks.

---

## ✅ Changes Completed

### 1. User Model Simplified
**File:** `backend/internal/models/user.go`

**Before:**
```go
type User struct {
    ID           string
    Name         string
    Email        string
    PasswordHash string
    Role         UserRole  // ❌ Removed
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

**After:**
```go
type User struct {
    ID           string
    Name         string
    Email        string
    PasswordHash string
    // No role field - everyone is equal
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

### 2. Registration Simplified
**File:** `backend/internal/models/user.go`

**Before:**
```go
type RegisterRequest struct {
    Name     string
    Email    string
    Password string
    Role     UserRole  // ❌ Removed - no need to choose role
}
```

**After:**
```go
type RegisterRequest struct {
    Name     string
    Email    string
    Password string
    // No role selection needed
}
```

### 3. JWT Token Simplified
**File:** `backend/internal/utils/jwt.go`

**Before:**
```go
type Claims struct {
    UserID string
    Email  string
    Role   string  // ❌ Removed
}
```

**After:**
```go
type Claims struct {
    UserID string
    Email  string
    // No role in token
}
```

### 4. Repository Updated
**File:** `backend/internal/repository/user_repo.go`

- Removed role from INSERT queries
- Removed role from SELECT queries
- Simplified user creation and retrieval

### 5. Auth Service Updated
**File:** `backend/internal/services/auth_service.go`

- Registration no longer requires role
- Token generation doesn't include role
- User creation simplified

### 6. Bid Approval Logic Updated
**File:** `backend/internal/services/bid_service.go`

**Before:**
```go
// Check if manager is the task owner
if task.OwnerID != managerID {
    return errors.New("only task owner can approve bids")
}
```

**After:**
```go
// Check if approver is the task owner
if task.OwnerID != approverID {
    return errors.New("only task owner can approve bids")
}
```

**Key Change:** Task owner approves their own bids (not a separate "manager")

### 7. Middleware Simplified
**File:** `backend/internal/middleware/auth.go`

- Removed `RoleMiddleware` function
- Auth middleware no longer sets role in context
- No role-based access control

### 8. Database Migration Created
**File:** `backend/migrations/000004_remove_role_from_users.up.sql`

```sql
-- Remove role column from users table
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Remove role index if it exists
DROP INDEX IF EXISTS idx_users_role;
```

---

## 🔄 What Changed in Business Logic

### Before (Role-Based)
1. ❌ Users must choose role at registration (task_owner, bidder, manager)
2. ❌ Only task_owners can create tasks
3. ❌ Only bidders can place bids
4. ❌ Only managers can approve bids
5. ❌ Role-based UI restrictions

### After (Unified Platform)
1. ✅ All users are equal - no role selection
2. ✅ Anyone can create tasks (when unavailable/overloaded)
3. ✅ Anyone can bid on tasks (to help others)
4. ✅ Task owner approves bids on their own tasks
5. ✅ No role-based restrictions

---

## 📋 To Apply Changes (When Docker is Running)

### Step 1: Start Docker Desktop
```
Open Docker Desktop application
Wait for it to start completely
```

### Step 2: Start Database
```bash
docker compose up -d
```

### Step 3: Run Migration
```powershell
Get-Content backend\migrations\000004_remove_role_from_users.up.sql | docker exec -i taskdb psql -U postgres -d taskdb
```

### Step 4: Start Backend
```bash
cd backend
go run cmd/api/main.go
```

### Step 5: Verify
```bash
# Should see: ✓ Connected to PostgreSQL
# Should see: 🚀 Server starting on http://localhost:8080
```

---

## 🧪 Testing After Migration

### Test 1: Register New User (No Role)
```powershell
$body = @{
    name="Alice Johnson"
    email="alice@example.com"
    password="password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Expected:** User created without role field

### Test 2: Login
```powershell
$body = @{
    email="alice@example.com"
    password="password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Expected:** Login successful, no role in response

### Test 3: Create Task (Any User)
```powershell
$token = "<access_token_from_login>"
$body = @{
    title="Need help with API"
    description="I'm unavailable, need someone to complete this"
    skills=@("Node.js","REST API")
    deadline="2026-02-15T10:00:00Z"
    priority="high"
} | ConvertTo-Json

$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/tasks" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

**Expected:** Task created successfully

### Test 4: Place Bid (Any User)
```powershell
# Login as different user
$body = @{
    email="bob@example.com"
    password="password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.access_token

# Place bid
$taskId = "<task_id>"
$body = @{
    message="I can help with this!"
    estimated_completion="2026-02-10T10:00:00Z"
} | ConvertTo-Json

$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/tasks/$taskId/bids" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

**Expected:** Bid placed successfully

### Test 5: Approve Bid (Task Owner)
```powershell
# Login as task owner (Alice)
$body = @{
    email="alice@example.com"
    password="password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.access_token

# Approve bid
$bidId = "<bid_id>"
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bids/$bidId/approve" -Method Patch -Headers $headers
```

**Expected:** Bid approved, task assigned to bidder

---

## 📊 Files Modified

### Backend Files Changed (9 files)
1. ✅ `backend/internal/models/user.go` - Removed role
2. ✅ `backend/internal/services/auth_service.go` - Simplified registration
3. ✅ `backend/internal/services/bid_service.go` - Task owner approves
4. ✅ `backend/internal/repository/user_repo.go` - Removed role queries
5. ✅ `backend/internal/middleware/auth.go` - Removed role middleware
6. ✅ `backend/internal/utils/jwt.go` - Removed role from token
7. ✅ `backend/migrations/000004_remove_role_from_users.up.sql` - Migration
8. ✅ `backend/migrations/000004_remove_role_from_users.down.sql` - Rollback

---

## 🎯 What This Achieves

### Unified Platform Benefits
1. **Simpler Registration** - Just name, email, password
2. **Equal Users** - Everyone has same capabilities
3. **Flexible Participation** - Post tasks when busy, bid when available
4. **Social Collaboration** - Like GitHub/LinkedIn
5. **Task Owner Control** - You approve bids on your own tasks
6. **No Artificial Restrictions** - No role-based limitations

### Real-World Scenario
```
Alice (Developer):
- Monday: Posts task "Fix bug in payment module" (she's on vacation)
- Tuesday: Bids on Bob's task "Code review needed" (she's available)
- Wednesday: Approves Charlie's bid on her task

Bob (Developer):
- Monday: Bids on Alice's task
- Tuesday: Posts task "Code review needed"
- Wednesday: Approves Alice's bid

Everyone helps everyone - true collaboration!
```

---

## 🚀 Next: Phase 2 (Frontend Restructuring)

Once backend is running, Phase 2 will update:
1. Remove role selection from registration page
2. Remove role display from UI
3. Unified dashboard for all users
4. Show both "My Tasks" and "My Bids" to everyone
5. Simplified navigation

---

## 📝 Summary

**Phase 1 Status:** ✅ COMPLETE

**Changes Made:**
- Removed role field from user model
- Simplified registration (no role selection)
- Task owner approves their own bids
- Removed role-based restrictions
- Created database migration

**Pending:**
- Apply migration (when Docker is running)
- Restart backend
- Test new unified flow

**Next Phase:**
- Frontend restructuring to match backend changes

---

**The backend is now a unified platform where everyone is equal!** 🎉
