import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WorkingPlanEditForm } from "./WorkingPlanEditForm";

export default async function WorkingPlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.workingPlan.findUnique({ where: { id } });
  if (!plan) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/working-plans" className="text-secondary hover:underline text-sm">Back to Working Plans</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Working Plan</h1>
      </div>
      <WorkingPlanEditForm plan={plan} />
    </div>
  );
}
