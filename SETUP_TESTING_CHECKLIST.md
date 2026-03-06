# OTP System - Setup & Testing Checklist

## Phase 1: Configuration Setup

### Environment Variables
- [ ] Copy `.env.example` settings to `.env` file
- [ ] Add Twilio credentials:
  - [ ] TWILIO_ACCOUNT_SID=ACfe5a7b8b536c2bbeebe9566b2b30554d
  - [ ] TWILIO_AUTH_TOKEN=e550448fc9b387dc07df363f64edf590
  - [ ] TWILIO_PHONE_NUMBER=+19089462860
- [ ] Configure SMTP Email:
  - [ ] SMTP_HOST (e.g., smtp.gmail.com)
  - [ ] SMTP_PORT (e.g., 587)
  - [ ] SMTP_SECURE (false for port 587, true for 465)
  - [ ] SMTP_USER (your email)
  - [ ] SMTP_PASSWORD (app-specific password)
  - [ ] SMTP_FROM_EMAIL (sender email)
- [ ] Set JWT_SECRET to a secure random string
- [ ] Verify NODE_ENV setting

### Gmail Setup (if using Gmail for SMTP)
- [ ] Go to https://myaccount.google.com
- [ ] Enable 2-Factor Authentication
- [ ] Generate App Password at https://myaccount.google.com/apppasswords
- [ ] Use 16-character app password as SMTP_PASSWORD
- [ ] Do NOT use main Gmail password

### Database Setup
- [ ] Run: `npx prisma db push`
- [ ] Verify OtpSession table was created
- [ ] Run: `npx prisma generate`
- [ ] Check no Prisma errors in console

### Dependencies Verification
- [ ] `npm list twilio` shows twilio@4.x installed
- [ ] `npm list @types/twilio` shows types installed
- [ ] `npm list nodemailer` shows nodemailer@8.x installed
- [ ] All dependencies resolved without errors

---

## Phase 2: Code Verification

### File Existence Check
- [ ] src/lib/otp-service.ts exists
- [ ] src/app/api/auth/send-otp/route.ts exists
- [ ] src/app/api/auth/verify-otp/route.ts exists
- [ ] src/app/api/auth/resend-otp/route.ts exists
- [ ] src/components/OtpVerification.tsx exists
- [ ] src/app/verify-otp/page.tsx exists
- [ ] prisma/schema.prisma has OtpSession model

### Build Check
- [ ] Run: `npm run build`
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No compilation warnings

### Development Server
- [ ] Run: `npm run dev`
- [ ] Server starts without errors
- [ ] No runtime errors in console

---

## Phase 3: Database Testing

### User Setup
- [ ] Super Admin user exists with email
- [ ] Super Admin user exists with phone (+format)
- [ ] Franchise user exists with email
- [ ] Franchise user exists with phone (+format)
- [ ] Individual user exists with email
- [ ] Individual user exists with phone (+format)
- [ ] All test users have isActive: true

### OtpSession Table
- [ ] Table exists in database
- [ ] Indexes created: identifier, expiresAt
- [ ] Can insert sample OTP record
- [ ] Can update OTP record
- [ ] Can delete OTP record

---

## Phase 4: Individual Component Testing

### OTP Service Functions
- [ ] Test generateOTP() creates 6-digit string
- [ ] Test isEmailAddress() correctly validates emails
- [ ] Test isPhoneNumber() correctly validates phone numbers
- [ ] Test detectIdentifierType() returns correct type
- [ ] Test createOTPSession() creates database record
- [ ] Test verifyOTP() validates correct code
- [ ] Test verifyOTP() rejects incorrect code
- [ ] Test verifyOTP() respects max attempts
- [ ] Test verifyOTP() respects expiration

### API Endpoint Tests

**POST /api/auth/send-otp**
- [ ] Valid email → OTP sent successfully
- [ ] Valid phone → OTP sent successfully
- [ ] Invalid email → Error response
- [ ] Invalid phone → Error response
- [ ] Non-existent user → 404 response
- [ ] Inactive user → 404 response
- [ ] Admin loginType → finds admin user
- [ ] Franchise loginType → finds franchise user
- [ ] Individual loginType → finds individual user

**POST /api/auth/verify-otp**
- [ ] Valid OTP code → Returns token + redirect
- [ ] Invalid OTP code → Error response
- [ ] Expired OTP → Error response
- [ ] After 5 failed attempts → Error response
- [ ] Admin user → Redirects to /admin
- [ ] Franchise user → Redirects to /franchise
- [ ] Individual user → Redirects to /dashboard
- [ ] JWT token created successfully
- [ ] auth-token cookie set correctly

**POST /api/auth/resend-otp**
- [ ] Valid sessionId → New OTP sent
- [ ] Invalid sessionId → Error response
- [ ] Timer reset to 120 seconds
- [ ] Attempt counter reset to 0
- [ ] New OTP code generated

---

## Phase 5: UI Component Testing

### LoginForm Component
- [ ] Page loads without errors
- [ ] Input placeholder shows "Enter Phone Number or Email Address"
- [ ] Can enter phone number
- [ ] Can enter email address
- [ ] Form submits on button click
- [ ] Error message displays on form error
- [ ] Loading state shows "Sending OTP..."
- [ ] Redirects to verify-otp page on success
- [ ] SessionId passed in URL correctly
- [ ] LoginType passed in URL correctly

### OtpVerification Component
- [ ] Page loads with 6 OTP input fields
- [ ] Auto-focus works (focus moves to next field)
- [ ] Auto-focus works (focus moves to previous on backspace)
- [ ] Countdown timer displays (120 seconds)
- [ ] Timer counts down correctly
- [ ] "Verify OTP" button works
- [ ] "Resend OTP" button appears after expiry
- [ ] "Resend OTP" button calls API
- [ ] Error message displays on verification failure
- [ ] Attempt counter shows attempts/5
- [ ] Redirects to dashboard on success
- [ ] Displays "OTP expired" when time runs out

