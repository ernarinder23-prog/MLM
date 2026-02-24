import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function FranchiseUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "FRANCHISE") return null;

  const users = await prisma.user.findMany({
    where: { franchiseId: session.userId, role: "INDIVIDUAL" },
    include: { package: true },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">My Users</h1>
        <Link href="/franchise/add-user" className="btn-primary">Add Member</Link>
      </div>
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
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-4 px-4">{u.firstName} {u.lastName} ({u.username})</td>
                <td className="py-4 px-4">{u.package?.name || "-"}</td>
                <td className="py-4 px-4 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="py-12 text-center text-text-secondary">No users</p>}
      </div>
    </div>
  );
}
