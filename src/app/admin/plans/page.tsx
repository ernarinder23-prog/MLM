import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function PlansPage() {
  const plans = await prisma.package.findMany({
    orderBy: { level: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          MLM Plan Management
        </h1>
        <Link href="/admin/plans/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading font-semibold text-primary">{p.name}</h3>
                <p className="text-sm text-text-secondary">
                  {p.type} • Level {p.level}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  p.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-text-secondary"
                }`}
              >
                {p.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-text-secondary">Amount:</span> ₹{p.amount}</p>
              <p><span className="text-text-secondary">BV:</span> {p.businessVolume}</p>
            </div>
            <Link
              href={`/admin/plans/${p.id}`}
              className="mt-4 inline-block text-secondary hover:underline text-sm"
            >
              Edit Plan
            </Link>
          </div>
        ))}
      </div>
      {plans.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-text-secondary mb-4">No plans yet</p>
          <Link href="/admin/plans/new" className="btn-primary inline-block">
            Create First Plan
          </Link>
        </div>
      )}
    </div>
  );
}
