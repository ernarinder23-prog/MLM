import { prisma } from "@/lib/db";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";

export default async function AdminIndividualsPage() {
  const users = await prisma.user.findMany({
    where: { role: "INDIVIDUAL" },
    include: { package: true, franchise: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">Individuals</h1>
        <Link href="/admin/individuals/add" className="btn-primary">Add Individual</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium">User</th>
              <th className="text-left py-4 px-4 font-medium">Username</th>
              <th className="text-left py-4 px-4 font-medium">Package</th>
              <th className="text-left py-4 px-4 font-medium">Investment</th>
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
                <td className="py-4 px-4">{u.investmentAmount != null ? `₹${u.investmentAmount}` : "-"}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/users/${u.id}`} className="text-secondary hover:underline text-sm">View</Link>
                    <Link href={`/admin/individuals/${u.id}/edit`} className="text-primary hover:underline text-sm">Edit</Link>
                    <DeleteButton
                      id={u.id}
                      apiEndpoint="/api/admin/individuals"
                      confirmMessage={`Delete individual "${u.username}"? This action cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="py-12 text-center text-text-secondary">No individuals yet</p>}
      </div>
    </div>
  );
}
