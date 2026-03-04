import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default async function FranchisesPage() {
  const franchises = await prisma.franchise.findMany({
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          Franchise Management
        </h1>
        <Link href="/admin/franchises/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Franchise
        </Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium text-text-primary">Name</th>
              <th className="text-left py-4 px-4 font-medium text-text-primary">Username</th>
              <th className="text-left py-4 px-4 font-medium text-text-primary">Email</th>
              <th className="text-left py-4 px-4 font-medium text-text-primary">Members</th>
              <th className="text-left py-4 px-4 font-medium text-text-primary">Status</th>
              <th className="text-left py-4 px-4 font-medium text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {franchises.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-4 px-4">{f.name}</td>
                <td className="py-4 px-4">{f.username}</td>
                <td className="py-4 px-4">{f.email}</td>
                <td className="py-4 px-4">{f._count.users}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}
                  >
                    {f.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/franchises/${f.id}`}
                      className="text-secondary hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      id={f.id}
                      apiEndpoint="/api/admin/franchises"
                      confirmMessage={`Delete franchise "${f.name}"? This action cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {franchises.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No franchises yet</p>
        )}
      </div>
    </div>
  );
}