---

## Phase 6: Full Login Flow Testing

### Admin Login Flow (Email)
- [ ] Navigate to /login?type=admin
- [ ] Enter admin email address
- [ ] Click "Admin Login"
- [ ] OTP email received
- [ ] Navigate to verify-otp page
- [ ] Enter OTP code
- [ ] Click "Verify OTP"
- [ ] Redirected to /admin
- [ ] Session persists across page refresh
- [ ] Can access admin dashboard

### Admin Login Flow (Phone)
- [ ] Navigate to /login?type=admin
- [ ] Enter admin phone number
- [ ] Click "Admin Login"
- [ ] OTP SMS received
- [ ] Wait for redirected to verify-otp page
- [ ] Enter OTP code
- [ ] Click "Verify OTP"
- [ ] Redirected to /admin
- [ ] Can access admin dashboard

### Franchise Login Flow (Email)
- [ ] Navigate to /login?type=franchise
- [ ] Enter franchise email
- [ ] Click "Franchise Login"
- [ ] OTP email received
- [ ] Enter OTP code
- [ ] Redirected to /franchise
- [ ] Can access franchise dashboard

### Franchise Login Flow (Phone)
- [ ] Navigate to /login?type=franchise
- [ ] Enter franchise phone
- [ ] Click "Franchise Login"
- [ ] OTP SMS received
- [ ] Enter OTP code
- [ ] Redirected to /franchise

### Individual Login Flow (Email)
- [ ] Navigate to /login
- [ ] Enter individual email
- [ ] Click "Member Login"
- [ ] OTP email received
- [ ] Enter OTP code
- [ ] Redirected to /dashboard
- [ ] Can access member dashboard

### Individual Login Flow (Phone)
- [ ] Navigate to /login
- [ ] Enter individual phone
- [ ] Click "Member Login"
- [ ] OTP SMS received
- [ ] Enter OTP code
- [ ] Redirected to /dashboard

---

## Phase 7: Error Handling Testing

### Invalid Input
- [ ] Enter invalid email format → Error message
- [ ] Enter invalid phone format → Error message
- [ ] Enter empty field → Validation error
- [ ] Enter wrong OTP code → Error message
- [ ] Attempt wrong code 5 times → Access denied

### Expiration Scenarios
- [ ] Let OTP expire without entering code → Expiry message
- [ ] Click Resend OTP → New OTP sent
- [ ] Timer resets after resend
- [ ] Old session is invalid after resend

### Edge Cases
- [ ] User logged in → Try to access /login → No redirect
- [ ] Valid token → Try to access /verify-otp → No redirect
- [ ] Invalid/expired token → Try to access admin → Redirect to /login
- [ ] Multiple tabs sending OTP simultaneously → Both work

---

## Phase 8: Security Testing

### Session Security
- [ ] OTP codes don't match between different sessions
- [ ] OTP codes expire after 120 seconds
- [ ] OTP sessions are deleted after verification
- [ ] OTP sessions are deleted after expiry
- [ ] Cannot reuse old sessionId for verification

### Authentication
- [ ] JWT token is HttpOnly
- [ ] JWT token is secure in production
- [ ] JWT token has correct expiry (7 days)
- [ ] Logout clears auth-token cookie
- [ ] Cannot access protected routes without token

### Data Protection
- [ ] OTP codes not logged in plain text
- [ ] User credentials not exposed in API responses
- [ ] Error messages don't reveal sensitive info

---

## Phase 9: Browser Compatibility Testing

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile devices
- [ ] Input fields work on iOS keyboard
- [ ] Input fields work on Android keyboard

---

## Phase 10: Production Readiness

### Documentation
- [ ] [OTP_IMPLEMENTATION_GUIDE.md](OTP_IMPLEMENTATION_GUIDE.md) reviewed
- [ ] [OTP_QUICK_START.md](OTP_QUICK_START.md) reviewed
- [ ] API documentation understood
- [ ] Troubleshooting guide reviewed

### Monitoring Setup
- [ ] Error logging configured
- [ ] OTP delivery tracking enabled
- [ ] User login tracking enabled
- [ ] Performance monitoring in place

### Backup Plans
- [ ] Backup Twilio account configured (optional)
- [ ] Backup email provider configured (optional)
- [ ] Fallback authentication method planned
- [ ] Recovery process documented

### Security Hardening
- [ ] Rate limiting implemented (optional)
- [ ] IP blocking for failed attempts (optional)
- [ ] CAPTCHA implemented (optional)
- [ ] Audit logs enabled

---

## Sign-Off Checklist

- [ ] All phases completed
- [ ] All tests passed
- [ ] No remaining errors
- [ ] Documentation reviewed
- [ ] Team trained on new system
- [ ] Ready for production deployment

---

## Notes for Team

**Completed By:** _______________
**Date:** _______________
**Notes/Issues:** 
```
[Add any issues encountered and how they were resolved]
```

---

## Quick Reference

### Common Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Database operations
npx prisma db push
npx prisma generate

# Test endpoints
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@email.com","loginType":"individual"}'
```

### Login URLs
- Admin: http://localhost:3000/login?type=admin
- Franchise: http://localhost:3000/login?type=franchise
- Individual: http://localhost:3000/login
- OTP Verify: http://localhost:3000/verify-otp

### Support Contacts
- Environment: [Configure as needed]
- Email Support: [Configure as needed]
- SMS Provider: Twilio Support
- Database: [Configure as needed]

---

**Last Updated:** March 6, 2026
**System Status:** ✅ Ready for Testing
