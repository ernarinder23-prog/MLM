import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default async function WorkingPlansPage() {
  const plans = await prisma.workingPlan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          Working Plan Management
        </h1>
        <Link href="/admin/working-plans/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Working Plan
        </Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-4 px-4 font-medium text-text-primary">Plan Name</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">ROI (%)</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">Created Date</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 px-4">{p.name}</td>
                  <td className="py-4 px-4">{p.roi}</td>
                  <td className="py-4 px-4 text-text-secondary">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/working-plans/${p.id}`}
                        className="text-secondary hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={p.id}
                        apiEndpoint="/api/admin/working-plans"
                        confirmMessage={`Delete working plan "${p.name}"? This action cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {plans.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No working plans yet</p>
        )}
      </div>
    </div>
  );
}
