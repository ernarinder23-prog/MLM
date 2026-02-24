import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "INDIVIDUAL" },
    include: { package: true, franchise: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        User Network
      </h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-4 px-4 font-medium">User</th>
                <th className="text-left py-4 px-4 font-medium">Username</th>
                <th className="text-left py-4 px-4 font-medium">Package</th>
                <th className="text-left py-4 px-4 font-medium">Franchise</th>
                <th className="text-left py-4 px-4 font-medium">Status</th>
                <th className="text-left py-4 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 px-4">{u.firstName} {u.lastName}</td>
                  <td className="py-4 px-4">{u.username}</td>
                  <td className="py-4 px-4">{u.package?.name || "-"}</td>
                  <td className="py-4 px-4">{u.franchise?.name || "-"}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/admin/users/${u.id}`} className="text-secondary hover:underline text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No users yet</p>
        )}
      </div>
    </div>
  );
}
