import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "FRANCHISE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      placementId,
      placementSide,
      packageId,
      investmentAmount,
      bankDetails,
      ePin,
    } = body;

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, username, email and password required" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 400 }
      );
    }

    const parent = placementId ? await prisma.user.findUnique({
      where: { id: placementId },
    }) : null;

    const passwordHash = await hashPassword(password);
    const invAmount = investmentAmount != null && investmentAmount !== "" ? parseFloat(investmentAmount) : null;
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
        franchiseId: session.userId,
        sponsorId: placementId || null,
        placementSide: placementSide === "RIGHT" ? "RIGHT" : "LEFT",
        packageId: packageId || null,
        investmentAmount: invAmount,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
        ePin: ePin || null,
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

    return NextResponse.json({ success: true, id: user.id });
  } catch (error) {
    console.error("Create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
