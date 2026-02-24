import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await prisma.franchise.update({
    where: { id },
    data: {
      name: body.name,
      username: body.username,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      isActive: !!body.isActive,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if franchise has users
    const franchise = await prisma.franchise.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }

    if (franchise._count.users > 0) {
      return NextResponse.json(
        { error: "Cannot delete franchise with existing members. Please reassign or remove members first." },
        { status: 400 }
      );
    }

    await prisma.franchise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete franchise:", error);
    return NextResponse.json(
      { error: "Failed to delete franchise" },
      { status: 500 }
    );
  }
}
