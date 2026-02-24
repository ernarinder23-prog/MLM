import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditUserForm } from "./EditUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") {
    return notFound();
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { package: true },
  });

  if (!user || user.sponsorId !== session.userId) {
    return notFound();
  }

  const packages = await prisma.package.findMany({ where: { isActive: true } });
  let bankDetails: { bankName?: string; accountNo?: string; ifsc?: string } = {};
  if (user.bankDetails) {
    try {
      bankDetails = JSON.parse(user.bankDetails);
    } catch {}
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/users" className="text-secondary hover:underline text-sm">← Back to My Users</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit User</h1>
      </div>
      <EditUserForm
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
          packageId: user.packageId,
          investmentAmount: user.investmentAmount,
          bankName: bankDetails.bankName || "",
          accountNo: bankDetails.accountNo || "",
          ifsc: bankDetails.ifsc || "",
          ePin: user.ePin || "",
          isActive: user.isActive,
        }}
        packages={packages}
      />
    </div>
  );
}
