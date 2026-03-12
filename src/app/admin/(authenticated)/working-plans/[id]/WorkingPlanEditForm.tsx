"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WorkingPlan {
  id: string;
  name: string;
  roi: number;
}

export function WorkingPlanEditForm({ plan }: { plan: WorkingPlan }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: plan.name,
    roi: plan.roi.toString(),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(/api/admin/working-plans/, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          roi: parseFloat(form.roi),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.push("/admin/working-plans");
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
          <label className="block text-sm font-medium mb-2">ROI - Rate of Interest (%)</label>
          <input type="number" value={form.roi} onChange={(e) => setForm({ ...form, roi: e.target.value })} className="input" required min="0" step="0.01" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}
