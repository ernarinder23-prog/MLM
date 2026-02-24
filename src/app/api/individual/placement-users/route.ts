import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: "INDIVIDUAL" },
    select: { id: true, username: true },
    orderBy: { username: "asc" },
  });

  return NextResponse.json({ users });
}
