import { prisma } from "@/lib/db";
import { BarChart3, Users, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";

export default async function AdminDashboardPage() {
  const [userCount, franchiseCount, pendingWithdrawals, totalPackages] =
    await Promise.all([
      prisma.user.count({ where: { role: "INDIVIDUAL", isActive: true } }),
      prisma.franchise.count({ where: { isActive: true } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.package.count({ where: { isActive: true } }),
    ]);

  const recentUsers = await prisma.user.findMany({
    where: { role: "INDIVIDUAL" },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  const sampleChartData = [
    { name: "Mon", signups: 12 },
    { name: "Tue", signups: 19 },
    { name: "Wed", signups: 15 },
    { name: "Thu", signups: 22 },
    { name: "Fri", signups: 18 },
    { name: "Sat", signups: 25 },
    { name: "Sun", signups: 20 },
  ];

  const pieData = [
    { name: "Individual", value: userCount, color: "#1DB954" },
    { name: "Franchises", value: franchiseCount, color: "#0F2A44" },
  ];

  const cards = [
    {
      title: "Total Members",
      value: userCount,
      icon: Users,
      href: "/admin/users",
      gradient: "from-primary to-primary/80",
      color: "text-primary",
    },
    {
      title: "Active Franchises",
      value: franchiseCount,
      icon: BarChart3,
      href: "/admin/franchises",
      gradient: "from-secondary to-secondary/80",
      color: "text-secondary",
    },
    {
      title: "Pending Withdrawals",
      value: pendingWithdrawals,
      icon: CreditCard,
      href: "/admin/withdrawals",
      gradient: "from-warning to-warning/80",
      color: "text-warning",
    },
    {
      title: "MLM Plans",
      value: totalPackages,
      icon: Wallet,
      href: "/admin/plans",
      gradient: "from-accent/90 to-accent/70",
      color: "text-primary",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <div
                className={`card bg-gradient-to-br ${card.gradient} text-white hover:shadow-lg transition-shadow cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{card.title}</p>
                    <p className="text-2xl font-heading font-bold mt-1">
                      {card.value}
                    </p>
                  </div>
                  <Icon className="w-10 h-10 text-white/80" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <DashboardCharts chartData={sampleChartData} pieData={pieData} />

      <div className="card">
        <h3 className="font-heading font-semibold text-primary mb-4">
          Recent Members
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-text-secondary text-sm">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3">{u.username}</td>
                  <td className="py-3 text-text-secondary">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-secondary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentUsers.length === 0 && (
            <p className="py-8 text-center text-text-secondary">
              No members yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
