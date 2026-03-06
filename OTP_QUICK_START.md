# OTP-Based Login System - Quick Start Configuration

## Step 1: Copy this configuration to your .env file

Your Twilio credentials (already registered):
```
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_ACCOUNT_SID_HERE
TWILIO_PHONE_NUMBER=+19089462860
```

## Step 2: Configure Email SMTP (Gmail Example)

1. Go to: https://www.google.com/accounts/Login
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Add these settings to .env:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM_EMAIL=noreply@cadencessolution.com
```

## Step 3: Security - Change JWT Secret

```
JWT_SECRET=your-very-long-secure-random-string-minimum-32-characters
```

## Complete .env template:

```
# Database (update with your database credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/mlm_db"

# Twilio Configuration (already configured - no changes needed)
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_ACCOUNT_SID_HERE
TWILIO_PHONE_NUMBER=+19089462860

# Email SMTP Configuration (configure with your email provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=noreply@cadencessolution.com

# JWT Secret
JWT_SECRET=mlm-secret-key-change-in-production

# Environment
NODE_ENV=development
```

## Step 4: Run migrations

```bash
npx prisma db push
npx prisma generate
```

## Step 5: Start development server

```bash
npm run dev
```

## Step 6: Test the login flow

Navigate to:
- Admin Login: http://localhost:3000/login?type=admin
- Franchise Login: http://localhost:3000/login?type=franchise
- Individual Login: http://localhost:3000/login

## Supported Phone Number Formats

- +1234567890 (International)
- +44 123 456 7890 (With spaces)
- 1234567890 (Without country code, if configured)

## Key Features

✅ OTP sent via SMS (Twilio)
✅ OTP sent via Email (SMTP)
✅ 6-digit OTP codes
✅ 2-minute expiration
✅ 5 attempt limit
✅ Resend option
✅ Role-based redirects
✅ Automatic session cleanup

## Troubleshooting

If OTP is not sending:
1. Verify all environment variables are set correctly
2. Check that the phone number or email exists in the database
3. Ensure the user account is active (isActive: true)
4. Check server logs for detailed error messages
5. Test Twilio credentials at: https://console.twilio.com

If email is not sending:
1. Verify SMTP credentials are correct
2. For Gmail: Ensure App Password is used (not regular password)
3. Check that 2FA is enabled on Gmail account
4. Check server logs for SMTP errors

## Next Steps

1. Update phone numbers and emails for all users/franchises in database
2. Configure production Twilio account separately
3. Set up email provider account separately
4. Implement additional security measures (rate limiting, audit logs)
5. Deploy to production with new environment variables
