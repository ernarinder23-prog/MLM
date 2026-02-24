"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddUserForm } from "@/components/AddUserForm";

export default function FranchiseAddUserPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/franchise/users" className="text-secondary hover:underline text-sm">← Back</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add Individual</h1>
      </div>
      <AddUserForm
        submitApi="/api/franchise/users"
        submitLabel="Add Individual"
        backHref="/franchise/users"
        placementUsersApi="/api/franchise/placement-users"
        onSuccess={() => {
          router.push("/franchise/users");
          router.refresh();
        }}
      />
    </div>
  );
}
