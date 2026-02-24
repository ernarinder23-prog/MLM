import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, email, password, phone, address } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email and password required" },
        { status: 400 }
      );
    }

    const exists = await prisma.franchise.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const franchise = await prisma.franchise.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, id: franchise.id });
  } catch (error) {
    console.error("Create franchise:", error);
    return NextResponse.json(
      { error: "Failed to create franchise" },
      { status: 500 }
    );
  }
}
