import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QualityRewardEditForm } from "./QualityRewardEditForm";

export default async function QualityRewardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reward = await prisma.qualityReward.findUnique({ where: { id } });
  if (!reward) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/quality-rewards" className="text-secondary hover:underline text-sm">Back to Quality Rewards</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Quality Reward</h1>
      </div>
      <QualityRewardEditForm reward={reward} />
    </div>
  );
}
