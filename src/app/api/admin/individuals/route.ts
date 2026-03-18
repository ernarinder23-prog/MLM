import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { generateUserId } from "@/lib/user-id";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      investmentAmount,
      bankDetails,
      ePin,
      planType,
      planDuration,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email and password required" },
        { status: 400 }
      );
    }

    if (!planType || !planDuration) {
      return NextResponse.json(
        { error: "Plan type and duration required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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

    const passwordHash = await hashPassword(password);
    const invAmount = investmentAmount != null && investmentAmount !== "" ? parseFloat(investmentAmount) : null;
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
        investmentAmount: invAmount,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
        ePin: ePin || null,
        planType,
        planDuration,
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

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName, user.username, password);

    return NextResponse.json({ success: true, id: user.id });
  } catch (error) {
    console.error("Create individual:", error);
    return NextResponse.json(
      { error: "Failed to create individual" },
      { status: 500 }
    );
  }
}
