# OTP-Based Login System Implementation Guide

## Overview

The login system has been updated to use OTP (One-Time Password) verification instead of traditional password-based authentication. Users can now log in using either:

- **Phone Number** (via SMS using Twilio)
- **Email Address** (via Email using SMTP)

## Changes Made

### 1. Database Schema Updates

**New Model: `OtpSession`**
Located in `prisma/schema.prisma`, this model stores OTP verification data:
- `id`: Unique session identifier
- `identifier`: Phone number or email address
- `type`: "email" or "sms"
- `code`: The 6-digit OTP
- `attemptCount`: Number of failed verification attempts
- `isVerified`: Whether the OTP has been verified
- `maxAttempts`: Maximum allowed attempts (default: 5)
- `expiresAt`: OTP expiration time (2 minutes from creation)

### 2. New Files Created

#### Backend Services
- **[src/lib/otp-service.ts](src/lib/otp-service.ts)**
  - `generateOTP()`: Generates a random 6-digit OTP
  - `sendOTPViaSMS()`: Sends OTP via Twilio
  - `sendOTPViaEmail()`: Sends OTP via SMTP
  - `createOTPSession()`: Creates OTP session and sends OTP
  - `verifyOTP()`: Verifies OTP code
  - `resendOTP()`: Resends OTP with reset counters
  - `detectIdentifierType()`: Detects if input is phone or email

#### API Endpoints
- **[src/app/api/auth/send-otp/route.ts](src/app/api/auth/send-otp/route.ts)**
  - POST `/api/auth/send-otp`
  - Initiates OTP sending
  - Validates user exists in system
  - Returns sessionId for OTP verification

- **[src/app/api/auth/verify-otp/route.ts](src/app/api/auth/verify-otp/route.ts)**
  - POST `/api/auth/verify-otp`
  - Verifies OTP code
  - Creates JWT token on success
  - Sets auth-token cookie
  - Returns redirect URL based on user role

- **[src/app/api/auth/resend-otp/route.ts](src/app/api/auth/resend-otp/route.ts)**
  - POST `/api/auth/resend-otp`
  - Resends OTP to user
  - Resets attempt counter
  - Extends expiration time

#### UI Components
- **[src/components/OtpVerification.tsx](src/components/OtpVerification.tsx)**
  - OTP verification screen component
  - 6-digit OTP input fields with auto-focus
  - 120-second countdown timer
  - Attempt tracking (5 attempts max)
  - Resend OTP option

#### Pages
- **[src/app/verify-otp/page.tsx](src/app/verify-otp/page.tsx)**
  - OTP verification page

### 3. Updated Files

#### Components
- **[src/components/LoginForm.tsx](src/components/LoginForm.tsx)**
  - Changed from username/password to phone/email
  - Updated placeholder to "Enter Phone Number or Email Address"
  - Sends OTP on form submission
  - Redirects to OTP verification page

#### Middleware
- **[src/middleware.ts](src/middleware.ts)**
  - Added `/verify-otp` to PUBLIC_PATHS
  - Allows unauthenticated users to access OTP verification page

## Environment Configuration

### Required Environment Variables

Add the following to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACfe5a7b8b536c2bbeebe9566b2b30554d
TWILIO_AUTH_TOKEN=e550448fc9b387dc07df363f64edf590
TWILIO_PHONE_NUMBER=+19089462860

# Email SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=noreply@cadencessolution.com

