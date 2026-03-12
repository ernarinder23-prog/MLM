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
    const name = (body.name || "").toString().trim();
    const roiValue = Number(body.roi);

    if (!name) {
      return NextResponse.json({ error: "Plan name required" }, { status: 400 });
    }
    if (!Number.isFinite(roiValue)) {
      return NextResponse.json({ error: "Valid ROI required" }, { status: 400 });
    }

    const plan = await prisma.workingPlan.create({
      data: {
        name,
        roi: roiValue,
      },
    });

    return NextResponse.json({ success: true, id: plan.id });
  } catch (error) {
    console.error("Create working plan error:", error);
    return NextResponse.json({ error: "Failed to create working plan" }, { status: 500 });
  }
}
