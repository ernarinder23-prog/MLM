import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { package: true, franchise: true, wallet: true, sponsor: { select: { username: true } } },
  });
  if (!user) notFound();

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: id },
    orderBy: { requestedAt: "desc" },
    take: 10,
  });

  const isIndividual = user.role === "INDIVIDUAL";

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/individuals" className="text-secondary hover:underline text-sm">← Back to Individuals</Link>
          <h1 className="text-2xl font-heading font-bold text-primary mt-2">Individual Details</h1>
        </div>
        <div className="flex items-center gap-3">
          {isIndividual && (
            <>
              <Link href={`/admin/individuals/${id}/edit`} className="btn-primary">Edit</Link>
              <DeleteButton
                id={id}
                apiEndpoint="/api/admin/individuals"
                confirmMessage={`Delete individual "${user.username}"? This action cannot be undone.`}
                redirectTo="/admin/individuals"
              />
            </>
          )}
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
              <dt className="text-text-secondary">Package</dt>
              <dd className="font-medium">{user.package?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Franchise</dt>
              <dd className="font-medium">{user.franchise?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Sponsor</dt>
              <dd className="font-medium">{user.sponsor?.username || "-"}</dd>
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
                    w.status === "PENDING" ? "bg-warning/10 text-warning" :
                    w.status === "APPROVED" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  }`}>{w.status}</span>
                </td>
                <td className="py-3 text-text-secondary">{new Date(w.requestedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 && <p className="py-6 text-center text-text-secondary">No withdrawals</p>}
      </div>
    </div>
  );
}
