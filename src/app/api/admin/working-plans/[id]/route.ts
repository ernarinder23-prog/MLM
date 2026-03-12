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
    const name = (body.name || "").toString().trim();
    const roiValue = Number(body.roi);

    if (!name) {
      return NextResponse.json({ error: "Plan name required" }, { status: 400 });
    }
    if (!Number.isFinite(roiValue)) {
      return NextResponse.json({ error: "Valid ROI required" }, { status: 400 });
    }

    await prisma.workingPlan.update({
      where: { id },
      data: {
        name,
        roi: roiValue,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update working plan error:", error);
    return NextResponse.json({ error: "Failed to update working plan" }, { status: 500 });
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
    await prisma.workingPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete working plan error:", error);
    return NextResponse.json({ error: "Failed to delete working plan" }, { status: 500 });
  }
}
