import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { resetTokens } from "@/lib/reset-tokens";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid token and password (min 6 chars) required" },
        { status: 400 }
      );
    }

    const data = resetTokens.get(token);
    if (!data || data.expires < Date.now()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    resetTokens.delete(token);
    const hash = await hashPassword(password);
    await prisma.user.update({
      where: { id: data.userId },
      data: { passwordHash: hash },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Reset failed" },
      { status: 500 }
    );
  }
}
