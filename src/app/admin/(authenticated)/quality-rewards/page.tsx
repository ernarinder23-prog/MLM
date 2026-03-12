import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default async function QualityRewardsPage() {
  const rewards = await prisma.qualityReward.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          Quality Rewards Management
        </h1>
        <Link href="/admin/quality-rewards/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Reward
        </Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-4 px-4 font-medium text-text-primary">Amount</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">Return (%)</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">Created Date</th>
                <th className="text-left py-4 px-4 font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 px-4">{r.amount}</td>
                  <td className="py-4 px-4">{r.returnRate}</td>
                  <td className="py-4 px-4 text-text-secondary">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/quality-rewards/${r.id}`}
                        className="text-secondary hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={r.id}
                        apiEndpoint="/api/admin/quality-rewards"
                        confirmMessage="Delete reward? This action cannot be undone."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rewards.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No quality rewards yet</p>
        )}
      </div>
    </div>
  );
}
