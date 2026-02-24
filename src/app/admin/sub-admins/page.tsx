import { prisma } from "@/lib/db";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SubAdminsPage() {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") redirect("/admin");

  const subAdmins = await prisma.user.findMany({
    where: { role: "SUB_ADMIN" },
    include: { subAdminPermissions: true },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          Sub Admin Management
        </h1>
        <Link href="/admin/sub-admins/new" className="btn-primary">
          Add Sub Admin
        </Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium">User</th>
              <th className="text-left py-4 px-4 font-medium">Email</th>
              <th className="text-left py-4 px-4 font-medium">Permissions</th>
              <th className="text-left py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAdmins.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-4 px-4">{u.username}</td>
                <td className="py-4 px-4">{u.email}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {u.subAdminPermissions && (
                      <>
                        {u.subAdminPermissions.viewUsers && (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">Users</span>
                        )}
                        {u.subAdminPermissions.viewReports && (
                          <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-xs">Reports</span>
                        )}
                        {u.subAdminPermissions.approveWithdrawals && (
                          <span className="px-2 py-0.5 rounded bg-accent/20 text-primary text-xs">Withdrawals</span>
                        )}
                        {u.subAdminPermissions.manageKyc && (
                          <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">KYC</span>
                        )}
                        {u.subAdminPermissions.managePlans && (
                          <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-xs">Plans</span>
                        )}
                        {u.subAdminPermissions.readBinaryTree && (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">Tree</span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Link href={`/admin/sub-admins/${u.id}`} className="text-secondary hover:underline text-sm">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subAdmins.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No sub admins</p>
        )}
      </div>
    </div>
  );
}
