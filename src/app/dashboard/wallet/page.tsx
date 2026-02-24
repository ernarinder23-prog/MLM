import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function WalletPage() {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") return null;

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      include: { wallet: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const wallet = user?.wallet || { balance: 0, binaryIncome: 0, referralIncome: 0, totalEarnings: 0 };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Wallet & Income
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary to-primary/80 text-white">
          <p className="text-white/80 text-sm">Available Balance</p>
          <p className="text-2xl font-heading font-bold mt-1">₹{wallet.balance.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-secondary to-secondary/80 text-white">
          <p className="text-white/80 text-sm">Binary Income</p>
          <p className="text-2xl font-heading font-bold mt-1">₹{wallet.binaryIncome.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-accent/90 to-accent/70 text-primary">
          <p className="text-primary/80 text-sm">Referral Income</p>
          <p className="text-2xl font-heading font-bold mt-1">₹{wallet.referralIncome.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold text-primary">Transaction History</h3>
        <Link href="/dashboard/withdraw" className="btn-primary">Withdraw</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium">Type</th>
              <th className="text-left py-4 px-4 font-medium">Amount</th>
              <th className="text-left py-4 px-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-100">
                <td className="py-4 px-4">{t.type.replace(/_/g, " ")}</td>
                <td className="py-4 px-4 font-medium">{t.amount >= 0 ? "+" : ""}₹{t.amount.toFixed(2)}</td>
                <td className="py-4 px-4 text-text-secondary">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
