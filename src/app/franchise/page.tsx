import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Users, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function FranchiseDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "FRANCHISE") return null;

  const franchiseId = session.userId;
  const [userCount, pendingKyc] = await Promise.all([
    prisma.user.count({
      where: { franchiseId, role: "INDIVIDUAL" },
    }),
    prisma.kyc.count({
      where: { user: { franchiseId }, status: "PENDING" },
    }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: { franchiseId, role: "INDIVIDUAL" },
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

  const cards = [
    { title: "My Members", value: userCount, icon: Users, href: "/franchise/users", color: "from-primary to-primary/80" },
    { title: "Pending KYC", value: pendingKyc, icon: FileText, href: "/franchise/kyc", color: "from-warning to-warning/80" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Franchise Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.title} href={c.href}>
              <div className={`card bg-gradient-to-br ${c.color} text-white hover:shadow-lg transition-shadow cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{c.title}</p>
                    <p className="text-2xl font-heading font-bold mt-1">{c.value}</p>
                  </div>
                  <Icon className="w-10 h-10 text-white/80" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="card">
        <h3 className="font-heading font-semibold text-primary mb-4">Recent Members</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-text-secondary text-sm">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-3">{u.firstName} {u.lastName} ({u.username})</td>
                <td className="py-3 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentUsers.length === 0 && <p className="py-8 text-center text-text-secondary">No members yet</p>}
      </div>
    </div>
  );
}
