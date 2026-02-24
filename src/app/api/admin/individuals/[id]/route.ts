import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const invAmount = body.investmentAmount != null && body.investmentAmount !== "" ? parseFloat(body.investmentAmount) : null;

  await prisma.user.update({
    where: { id, role: "INDIVIDUAL" },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      packageId: body.packageId || null,
      investmentAmount: invAmount,
      bankDetails: body.bankDetails ? JSON.stringify(body.bankDetails) : null,
      ePin: body.ePin || null,
      isActive: !!body.isActive,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id, role: "INDIVIDUAL" },
      select: {
        id: true,
        username: true,
        leftChildId: true,
        rightChildId: true,
        parentId: true,
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: `Individual with ID "${id}" not found` }, { status: 404 });
    }

    // Check if user has referrals
    if (user._count.referrals > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${user.username}". They have ${user._count.referrals} direct referral(s). Please remove or reassign referrals first.` },
        { status: 400 }
      );
    }

    // Check if user has children in binary tree (leftChildId or rightChildId)
    if (user.leftChildId || user.rightChildId) {
      const children = [user.leftChildId, user.rightChildId].filter(Boolean).length;
      return NextResponse.json(
        { error: `Cannot delete "${user.username}". They have ${children} child(ren) in the binary tree. Please remove or reassign children first.` },
        { status: 400 }
      );
    }

    // Check if any other user references this user as sponsor or parent
    const referencedAsSponsor = await prisma.user.count({
      where: { sponsorId: id },
    });
    if (referencedAsSponsor > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${user.username}". They are referenced as sponsor by ${referencedAsSponsor} user(s).` },
        { status: 400 }
      );
    }

    // Clear binary tree references from parent if exists
    if (user.parentId) {
      const parent = await prisma.user.findUnique({
        where: { id: user.parentId },
        select: { id: true, leftChildId: true, rightChildId: true },
      });
      if (parent) {
        const update: { leftChildId?: null; rightChildId?: null } = {};
        if (parent.leftChildId === id) update.leftChildId = null;
        if (parent.rightChildId === id) update.rightChildId = null;
        if (Object.keys(update).length > 0) {
          await prisma.user.update({
            where: { id: parent.id },
            data: update,
          });
        }
      }
    }

    // Delete user (cascade will delete wallet, transactions, withdrawals, etc.)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete individual:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete individual: ${errorMessage}` },
      { status: 500 }
    );
  }
}
