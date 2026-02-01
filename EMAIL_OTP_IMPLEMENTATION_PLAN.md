# Email & OTP Authentication Implementation Plan

## 📊 Current State Analysis

### ✅ What's Built
1. **Backend (Go)**
   - User authentication with JWT
   - Password-based login
   - Task management (CRUD)
   - Bidding system
   - PostgreSQL database
   - Redis for caching

2. **Frontend (React)**
   - Login/Register pages
   - Dashboard with tasks
   - Bid management
   - Unified user experience

3. **Database**
   - Users table (no role field)
   - Tasks table
   - Bids table

### ❌ What's Missing (Per README FR9)
1. **Email Notifications** - "Users receive updates on task and bid activities"
2. **OTP Authentication** - Enhanced security
3. **Email Verification** - Verify user emails
4. **Password Reset** - Forgot password flow
5. **SMTP Configuration** - Custom email service

---

## 🎯 Requirements Analysis

### From README (FR9: Notifications)
- Users must receive email updates on:
  - New bids on their tasks
  - Bid approval/rejection
  - Task assignment
  - Task completion
  - System notifications

### Additional Security Requirements
- **Email Verification** - Verify email on signup
- **OTP for Login** - Two-factor authentication
- **OTP for Signup** - Verify email ownership
- **Password Reset** - Secure password recovery
- **Custom SMTP** - Organization's email server

---

## 🏗️ Implementation Plan

### Phase 1: Email Infrastructure (Backend)

#### 1.1 SMTP Service Setup
**Files to Create:**
- `backend/internal/services/email_service.go`
- `backend/internal/config/smtp.go`
- `backend/internal/utils/email_templates.go`

**Features:**
- Custom SMTP configuration
- Email template system
- HTML email support
- Retry mechanism
- Error handling

**Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@taskhub.com
SMTP_FROM_NAME=TaskHub
```

#### 1.2 OTP Service
**Files to Create:**
- `backend/internal/services/otp_service.go`
- `backend/internal/models/otp.go`
- `backend/internal/repository/otp_repo.go`

**Features:**
- Generate 6-digit OTP
- Store in Redis (5-minute expiry)
- Verify OTP
- Rate limiting (max 3 attempts)
- Resend OTP (max 3 times per hour)

**Database:**
```sql
-- OTP stored in Redis
Key: otp:{email}:{purpose}
Value: {code: "123456", attempts: 0, created_at: timestamp}
TTL: 300 seconds (5 minutes)
```

#### 1.3 Email Verification
**Files to Update:**
- `backend/internal/models/user.go` - Add `email_verified` field
- `backend/internal/services/auth_service.go` - Add verification logic
- `backend/migrations/000005_add_email_verification.up.sql`

**Flow:**
1. User registers → OTP sent to email
2. User enters OTP → Email verified
3. User can login only if verified

---

### Phase 2: Authentication Flows

#### 2.1 Signup with Email Verification
**Endpoints:**
- `POST /api/v1/auth/register` - Send OTP to email
- `POST /api/v1/auth/verify-email` - Verify OTP and create account

**Flow:**
```
1. User enters: name, email, password
2. Backend generates OTP
3. OTP sent to email
4. User enters OTP
5. Backend verifies OTP
6. Account created with email_verified=true
7. JWT token returned
```

#### 2.2 Login with OTP (Optional 2FA)
**Endpoints:**
- `POST /api/v1/auth/login` - Send OTP to email
- `POST /api/v1/auth/verify-login` - Verify OTP and login

**Flow:**
```
1. User enters: email, password
2. Password verified
3. OTP sent to email
4. User enters OTP
5. Backend verifies OTP
6. JWT token returned
```

#### 2.3 Forgot Password
**Endpoints:**
- `POST /api/v1/auth/forgot-password` - Send OTP to email
- `POST /api/v1/auth/verify-reset-otp` - Verify OTP
- `POST /api/v1/auth/reset-password` - Reset password with token

**Flow:**
```
1. User enters email
2. OTP sent to email
3. User enters OTP
4. Backend verifies OTP, returns reset token
5. User enters new password
6. Password updated
```

---

### Phase 3: Notification System

#### 3.1 Event-Based Notifications
**Files to Create:**
- `backend/internal/services/notification_service.go`
- `backend/internal/models/notification.go`
- `backend/internal/events/events.go`

**Events to Handle:**
1. **Task Created** - Notify relevant users
2. **Bid Placed** - Notify task owner
3. **Bid Approved** - Notify bidder
4. **Bid Rejected** - Notify bidder
5. **Task Assigned** - Notify assigned user
6. **Task Completed** - Notify task owner

#### 3.2 Email Templates
**Templates to Create:**
- Welcome email
- Email verification OTP
- Login OTP
- Password reset OTP
- New bid notification
- Bid approved notification
- Bid rejected notification
- Task assigned notification
- Task completed notification

---

### Phase 4: Frontend Implementation

#### 4.1 OTP Input Components
**Files to Create:**
- `frontend/src/components/auth/OTPInput.tsx`
- `frontend/src/components/auth/EmailVerification.tsx`
- `frontend/src/pages/ForgotPassword.tsx`
- `frontend/src/pages/ResetPassword.tsx`

#### 4.2 Updated Auth Flows
**Files to Update:**
- `frontend/src/pages/Register.tsx` - Add OTP verification step
- `frontend/src/pages/Login.tsx` - Add optional OTP step
- `frontend/src/services/authService.ts` - Add OTP methods

#### 4.3 Notification UI
**Files to Create:**
- `frontend/src/components/common/NotificationBell.tsx`
- `frontend/src/components/common/NotificationList.tsx`
- `frontend/src/pages/Notifications.tsx`

---

### Phase 5: Database Changes

#### 5.1 Users Table Update
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
CREATE INDEX idx_users_email_verified ON users(email_verified);
```

