import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateUserId } from "@/lib/user-id";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      placementId,
      placementSide,
      packageId,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email and password required" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: { email },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const parent = placementId ? await prisma.user.findUnique({
      where: { id: placementId, role: "INDIVIDUAL" },
    }) : null;

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const username = await generateUserId();
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: "INDIVIDUAL",
        sponsor: placementId ? { connect: { id: placementId } } : undefined,
        placementSide: placementSide === "RIGHT" ? "RIGHT" : "LEFT",
        package: packageId ? { connect: { id: packageId } } : undefined,
      },
    });

    if (parent) {
      const update: { leftChildId?: string; rightChildId?: string } = {};
      if (placementSide === "RIGHT") update.rightChildId = user.id;
      else update.leftChildId = user.id;
      await prisma.user.update({
        where: { id: parent.id },
        data: { ...update },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { parentId: parent.id },
      });
    }

    await prisma.wallet.create({
      data: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
