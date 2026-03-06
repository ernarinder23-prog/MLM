# OTP API Testing Guide

## Quick Test Using cURL

### 1. Send OTP via Email

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "loginType": "admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "clx1a2b3c4d5e6f7g8h9i0j1k",
  "message": "OTP sent via Email"
}
```

### 2. Send OTP via SMS (Phone)

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+19089462860",
    "loginType": "individual"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "clx1a2b3c4d5e6f7g8h9i0j1k",
  "message": "OTP sent via SMS"
}
```

### 3. Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "code": "123456",
    "loginType": "individual"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "redirect": "/dashboard",
  "role": "INDIVIDUAL"
}
```

**Expected Response (Failure):**
```json
{
  "error": "Invalid or expired OTP"
}
```

### 4. Resend OTP

```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clx1a2b3c4d5e6f7g8h9i0j1k"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

## Testing in Postman

### 1. Create New Request - Send OTP

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/send-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "identifier": "user@example.com",
  "loginType": "individual"
}
```

### 2. Create New Request - Verify OTP

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "sessionId": "SESSION_ID_FROM_SEND_OTP",
  "code": "OTP_CODE_RECEIVED",
  "loginType": "individual"
}
```

### 3. Create New Request - Resend OTP

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/resend-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "sessionId": "SESSION_ID_FROM_SEND_OTP"
}
```

---

## Testing Different User Types

### Admin User Testing

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin-email@example.com",
    "loginType": "admin"
  }'
```

**Expected Redirect:** `/admin`

### Franchise User Testing

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "franchise-email@example.com",
    "loginType": "franchise"
  }'
```

**Expected Redirect:** `/franchise`

### Individual User Testing

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "individual-email@example.com",
    "loginType": "individual"
  }'
```

**Expected Redirect:** `/dashboard`

---

## Error Scenarios

### Invalid Email Format

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "not-an-email",
    "loginType": "individual"
  }'
```

**Response:**
```json
{
  "error": "Invalid phone number or email address"
}
```

### User Not Found

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "nonexistent@example.com",
    "loginType": "individual"
  }'
```

**Response:**
```json
{
  "error": "User not found"
}
```

### Invalid OTP Code

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "valid-session-id",
    "code": "000000",
    "loginType": "individual"
  }'
```

**Response:**
```json
{
  "error": "Invalid or expired OTP"
}
```

### Maximum Attempts Exceeded

After 5 failed verification attempts:

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-with-5-attempts",
    "code": "123456",
    "loginType": "individual"
  }'
```

**Response:**
```json
{
  "error": "Invalid or expired OTP"
}
```

---

## Testing Phone Number Formats

### Valid Phone Formats Accepted

```bash
# International format
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+1 (908) 946-2860",
    "loginType": "individual"
  }'

# With country code
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+19089462860",
    "loginType": "individual"
  }'

# Various formats with spaces
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+1 908 946 2860",
    "loginType": "individual"
  }'
```

---

## Manual Browser Testing

### Step 1: Send OTP

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:

```javascript
fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    loginType: 'individual'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

4. Note the `sessionId` from response

### Step 2: Verify OTP

```javascript
fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'YOUR_SESSION_ID',
    code: 'YOUR_OTP_CODE',
    loginType: 'individual'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Checking Twilio Delivery Status

### Via Twilio Dashboard

1. Log in to https://console.twilio.com
2. Navigate to Logs > SMS
3. Check delivery status of sent messages

### Via API

```bash
# Get SMS logs from Twilio (requires Twilio API)
curl "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

---

## Email Testing

### Gmail SMTP Test

```javascript
// Test SMTP connection in Node.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Connected successfully');
  }
});
```

### Test Email Sending

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "loginType": "individual"
  }'

# Check email inbox for OTP
```

---

## Performance Testing

### Load Testing Send OTP

```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 -p data.json \
  -T application/json \
  http://localhost:3000/api/auth/send-otp

# File content: data.json
# {"identifier":"user@example.com","loginType":"individual"}
```

### Response Time Analysis

```bash
time curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "loginType": "individual"
  }'
```

---

## Debugging Tips

### Enable Debug Logging

Add to your API route:
```typescript
console.log('Request body:', req.body);
console.log('OTP Session:', otpSession);
console.log('Verification result:', verification);
```

### Check Database Directly

```bash
# Via Prisma Studio
npx prisma studio

# Then navigate to OtpSession table to view all sessions
```

### Monitor Network Requests

1. Open Browser DevTools
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Make login requests
5. Inspect request/response headers and body

### Check Server Logs

```bash
# View Next.js dev server logs
npm run dev

# Look for console.log() output and errors
```

---

## Test Data Setup

### Create Test Users (SQL)

```sql
-- Create test admin
INSERT INTO "User" (id, username, email, phone, "passwordHash", "firstName", "lastName", role, "isActive")
VALUES ('admin1', 'testadmin', 'admin@test.com', '+1234567890', 'hash', 'Test', 'Admin', 'SUPER_ADMIN', true);

-- Create test franchise
INSERT INTO "Franchise" (id, username, email, phone, "passwordHash", "isActive")
VALUES ('franch1', 'testfranchise', 'franchise@test.com', '+1234567891', 'hash', true);

-- Create test individual
INSERT INTO "User" (id, username, email, phone, "passwordHash", "firstName", "lastName", role, "isActive")
VALUES ('indiv1', 'testindividual', 'indiv@test.com', '+1234567892', 'hash', 'Test', 'Individual', 'INDIVIDUAL', true);
```

---

## Common Issues & Solutions

### Issue: OTP Not Sending
**Solution:** 
- Check Twilio credentials in .env
- Verify user exists in database
- Check server logs for errors
- Test Twilio account status

### Issue: Email Not Received
**Solution:**
- Verify SMTP credentials
- Check spam/junk folder
- Verify sender email is configured
- Check email service rate limits

### Issue: Verification Fails
**Solution:**
- Verify sessionId is correct
- Verify code is not expired (120 seconds)
- Verify attempt count < 5
- Check OTP code is exactly 6 digits

### Issue: Session Not Found
**Solution:**
- Regenerate OTP session
- Check sessionId from send-otp response
- Verify sessionId hasn't expired
- Use correct sessionId format

---

## Next Steps

1. ✅ Set up test database records
2. ✅ Configure environment variables
3. ✅ Run send-otp test
4. ✅ Verify OTP received
5. ✅ Run verify-otp test
6. ✅ Confirm successful login
7. ✅ Test all three user types
8. ✅ Document results

---

**Test Date:** _______________  
**Tester:** _______________  
**Status:** ✅ Ready for Testing
