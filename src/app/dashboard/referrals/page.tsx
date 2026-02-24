import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") return null;

  const referrals = await prisma.user.findMany({
    where: { sponsorId: session.userId },
    include: { package: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        My Referrals
      </h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium">User</th>
              <th className="text-left py-4 px-4 font-medium">Package</th>
              <th className="text-left py-4 px-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-4 px-4">{u.firstName} {u.lastName} ({u.username})</td>
                <td className="py-4 px-4">{u.package?.name || "-"}</td>
                <td className="py-4 px-4 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {referrals.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No referrals yet</p>
        )}
      </div>
    </div>
  );
}
