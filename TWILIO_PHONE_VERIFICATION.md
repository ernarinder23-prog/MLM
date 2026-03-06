# Twilio Phone Verification Guide

## Why SMS Not Working? 

If you see the error: **"Failed to send SMS. This phone number may not be verified in Twilio. Please verify it in your Twilio Console or try with an email address instead."**

This means your Twilio account is in **Trial Mode**, which restricts SMS sending to only:
- Pre-verified phone numbers
- Your own Twilio account phone number
- Numbers you explicitly whitelist

## Solution 1: Verify Phone Numbers in Twilio Console (5 minutes)

### Step 1: Go to Twilio Console
1. Visit: https://console.twilio.com/
2. Sign in with your Twilio account

### Step 2: Navigate to Phone Numbers
1. In the left sidebar, click **Phone Numbers**
2. Click **Manage** 
3. Click **Verified Caller IDs** (or similar option for your phone number type)

### Step 3: Add Your Test Number
1. Click **Add a Verified Caller ID** (or similar button)
2. Enter the phone number you want to test with
3. Example: `+17307363566` (must include country code)
4. Click **Call me** or **Send me SMS**
5. Wait for verification code
6. Enter the code when prompted
7. Click **Verify**

### Step 4: Retry Login
1. Go back to your MLM login page
2. Select **Franchise Login** or **Member Login**
3. Enter the verified phone number (e.g., +17307363566)
4. Enter password
5. Click login button
6. **SMS OTP should now arrive!** ✅

---

## Solution 2: Use Email for Testing (Immediate)

Email OTP is fully operational with no restrictions:

1. Go to MLM login page
2. Select **Franchise Login** or **Member Login**
3. Enter your **email address** instead of phone number
4. Example: `user@gmail.com`
5. Enter password
6. Click login button
7. **Email OTP should arrive immediately!** ✅

---

## Solution 3: Upgrade Twilio Account (Permanent)

For unrestricted SMS access:

1. Go to: https://www.twilio.com/console
2. Click **Upgrade Account** (in top right)
3. Complete the paid account setup
4. Add payment method
5. No phone verification needed anymore
6. SMS works to any number worldwide

**Cost:** Twilio charges per SMS (typically $0.0075 USD per SMS sent)

---

## Testing Phone Numbers

Different country codes for testing:
```
USA:        +1 (7307363566 → +17307363566)
UK:         +44 (20XXXX → +442071XXXXXX)
India:      +91 (98XXXXX → +919XXXXXXXXX)
Canada:     +1 (647XXXX → +16475XXXXXX)
Australia:  +61 (2XXXX → +6120XXXXXXX)
```

Make sure country code matches phone format!

---

## Troubleshooting Common Issues

### "Permission to send an SMS has not been enabled for the region"
**Error Code:** 21408
**Solution:** Verify phone number in Twilio Console OR upgrade account

### "The 'To' number is not a valid phone number"
**Error Code:** 21211
**Solution:** 
- Ensure phone number is in E.164 format: `+1XXXXXXXXXX`
- Include country code with `+`
- Check for typos

### "The 'From' number is invalid"
**Error Code:** 21214
**Solution:** Contact Twilio support or regenerate account SID/Auth Token

---

## Email OTP (Fully Working Alternative)

**No setup needed!** Email OTP works immediately:

**Email Service:** Gmail (er.narinder23@gmail.com)
**Features:**
- Instant delivery (usually <1 second)
- No phone verification required
- Works in Trial mode
- HTML formatted OTP email

**To Use:**
1. During login, enter your email address: `user@email.com`
2. Enter password
3. OTP arrives in inbox
4. Enter 6-digit code in verification page
5. Access dashboard

---

## Quick Reference

| Feature | Email OTP | SMS OTP |
|---------|-----------|---------|
| Status | ✅ Works | ⚠️ Trial Only |
| Setup Time | None | ~5 min |
| Verification Needed | No | Yes (or upgrade) |
| Delivery Time | <1 second | <5 seconds |
| Works in Trial | Yes | No |
| Recommended | Yes | After verification |

---

## Still Having Issues?

1. **Check Server Console:**
   - Run: `npm run dev`
   - Look for error messages with code details
   - Share error code with Twilio support: https://www.twilio.com/docs/errors/

2. **Verify Credentials:**
   - Account SID: `YOUR_ACCOUNT_SID_HERE`
   - Phone: `+19089462860`
   - Check Twilio Console for account status

3. **Test Email First:**
   - Email definitely works, so test that flow
   - Once verified, phone SMS will work too

4. **Contact Support:**
   - Twilio: https://support.twilio.com/
   - Make sure SMS is enabled in trial account: https://console.twilio.com/us/account/general/settings
