import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sponsors = await prisma.user.findMany({
    where: { role: "INDIVIDUAL" },
    select: { id: true, username: true },
    orderBy: { username: "asc" },
  });
  return NextResponse.json({ sponsors });
}
