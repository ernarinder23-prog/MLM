import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlanEditForm } from "./PlanEditForm";

export default async function PlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.package.findUnique({ where: { id } });
  if (!plan) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/plans" className="text-secondary hover:underline text-sm">← Back to Plans</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Plan</h1>
      </div>
      <PlanEditForm plan={plan} />
    </div>
  );
}
