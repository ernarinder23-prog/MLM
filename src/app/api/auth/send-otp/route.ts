import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createOTPSession,
  detectIdentifierType,
} from "@/lib/otp-service";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, loginType } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone/Email and password are required" },
        { status: 400 }
      );
    }

    // OTP flow is only for franchise and individual, not admin
    if (loginType === "admin") {
      return NextResponse.json(
        { error: "Invalid login type for OTP" },
        { status: 400 }
      );
    }

    // Detect identifier type
    const type = detectIdentifierType(identifier);
    if (!type) {
      return NextResponse.json(
        { error: "Invalid phone number or email address" },
        { status: 400 }
      );
    }

    let user: any = null;
    let userRole = "";
    let passwordHash = "";

    // Find and verify credentials based on loginType
    if (loginType === "franchise") {
      // For franchise, check Franchise table
      const franchise = await prisma.franchise.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
          isActive: true,
        },
      });

      if (franchise) {
        user = franchise;
        userRole = "FRANCHISE";
        passwordHash = franchise.passwordHash;
      }
    } else if (loginType === "individual") {
      // For individual, check User table with INDIVIDUAL role
      const individualUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
          role: "INDIVIDUAL",
          isActive: true,
        },
      });

      if (individualUser) {
        user = individualUser;
        userRole = individualUser.role;
        passwordHash = individualUser.passwordHash;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid login type" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Credentials are valid, create OTP session and send OTP
    const otpType = type === "phone" ? "sms" : "email";

    const result = await createOTPSession(identifier, otpType);

    if (!result) {
      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (otpType === "sms") {
        errorMessage = "Failed to send SMS. This phone number may not be verified in Twilio. Please verify it in your Twilio Console or try with an email address instead.";
      } else {
        errorMessage = "Failed to send OTP email. Please try again.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: result.sessionId,
        message: `OTP sent via ${otpType === "sms" ? "SMS" : "Email"}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