# JWT Secret (change in production)
JWT_SECRET=mlm-secret-key-change-in-production
```

### Twilio Configuration

Your Twilio credentials are already provided:
- **Account SID**: ACfe5a7b8b536c2bbeebe9566b2b30554d
- **Auth Token**: e550448fc9b387dc07df363f64edf590
- **Phone Number**: +19089462860

### Email SMTP Configuration

For Gmail (recommended):
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as `SMTP_PASSWORD`

For other providers, use the appropriate SMTP settings.

## OTP Flow

### 1. Login Initiation
```
User enters phone/email → Clicks "Login" → System validates user exists
```

### 2. OTP Sending
```
System identifies identifier type (phone/email)
↓
Creates OTP session with 6-digit code
↓
Sends via Twilio SMS or Email SMTP
↓
Returns sessionId to frontend
```

### 3. OTP Verification
```
User receives OTP → Enters 6 digits → Clicks "Verify OTP"
↓
System verifies code and session validity
↓
If correct: Creates JWT token → Sets auth cookie → Redirects to dashboard
If incorrect: Shows error → Allows retry (max 5 attempts)
If expired: Shows "OTP expired" → User can resend
```

### 4. OTP Expiry & Resend
```
Timer: 120 seconds
↓
When expired: "Resend OTP" button becomes active
↓
User clicks "Resend OTP" → New OTP generated → Timer resets
```

## Login Flow by User Type

### Super Admin / Sub Admin Login
1. Navigate to `/admin/login` (or `/login?type=admin`)
2. Enter phone number or email
3. Click "Admin Login"
4. Complete OTP verification
5. Redirected to `/admin` dashboard

### Franchise Login
1. Navigate to `/login?type=franchise`
2. Enter phone number or email
3. Click "Franchise Login"
4. Complete OTP verification
5. Redirected to `/franchise` dashboard

### Individual/Member Login
1. Navigate to `/login`
2. Enter phone number or email
3. Click "Member Login"
4. Complete OTP verification
5. Redirected to `/dashboard`

## Security Features

### OTP Security
- **Expiration**: OTPs expire after 2 minutes
- **Attempt Limit**: Maximum 5 verification attempts per session
- **Random Generation**: 6-digit random code (1 in 1 million possibilities)
- **Single Use**: OTP is valid for one-time use only
- **Session Based**: Each OTP session is tracked and cleaned up after expiration

### Backend Security
- OTP codes are not exposed to client until verification
- Attempt counter increments on failed attempts
- Expired sessions are automatically deleted
- JWT tokens are HttpOnly cookies

## Database Cleanup

Old OTP sessions are automatically cleaned up when:
1. `createOTPSession()` is called (removes expired sessions for the identifier)
2. OTP verification completes (session is used)
3. User resends OTP (old session is reset)

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Twilio account (already configured)
- Email service (Gmail or alternative SMTP)

### Installation Steps

1. **Install dependencies** (if not already done):
```bash
npm install twilio
npm install --save-dev @types/twilio
```

2. **Update environment variables**:
```bash
# Copy the settings provided to your .env file
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Run database migration**:
```bash
npx prisma db push
# or
npx prisma migrate deploy
```

4. **Generate Prisma Client**:
```bash
npx prisma generate
```

5. **Test the system**:
```bash
npm run dev
# Navigate to http://localhost:3000/login
```

## Testing the OTP System

### Test 1: Send OTP via SMS
1. Log in with a registered phone number associated with an admin/franchise/individual
2. Verify OTP is received via SMS
3. Complete login flow

### Test 2: Send OTP via Email
1. Log in with a registered email address
2. Verify OTP is received via email
3. Complete login flow

### Test 3: OTP Expiry
1. Request OTP
2. Wait 120+ seconds
3. Verify "OTP expired" message appears
4. Click "Resend OTP" and verify new OTP is sent

### Test 4: Maximum Attempts
1. Request OTP
2. Enter wrong code 5 times
3. Verify access is denied after 5 attempts
4. Resend OTP to continue

### Test 5: Role-Based Redirects
- **Admin**: Redirects to `/admin` after successful OTP
- **Franchise**: Redirects to `/franchise` after successful OTP
- **Individual**: Redirects to `/dashboard` after successful OTP

## Troubleshooting

### OTP Not Sending
**Problem**: OTP is not received via SMS or email

