"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "FIXED" as "FIXED" | "FLEXI",
    amount: "",
    level: "1",
    businessVolume: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) || 0,
          level: parseInt(form.level) || 1,
          businessVolume: parseFloat(form.businessVolume) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create plan");
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/plans" className="text-secondary hover:underline text-sm">← Back to Plans</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Create MLM Plan</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Plan Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Plan Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "FIXED" | "FLEXI" })} className="input">
              <option value="FIXED">Fixed</option>
              <option value="FLEXI">Flexi</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" required min="0" step="0.01" />
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
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create Plan"}</button>
        </form>
      </div>
    </div>
  );
}
