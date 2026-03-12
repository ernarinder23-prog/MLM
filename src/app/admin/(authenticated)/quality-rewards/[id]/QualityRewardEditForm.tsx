"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QualityReward {
  id: string;
  amount: string;
  returnRate: number;
}

export function QualityRewardEditForm({ reward }: { reward: QualityReward }) {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: reward.amount,
    returnRate: reward.returnRate.toString(),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quality-rewards/${reward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.amount.trim(),
          returnRate: parseFloat(form.returnRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.push("/admin/quality-rewards");
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input type="text" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Return (%)</label>
          <input type="number" value={form.returnRate} onChange={(e) => setForm({ ...form, returnRate: e.target.value })} className="input" required min="0" step="0.01" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}