**Solutions**:
1. Verify Twilio credentials are correct in `.env`
2. Verify SMTP credentials are correct in `.env`
3. Check that user exists in database with phone/email
4. Check server logs for error messages
5. Verify user is active (`isActive: true`) in database

### OTP Verification Failing
**Problem**: OTP verification fails even with correct code

**Solutions**:
1. Verify code is entered correctly (6 digits)
2. Check OTP hasn't expired (120 second limit)
3. Verify attempt count hasn't exceeded 5
4. Check server logs for specific error
5. Try resending OTP

### User Not Found
**Problem**: System says user not found

**Solutions**:
1. Verify user exists in `User` or `Franchise` table
2. Check phone/email format matches database
3. Verify user `isActive` is set to `true`
4. Ensure phone numbers are in international format (e.g., +1234567890)

### Session Expired
**Problem**: Session expires before completing verification

**Solutions**:
1. OTP session is valid for 2 minutes
2. Click "Resend OTP" to get a new code and reset the timer
3. Complete verification quickly within the 2-minute window

## Production Considerations

### Before Going Live

1. **Change JWT Secret**:
```env
JWT_SECRET=your-secure-random-string-minimum-32-characters
```

2. **Secure Email Credentials**:
- Use app-specific passwords, not main account password
- Store credentials in secure environment variables
- Consider using environment-specific secrets management

3. **Monitor OTP Delivery**:
- Set up logging/monitoring for OTP failures
- Track SMS costs with Twilio
- Monitor email delivery rates

4. **Rate Limiting**:
Consider implementing rate limiting on `/api/auth/send-otp` to prevent abuse

5. **User Communication**:
- Update user documentation about new login process
- Send notifications about OTP changes
- Provide support contact information

6. **Backup Contact Methods**:
- Allow users to update phone numbers and emails
- Provide alternative recovery methods if primary contact fails

## API Reference

### POST /api/auth/send-otp

**Request**:
```json
{
  "identifier": "+1234567890 or email@example.com",
  "loginType": "admin | franchise | individual"
}
```

**Response on Success (200)**:
```json
{
  "success": true,
  "sessionId": "cuid-string",
  "message": "OTP sent via SMS/Email"
}
```

**Response on Error**:
```json
{
  "error": "User not found | Invalid email/phone | Failed to send OTP"
}
```

### POST /api/auth/verify-otp

**Request**:
```json
{
  "sessionId": "cuid-string",
  "code": "123456",
  "loginType": "admin | franchise | individual"
}
```

**Response on Success (200)**:
```json
{
  "success": true,
  "redirect": "/admin | /franchise | /dashboard",
  "role": "SUPER_ADMIN | SUB_ADMIN | FRANCHISE | INDIVIDUAL"
}
```

**Response on Error**:
```json
{
  "error": "Invalid or expired OTP | User not found"
}
```

### POST /api/auth/resend-otp

**Request**:
```json
{
  "sessionId": "cuid-string"
}
```

**Response on Success (200)**:
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

## Support & Maintenance

### Log Monitoring
Monitor these endpoints for issues:
- `/api/auth/send-otp` - OTP sending failures
- `/api/auth/verify-otp` - OTP verification failures
- Server logs for Twilio and email errors

### Database Maintenance
The `OtpSession` table grows with each login attempt. Consider:
- Regular cleanup of expired sessions (auto-deleted by system)
- Monitoring table size
- Setting up automated cleanup jobs if needed

### Updates & Improvements
Potential future enhancements:
- Backup OTP delivery method (email if SMS fails)
- OTP delivery status tracking
- User preferences for OTP method
- Multi-factor authentication support
- Rate limiting per IP/user

---

## Notes

- The system replaces the traditional password-based login
- Users must have a phone number or email in the database
- OTP codes are randomly generated 6-digit numbers
- All logins are session-based with JWT tokens
- Session timeout is 7 days (configurable in auth.ts)

---

Last Updated: March 6, 2026
