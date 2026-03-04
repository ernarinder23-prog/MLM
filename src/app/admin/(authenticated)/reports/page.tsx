import { prisma } from "@/lib/db";
import { ReportsChart } from "@/components/ReportsChart";

export default async function ReportsPage() {
  const [users, withdrawals, transactions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "INDIVIDUAL" },
      select: { createdAt: true },
    }),
    prisma.withdrawal.findMany({
      where: { status: "APPROVED" },
      select: { amount: true, processedAt: true },
    }),
    prisma.transaction.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true } } },
    }),
  ]);

  const signupsByDay = users.reduce((acc: Record<string, number>, u) => {
    const d = new Date(u.createdAt).toISOString().split("T")[0];
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(signupsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([name, signups]) => ({ name, signups }));

  const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Reports & Ledger
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary to-primary/80 text-white">
          <p className="text-white/80 text-sm">Total Signups</p>
          <p className="text-2xl font-heading font-bold mt-1">{users.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-secondary to-secondary/80 text-white">
          <p className="text-white/80 text-sm">Total Withdrawn</p>
          <p className="text-2xl font-heading font-bold mt-1">₹{totalWithdrawn.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-accent/90 to-accent/70 text-primary">
          <p className="text-primary/80 text-sm">Transactions</p>
          <p className="text-2xl font-heading font-bold mt-1">{transactions.length}</p>
        </div>
      </div>

      <ReportsChart chartData={chartData} />

      <div className="card">
        <h3 className="font-heading font-semibold text-primary mb-4">Transaction Ledger</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-text-secondary text-sm sticky top-0 bg-white">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-100">
                  <td className="py-3">{t.user.username}</td>
                  <td className="py-3">{t.type}</td>
                  <td className="py-3 font-medium">{t.amount}</td>
                  <td className="py-3 text-text-secondary">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <p className="py-8 text-center text-text-secondary">No transactions</p>
          )}
        </div>
      </div>
    </div>
  );
}
