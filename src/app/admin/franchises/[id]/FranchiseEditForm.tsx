"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Franchise {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

export function FranchiseEditForm({ franchise }: { franchise: Franchise }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: franchise.name,
    username: franchise.username,
    email: franchise.email,
    phone: franchise.phone || "",
    address: franchise.address || "",
    isActive: franchise.isActive,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/franchises/${franchise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.push("/admin/franchises");
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
          <label className="block text-sm font-medium mb-2">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
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