#### 5.2 Notifications Table (Optional)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## 📋 Detailed Implementation Steps

### Step 1: SMTP Service (Backend)

**1.1 Create Email Service**
```go
// backend/internal/services/email_service.go
type EmailService struct {
    smtpHost     string
    smtpPort     int
    smtpUsername string
    smtpPassword string
    smtpFrom     string
    smtpFromName string
}

func (s *EmailService) SendOTP(email, otp, purpose string) error
func (s *EmailService) SendWelcome(email, name string) error
func (s *EmailService) SendBidNotification(email, taskTitle string) error
```

**1.2 Create OTP Service**
```go
// backend/internal/services/otp_service.go
type OTPService struct {
    redis        *redis.Client
    emailService *EmailService
}

func (s *OTPService) GenerateOTP(email, purpose string) (string, error)
func (s *OTPService) VerifyOTP(email, purpose, code string) (bool, error)
func (s *OTPService) ResendOTP(email, purpose string) error
```

### Step 2: Update Auth Endpoints

**2.1 Register with Email Verification**
```
POST /api/v1/auth/register
Body: {name, email, password}
Response: {message: "OTP sent to email"}

POST /api/v1/auth/verify-email
Body: {email, otp}
Response: {user, access_token, refresh_token}
```

**2.2 Login with Optional OTP**
```
POST /api/v1/auth/login
Body: {email, password, use_otp: true}
Response: {message: "OTP sent"} OR {user, tokens}

POST /api/v1/auth/verify-login
Body: {email, otp}
Response: {user, access_token, refresh_token}
```

**2.3 Forgot Password**
```
POST /api/v1/auth/forgot-password
Body: {email}
Response: {message: "OTP sent"}

POST /api/v1/auth/verify-reset-otp
Body: {email, otp}
Response: {reset_token}

POST /api/v1/auth/reset-password
Body: {reset_token, new_password}
Response: {message: "Password reset successful"}
```

### Step 3: Notification System

**3.1 Event Handlers**
```go
// Trigger on bid placement
func (s *NotificationService) OnBidPlaced(bid *Bid, task *Task)

// Trigger on bid approval
func (s *NotificationService) OnBidApproved(bid *Bid, task *Task)

// Trigger on task assignment
func (s *NotificationService) OnTaskAssigned(task *Task, assignee *User)
```

### Step 4: Frontend Components

