"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("APPROVED")}
        disabled={!!loading}
        className="px-3 py-1 rounded bg-success/10 text-success text-sm hover:bg-success/20 disabled:opacity-50"
      >
        {loading === "APPROVED" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("REJECTED")}
        disabled={!!loading}
        className="px-3 py-1 rounded bg-error/10 text-error text-sm hover:bg-error/20 disabled:opacity-50"
      >
        {loading === "REJECTED" ? "..." : "Reject"}
      </button>
    </div>
  );
}
