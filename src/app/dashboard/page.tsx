import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Wallet, TreePine, Users, CreditCard } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { wallet: true, package: true },
  });

  if (!user) return null;

  const wallet = user.wallet || { balance: 0, binaryIncome: 0, referralIncome: 0, totalEarnings: 0 };
  const referralCount = await prisma.user.count({
    where: { sponsorId: session.userId },
  });

  const cards = [
    { title: "Wallet Balance", value: `₹${wallet.balance.toFixed(2)}`, icon: Wallet, href: "/dashboard/wallet", gradient: "from-primary to-primary/80" },
    { title: "Binary Income", value: `₹${wallet.binaryIncome.toFixed(2)}`, icon: TreePine, href: "/dashboard/tree", gradient: "from-secondary to-secondary/80" },
    { title: "Referral Income", value: `₹${wallet.referralIncome.toFixed(2)}`, icon: Users, href: "/dashboard/referrals", gradient: "from-accent/90 to-accent/70" },
    { title: "Direct Referrals", value: referralCount.toString(), icon: Users, href: "/dashboard/referrals", gradient: "from-success/80 to-success/60" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-2">
        Welcome, {user.firstName}!
      </h1>
      <p className="text-text-secondary mb-8">{user.package?.name || "No package"} • {user.username}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.title} href={c.href}>
              <div className={`card bg-gradient-to-br ${c.gradient} text-white hover:shadow-lg transition-shadow cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{c.title}</p>
                    <p className="text-xl font-heading font-bold mt-1">{c.value}</p>
                  </div>
                  <Icon className="w-10 h-10 text-white/80" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-heading font-semibold text-primary mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/withdraw" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
              <CreditCard className="w-5 h-5 text-secondary" />
              <span>Request Withdrawal</span>
            </Link>
            <Link href="/dashboard/tree" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
              <TreePine className="w-5 h-5 text-secondary" />
              <span>View Binary Tree</span>
            </Link>
          </div>
        </div>
        <div className="card">
          <h3 className="font-heading font-semibold text-primary mb-4">Total Earnings</h3>
          <p className="text-3xl font-heading font-bold text-secondary">₹{wallet.totalEarnings.toFixed(2)}</p>
          <p className="text-text-secondary text-sm mt-1">Lifetime earnings</p>
        </div>
      </div>
    </div>
  );
}
