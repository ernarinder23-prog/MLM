import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
      username,
      email,
      phone,
      address,
      dateOfBirth,
      packageId,
      investmentAmount,
      bankDetails,
      ePin,
      isActive,
    } = body;

    if (!firstName || !lastName || !username || !email) {
      return NextResponse.json(
        { error: "First name, last name, username and email required" },
        { status: 400 }
      );
    }

    // Check if username or email is already in use by another user
    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: { id: userId },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 400 }
      );
    }

    const invAmount = investmentAmount != null && investmentAmount !== "" ? parseFloat(investmentAmount) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        email,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        packageId: packageId || null,
        investmentAmount: invAmount,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
        ePin: ePin || null,
        isActive,
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
