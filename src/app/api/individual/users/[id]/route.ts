import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = params.id;
    const body = await request.json();

    // Verify that the user to update was created by the current individual
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.sponsorId !== session.userId) {
      return NextResponse.json(
        { error: "You can only edit users you created" },
        { status: 403 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      packageId,
      investmentAmount,
      bankDetails,
      ePin,
      isActive,
      planType,
      planDuration,
      password,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name and email required" },
        { status: 400 }
      );
    }

    if (!planType || !planDuration) {
      return NextResponse.json(
        { error: "Plan type and duration required" },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const invAmount = investmentAmount != null && investmentAmount !== "" ? parseFloat(investmentAmount) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        package: packageId ? { connect: { id: packageId } } : { disconnect: true },
        investmentAmount: invAmount,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
        isActive,
        planType,
        planDuration,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
        ...(ePin !== undefined ? { ePin: ePin || null } : {}),
      },
    });

    return NextResponse.json({ success: true, id: updatedUser.id });
  } catch (error) {
    console.error("Update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = params.id;

    // Verify that the user to delete was created by the current individual
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.sponsorId !== session.userId) {
      return NextResponse.json(
        { error: "You can only delete users you created" },
        { status: 403 }
      );
    }

    // Delete related records first
    await prisma.wallet.deleteMany({
      where: { userId },
    });

    await prisma.kyc.deleteMany({
      where: { userId },
    });

    await prisma.withdrawal.deleteMany({
      where: { userId },
    });

    await prisma.transaction.deleteMany({
      where: { userId },
    });

    await prisma.activityLog.deleteMany({
      where: { userId },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
