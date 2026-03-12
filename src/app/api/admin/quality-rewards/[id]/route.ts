import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SUB_ADMIN" && !session.subAdminPerms?.managePlans) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "SUPER_ADMIN" && session.role !== "SUB_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

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

    await prisma.qualityReward.update({
      where: { id },
      data: {
        amount: amountValue,
        returnRate: returnValue,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update quality reward error:", error);
    return NextResponse.json({ error: "Failed to update quality reward" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "SUB_ADMIN" && !session.subAdminPerms?.managePlans) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "SUPER_ADMIN" && session.role !== "SUB_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.qualityReward.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete quality reward error:", error);
    return NextResponse.json({ error: "Failed to delete quality reward" }, { status: 500 });
  }
}
