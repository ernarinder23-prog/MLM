import { prisma } from "@/lib/db";
import Link from "next/link";
import { WithdrawalActions } from "./WithdrawalActions";

export default async function WithdrawalsPage() {
  const withdrawals = await prisma.withdrawal.findMany({
    include: {
      user: { select: { id: true, username: true, firstName: true, lastName: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Withdrawal Approval Panel
      </h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-4 px-4 font-medium">User</th>
                <th className="text-left py-4 px-4 font-medium">Amount</th>
                <th className="text-left py-4 px-4 font-medium">Status</th>
                <th className="text-left py-4 px-4 font-medium">Requested</th>
                <th className="text-left py-4 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    {w.user.firstName} {w.user.lastName} ({w.user.username})
                  </td>
                  <td className="py-4 px-4 font-medium">₹{w.amount}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        w.status === "PENDING"
                          ? "bg-warning/10 text-warning"
                          : w.status === "APPROVED"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-secondary">
                    {new Date(w.requestedAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    {w.status === "PENDING" && (
                      <WithdrawalActions withdrawalId={w.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {withdrawals.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No withdrawal requests</p>
        )}
      </div>
    </div>
  );
}
