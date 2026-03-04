import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditIndividualForm } from "./EditIndividualForm";

export default async function EditIndividualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id, role: "INDIVIDUAL" },
    include: { package: true },
  });
  if (!user) notFound();

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
        <Link href="/admin/individuals" className="text-secondary hover:underline text-sm">← Back to Individuals</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Individual</h1>
      </div>
      <EditIndividualForm
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
