import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function KycPage() {
  const kycList = await prisma.kyc.findMany({
    include: {
      user: { select: { id: true, username: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        KYC Management
      </h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-medium">User</th>
              <th className="text-left py-4 px-4 font-medium">Document</th>
              <th className="text-left py-4 px-4 font-medium">Status</th>
              <th className="text-left py-4 px-4 font-medium">Date</th>
              <th className="text-left py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycList.map((k) => (
              <tr key={k.id} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  {k.user.firstName} {k.user.lastName} ({k.user.username})
                </td>
                <td className="py-4 px-4">{k.documentType}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      k.status === "APPROVED"
                        ? "bg-success/10 text-success"
                        : k.status === "REJECTED"
                        ? "bg-error/10 text-error"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {k.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-text-secondary">
                  {new Date(k.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <Link href={`/admin/kyc/${k.id}`} className="text-secondary hover:underline text-sm">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {kycList.length === 0 && (
          <p className="py-12 text-center text-text-secondary">No KYC submissions</p>
        )}
      </div>
    </div>
  );
}