**4.1 OTP Input Component**
```tsx
<OTPInput
  length={6}
  onComplete={(otp) => handleVerify(otp)}
  onResend={() => handleResend()}
/>
```

**4.2 Email Verification Flow**
```tsx
// Step 1: Register form
<RegisterForm onSubmit={handleRegister} />

// Step 2: OTP verification
<EmailVerification 
  email={email}
  onVerify={handleVerifyOTP}
  onResend={handleResendOTP}
/>
```

---

## 🔒 Security Considerations

### OTP Security
- ✅ 6-digit random code
- ✅ 5-minute expiry
- ✅ Max 3 verification attempts
- ✅ Max 3 resends per hour
- ✅ Rate limiting per IP
- ✅ Stored in Redis (auto-expire)

### Email Security
- ✅ TLS/SSL encryption
- ✅ SPF/DKIM configuration
- ✅ No sensitive data in emails
- ✅ Unsubscribe option
- ✅ Email validation

### Password Reset Security
- ✅ OTP verification required
- ✅ Reset token (single-use, 15-min expiry)
- ✅ Password strength validation
- ✅ Logout all sessions on reset

---

## 📊 Testing Plan

### Unit Tests
- OTP generation and verification
- Email sending (mock SMTP)
- Rate limiting
- Token expiry

### Integration Tests
- Complete signup flow
- Complete login flow
- Password reset flow
- Notification delivery

### Manual Tests
- Real email delivery
- OTP expiry
- Resend functionality
- Error handling

---

## 🚀 Deployment Checklist

### Environment Setup
- [ ] SMTP credentials configured
- [ ] Redis running
- [ ] Email templates created
- [ ] Rate limiting configured

### Database
- [ ] Migration applied (email_verified field)
- [ ] Indexes created
- [ ] Notifications table (if using)

### Testing
- [ ] Send test emails
- [ ] Verify OTP flow
- [ ] Test rate limiting
- [ ] Test error scenarios

---

## 📈 Success Metrics

### Functional
- ✅ Email delivery rate > 99%
- ✅ OTP verification success rate > 95%
- ✅ Email verification completion rate > 80%
- ✅ Password reset success rate > 90%

### Performance
- ✅ Email sent within 5 seconds
- ✅ OTP verification < 100ms
- ✅ No email queue backlog

### Security
- ✅ Zero OTP brute force attempts
- ✅ All emails encrypted (TLS)
- ✅ No leaked OTPs in logs

---

## 🎯 Priority Order

### High Priority (Must Have)
1. ✅ SMTP service setup
2. ✅ OTP service
3. ✅ Email verification on signup
4. ✅ Forgot password flow
5. ✅ Basic email notifications

### Medium Priority (Should Have)
6. ✅ Login with OTP (2FA)
7. ✅ Rich email templates
8. ✅ Notification preferences
9. ✅ In-app notifications

### Low Priority (Nice to Have)
10. ✅ Email analytics
11. ✅ Notification history
12. ✅ Digest emails
13. ✅ SMS notifications

---

## 📝 Implementation Timeline

### Week 1: Email Infrastructure
- Day 1-2: SMTP service
- Day 3-4: OTP service
- Day 5: Email templates

### Week 2: Authentication Flows
- Day 1-2: Email verification
- Day 3-4: Forgot password
- Day 5: Login with OTP

### Week 3: Notifications
- Day 1-2: Notification service
- Day 3-4: Event handlers
- Day 5: Email notifications

### Week 4: Frontend & Testing
- Day 1-2: OTP components
- Day 3-4: Auth flow updates
- Day 5: Testing & deployment

---

## 🎉 Expected Outcome

**A complete email & OTP authentication system with:**
- ✅ Secure signup with email verification
- ✅ Optional 2FA with OTP
- ✅ Secure password reset
- ✅ Automated email notifications
- ✅ Custom SMTP configuration
- ✅ Production-ready security

**This will fulfill FR9 (Notifications) from the README and add enterprise-grade security to the platform.**

---

**Status:** 📋 Plan Complete - Ready for Implementation  
**Next Step:** Start with Phase 1 - Email Infrastructure
