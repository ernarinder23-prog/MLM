"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddUserForm } from "@/components/AddUserForm";

export default function AdminAddIndividualPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/individuals" className="text-secondary hover:underline text-sm">← Back to Individuals</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add Individual</h1>
      </div>
      <AddUserForm
        submitApi="/api/admin/individuals"
        submitLabel="Add Individual"
        backHref="/admin/individuals"
        title="Add Individual"
        placementUsersApi="/api/admin/users/list"
        onSuccess={() => {
          router.push("/admin/binary-tree");
          router.refresh();
        }}
      />
    </div>
  );
}
