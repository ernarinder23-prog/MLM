import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function buildTree(userId: string, depth: number): Promise<{
  id: string;
  username: string;
  packageName?: string;
  investmentAmount?: number | null;
  businessVolume?: number | null;
  joiningDate?: string;
  left?: unknown;
  right?: unknown;
} | null> {
  if (depth > 10) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { package: true },
  });
  if (!user) return null;

  const leftId = user.leftChildId;
  const rightId = user.rightChildId;

  const [left, right] = await Promise.all([
    leftId ? buildTree(leftId, depth + 1) : null,
    rightId ? buildTree(rightId, depth + 1) : null,
  ]);

  const bv = user.package?.businessVolume ?? user.investmentAmount ?? 0;
  return {
    id: user.id,
    username: user.username,
    packageName: user.package?.name,
    investmentAmount: user.investmentAmount,
    businessVolume: bv,
    joiningDate: user.createdAt?.toISOString?.() || new Date(user.createdAt).toISOString(),
    left: left || null,
    right: right || null,
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rootId = request.nextUrl.searchParams.get("rootId");
  if (!rootId) return NextResponse.json({ error: "rootId required" }, { status: 400 });

  const node = await buildTree(rootId, 0);
  return NextResponse.json({ node });
}
