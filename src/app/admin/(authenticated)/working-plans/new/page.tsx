"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewWorkingPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    roi: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/working-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          roi: parseFloat(form.roi),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create working plan");
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/working-plans" className="text-secondary hover:underline text-sm">Back to Working Plans</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Create Working Plan</h1>
      </div>
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
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create Working Plan"}</button>
        </form>
      </div>
    </div>
  );
}
