"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  type: string;
  amount: number;
  level: number;
  businessVolume: number;
  isActive: boolean;
}

export function PlanEditForm({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: plan.name,
    type: plan.type,
    amount: plan.amount.toString(),
    level: plan.level.toString(),
    businessVolume: plan.businessVolume.toString(),
    isActive: plan.isActive,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          amount: parseFloat(form.amount) || 0,
          level: parseInt(form.level) || 1,
          businessVolume: parseFloat(form.businessVolume) || 0,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.push("/admin/plans");
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
          <label className="block text-sm font-medium mb-2">Plan Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
            <option value="FIXED">Fixed</option>
            <option value="FLEXI">Flexi</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <input type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input" min="1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Business Volume</label>
          <input type="number" value={form.businessVolume} onChange={(e) => setForm({ ...form, businessVolume: e.target.value })} className="input" min="0" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
          <span>Active</span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}
