import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, bankDetails } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 400 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    await prisma.withdrawal.create({
      data: {
        userId: session.userId,
        amount,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to submit withdrawal" },
      { status: 500 }
    );
  }
}
