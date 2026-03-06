import nodemailer from "nodemailer";
import twilio from "twilio";
import { prisma } from "@/lib/db";

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || "ACfe5a7b8b536c2bbeebe9566b2b30554d";
const authToken = process.env.TWILIO_AUTH_TOKEN || "e550448fc9b387dc07df363f64edf590";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+19089462860";

export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Configure Email Transporter
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL || "er.narinder23@gmail.com",
    pass: process.env.SMTP_PASSWORD || "bbkr gxob hdik hdvc",
  },
});


export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPViaSMS(phoneNumber: string, code: string): Promise<boolean> {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      console.error("Twilio not configured", { twilioClient: !!twilioClient, twilioPhoneNumber });
      return false;
    }

    console.log(`Attempting to send SMS to ${phoneNumber} from ${twilioPhoneNumber}`);

    await twilioClient.messages.create({
      body: `Your OTP is: ${code}. Do not share this with anyone. This code expires in 2 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`SMS sent successfully to ${phoneNumber}`);
    return true;
  } catch (error: any) {
    const errorCode = error?.code;
    let userFriendlyMessage = "Error sending SMS";
    
    // Handle Twilio-specific error codes
    if (errorCode === 21408) {
      userFriendlyMessage = "This phone number is not verified in your Twilio account. Please verify it in Twilio Console or use an email address instead.";
    } else if (errorCode === 21211) {
      userFriendlyMessage = "The 'To' phone number is not a valid phone number.";
    } else if (errorCode === 21214) {
      userFriendlyMessage = "The 'From' phone number is not a valid Twilio number.";
    }
    
    console.error("Error sending SMS:", { 
      message: error?.message, 
      code: errorCode,
      status: error?.status,
      phoneNumber,
      userFriendlyMessage
    });
    return false;
  }
}

export async function sendOTPViaEmail(email: string, code: string): Promise<boolean> {
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_EMAIL || "er.narinder23@gmail.com",
      to: email,
      subject: "Your OTP for Login",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">One-Time Password (OTP) for Login</h2>
          <p style="font-size: 16px; color: #555;">
            Your OTP code is:
          </p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #888; font-size: 14px;">
            This code expires in 2 minutes and can only be used once.
          </p>
          <p style="color: #888; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function createOTPSession(
  identifier: string,
  type: "email" | "sms"
): Promise<{ code: string; sessionId: string } | null> {
  try {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Clean up old sessions for this identifier
    await prisma.otpSession.deleteMany({
      where: {
        identifier,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const session = await prisma.otpSession.create({
      data: {
        identifier,
        type,
        code,
        expiresAt,
        attemptCount: 0,
      },
    });

    // Send OTP
    let sent = false;

    if (type === "sms") {
      // Normalize phone number to E.164 format for Twilio
      const normalizedPhone = normalizePhoneNumber(identifier);
      sent = await sendOTPViaSMS(normalizedPhone, code);
    } else {
      sent = await sendOTPViaEmail(identifier, code);
    }

    if (!sent) {
      await prisma.otpSession.delete({
        where: { id: session.id },
      });
      return null;
    }

    return { code: session.code, sessionId: session.id };
  } catch (error) {
    console.error("Error creating OTP session:", error);
    return null;
  }
}

export async function verifyOTP(
  sessionId: string,
  code: string
): Promise<{ valid: boolean; identifier?: string }> {
  try {
    const session = await prisma.otpSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { valid: false };
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await prisma.otpSession.delete({
        where: { id: sessionId },
      });
      return { valid: false };
    }

    // Check if max attempts exceeded
    if (session.attemptCount >= session.maxAttempts) {
      await prisma.otpSession.delete({
        where: { id: sessionId },
      });
      return { valid: false };
    }

    // Check if code matches
    if (session.code !== code) {
      // Increment attempt count
      await prisma.otpSession.update({
        where: { id: sessionId },
        data: { attemptCount: session.attemptCount + 1 },
      });
      return { valid: false };
    }

    // OTP is valid, mark as verified
    await prisma.otpSession.update({
      where: { id: sessionId },
      data: { isVerified: true },
    });

    return { valid: true, identifier: session.identifier };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { valid: false };
  }
}

export async function resendOTP(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.otpSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return false;
    }

    // If not expired and already tried many times, don't resend
    if (session.attemptCount >= session.maxAttempts) {
      return false;
    }

    // Send OTP again
    const sent =
      session.type === "sms"
        ? await sendOTPViaSMS(session.identifier, session.code)
        : await sendOTPViaEmail(session.identifier, session.code);

    if (!sent) {
      return false;
    }

    // Reset attempt count on resend
    await prisma.otpSession.update({
      where: { id: sessionId },
      data: {
        attemptCount: 0,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // Reset expiry to 2 minutes
      },
    });

    return true;
  } catch (error) {
    console.error("Error resending OTP:", error);
    return false;
  }
}

export async function getOTPSessionDetails(sessionId: string) {
  try {
    const session = await prisma.otpSession.findUnique({
      where: { id: sessionId },
    });
    return session;
  } catch (error) {
    console.error("Error getting OTP session:", error);
    return null;
  }
}

export function isPhoneNumber(value: string): boolean {
  // Remove whitespace and special characters for validation
  const cleaned = value.replace(/\D/g, "");
  return cleaned.length >= 10; // Basic phone number check
}

export function normalizePhoneNumber(value: string): string {
  // Remove all non-digit characters
  let cleaned = value.replace(/\D/g, "");
  
  // If it doesn't start with 1 (US country code), add it
  if (cleaned.length === 10) {
    cleaned = "1" + cleaned;
  }
  
  // Return in E.164 format: +<country_code><number>
  return "+" + cleaned;
}

export function isEmailAddress(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function detectIdentifierType(value: string): "phone" | "email" | null {
  if (isPhoneNumber(value)) {
    return "phone";
  }
  if (isEmailAddress(value)) {
    return "email";
  }
  return null;
}
