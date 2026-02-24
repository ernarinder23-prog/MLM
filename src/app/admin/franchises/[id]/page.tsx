import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FranchiseEditForm } from "./FranchiseEditForm";

export default async function FranchiseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const franchise = await prisma.franchise.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!franchise) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/franchises" className="text-secondary hover:underline text-sm">← Back to Franchises</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Franchise</h1>
        <p className="text-text-secondary text-sm mt-1">{franchise._count.users} members</p>
      </div>
      <FranchiseEditForm franchise={franchise} />
    </div>
  );
}
