import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return notFound();
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { package: true, wallet: true, sponsor: { select: { username: true } } },
  });

  if (!user || user.sponsorId !== session.userId) {
    return notFound();
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: id },
    orderBy: { requestedAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/users" className="text-secondary hover:underline text-sm">← Back to My Users</Link>
          <h1 className="text-2xl font-heading font-bold text-primary mt-2">User Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/users/${id}/edit`} className="btn-primary">Edit</Link>
          <DeleteButton
            id={id}
            apiEndpoint="/api/individual/users"
            confirmMessage={`Delete user "${user.username}"? This action cannot be undone.`}
            redirectTo="/dashboard/users"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-heading font-semibold text-primary mb-4">Profile</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-secondary">Name</dt>
              <dd className="font-medium">{user.firstName} {user.lastName}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Username</dt>
              <dd className="font-medium">{user.username}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Phone</dt>
              <dd className="font-medium">{user.phone || "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Address</dt>
              <dd className="font-medium">{user.address || "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Package</dt>
              <dd className="font-medium">{user.package?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Investment Amount</dt>
              <dd className="font-medium">{user.investmentAmount != null ? `₹${user.investmentAmount}` : "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Status</dt>
              <dd>
                <span className={`px-2 py-1 rounded text-xs ${user.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h3 className="font-heading font-semibold text-primary mb-4">Wallet</h3>
          {user.wallet ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-secondary">Balance</dt>
                <dd className="font-medium">₹{user.wallet.balance.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Binary Income</dt>
                <dd className="font-medium">₹{user.wallet.binaryIncome.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Referral Income</dt>
                <dd className="font-medium">₹{user.wallet.referralIncome.toFixed(2)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-text-secondary">No wallet</p>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-heading font-semibold text-primary mb-4">Recent Withdrawals</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-text-secondary text-sm">
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-gray-100">
                <td className="py-3">₹{w.amount}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    w.status === "APPROVED" ? "bg-success/10 text-success" :
                    w.status === "REJECTED" ? "bg-error/10 text-error" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="py-3 text-sm">{new Date(w.requestedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 && <p className="text-center py-6 text-text-secondary">No withdrawals</p>}
      </div>
    </div>
  );
}
