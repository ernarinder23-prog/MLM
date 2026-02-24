import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SUB_ADMIN" && !session.subAdminPerms?.approveWithdrawals) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "SUPER_ADMIN" && session.role !== "SUB_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();
  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!withdrawal || withdrawal.status !== "PENDING") {
    return NextResponse.json({ error: "Invalid withdrawal" }, { status: 400 });
  }

  if (status === "APPROVED") {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: withdrawal.userId },
    });
    if (!wallet || wallet.balance < withdrawal.amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: withdrawal.userId },
        data: { balance: { decrement: withdrawal.amount } },
      }),
      prisma.withdrawal.update({
        where: { id },
        data: {
          status: "APPROVED",
          processedAt: new Date(),
          processedBy: session.userId,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: "WITHDRAWAL",
          amount: -withdrawal.amount,
          description: "Withdrawal approved",
        },
      }),
    ]);
  } else {
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        processedBy: session.userId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
