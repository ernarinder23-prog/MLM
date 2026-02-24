import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FranchiseReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "FRANCHISE") return null;

  const userCount = await prisma.user.count({
    where: { franchiseId: session.userId },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Performance Reports
      </h1>
      <div className="card">
        <h3 className="font-heading font-semibold text-primary mb-4">Summary</h3>
        <p>Total members under your franchise: <strong>{userCount}</strong></p>
      </div>
    </div>
  );
}
