"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddUserForm } from "@/components/AddUserForm";

export default function DashboardAddUserPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/referrals" className="text-secondary hover:underline text-sm">← Back</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add User to Your Network</h1>
      </div>
      <AddUserForm
        submitApi="/api/individual/users"
        submitLabel="Add User"
        backHref="/dashboard/referrals"
        title="Add User"
        placementUsersApi="/api/individual/placement-users"
        onSuccess={() => {
          router.push("/dashboard/tree");
          router.refresh();
        }}
      />
    </div>
  );
}
