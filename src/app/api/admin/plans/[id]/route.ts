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
  const body = await request.json();

  await prisma.package.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type || "FIXED",
      amount: body.amount ?? 0,
      level: body.level ?? 1,
      businessVolume: body.businessVolume ?? 0,
      isActive: !!body.isActive,
    },
  });

  return NextResponse.json({ success: true });
}
