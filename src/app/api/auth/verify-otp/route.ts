import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOTP } from "@/lib/otp-service";
import { createToken, getLoginRedirect } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code, loginType } = await request.json();

    if (!sessionId || !code) {
      return NextResponse.json(
        { error: "Session ID and OTP code are required" },
        { status: 400 }
      );
    }

    // OTP verification is only for franchise and individual, not admin
    if (loginType === "admin") {
      return NextResponse.json(
        { error: "Invalid login type for OTP" },
        { status: 400 }
      );
    }

    // Verify OTP
    const verification = await verifyOTP(sessionId, code);

    if (!verification.valid || !verification.identifier) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    const identifier = verification.identifier;
    let user: any = null;
    let userRole = "";

    // Find user based on loginType and identifier
    if (loginType === "franchise") {
      const franchise = await prisma.franchise.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
          isActive: true,
        },
      });

      if (franchise) {
        user = franchise;
        userRole = "FRANCHISE";
      }
    } else if (loginType === "individual") {
      const individualUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
          role: "INDIVIDUAL",
          isActive: true,
        },
        include: { subAdminPermissions: true },
      });

      if (individualUser) {
        user = individualUser;
        userRole = individualUser.role;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid login type" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create JWT token
    const payload: {
      userId: string;
      username: string;
      role: string;
      subAdminPerms?: any;
    } = {
      userId: user.id,
      username: user.username,
      role: userRole,
    };

    if (userRole === "SUB_ADMIN" && user.subAdminPermissions) {
      payload.subAdminPerms = user.subAdminPermissions;
    }

    const token = await createToken(payload as Parameters<typeof createToken>[0]);
    const redirect = getLoginRedirect(userRole);

    const response = NextResponse.json(
      {
        success: true,
        redirect,
        role: userRole,
      },
      { status: 200 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}
