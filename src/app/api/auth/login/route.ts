import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken, getLoginRedirect } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    let user: { id: string; username: string; role: string; passwordHash: string; subAdminPermissions?: object } | null = null;

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        isActive: true,
      },
      include: { subAdminPermissions: true },
    });

    if (dbUser) {
      user = {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        passwordHash: dbUser.passwordHash,
        subAdminPermissions: dbUser.subAdminPermissions || undefined,
      };
    } else {
      const franchise = await prisma.franchise.findFirst({
        where: {
          OR: [{ username }, { email: username }],
          isActive: true,
        },
      });
      if (franchise) {
        user = {
          id: franchise.id,
          username: franchise.username,
          role: "FRANCHISE",
          passwordHash: franchise.passwordHash,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const payload: {
      userId: string;
      username: string;
      role: string;
      subAdminPerms?: object;
    } = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    if (user.role === "SUB_ADMIN" && user.subAdminPermissions) {
      payload.subAdminPerms = user.subAdminPermissions;
    }

    const token = await createToken(payload as Parameters<typeof createToken>[0]);
    const redirect = getLoginRedirect(user.role);

    const response = NextResponse.json({
      success: true,
      redirect,
      role: user.role as string,
    });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
