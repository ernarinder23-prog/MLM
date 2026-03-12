import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SUB_ADMIN" && !session.subAdminPerms?.managePlans) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "SUPER_ADMIN" && session.role !== "SUB_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const amountValue = typeof body.amount === "string" ? body.amount.trim() : "";
    const returnValue = Number(body.returnRate);

    if (!amountValue) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }
    if (!Number.isFinite(returnValue)) {
      return NextResponse.json({ error: "Valid return percentage required" }, { status: 400 });
    }

    const reward = await prisma.qualityReward.create({
      data: {
        amount: amountValue,
        returnRate: returnValue,
      },
    });

    return NextResponse.json({ success: true, id: reward.id });
  } catch (error) {
    console.error("Create quality reward error:", error);
    return NextResponse.json({ error: "Failed to create quality reward" }, { status: 500 });
  }
}
