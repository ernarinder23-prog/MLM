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
    const { name, type, amount, level, businessVolume } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const pkg = await prisma.package.create({
      data: {
        name,
        type: type || "FIXED",
        amount: amount ?? 0,
        level: level ?? 1,
        businessVolume: businessVolume ?? 0,
      },
    });
    return NextResponse.json({ success: true, id: pkg.id });
  } catch (error) {
    console.error("Create plan:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
