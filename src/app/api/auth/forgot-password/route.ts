import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { resetTokens } from "@/lib/reset-tokens";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If account exists, reset link will be sent" },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    resetTokens.set(token, { userId: user.id, expires });

    // TODO: Send email with reset link
    // await sendEmail(user.email, `Reset password: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);
    console.log("Reset token (dev only):", token);

    return NextResponse.json({
      message: "If account exists, reset link will be sent",
      devToken: process.env.NODE_ENV === "development" ? token : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
