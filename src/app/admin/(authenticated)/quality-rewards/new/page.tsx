"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewQualityRewardPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: "",
    returnRate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quality-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.amount.trim(),
          returnRate: parseFloat(form.returnRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create reward");
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/quality-rewards" className="text-secondary hover:underline text-sm">Back to Quality Rewards</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Create Quality Reward</h1>
      </div>
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
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create Reward"}</button>
        </form>
      </div>
    </div>
  );
}
