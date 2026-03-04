"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSubAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    viewUsers: false,
    viewReports: false,
    approveWithdrawals: false,
    manageKyc: false,
    managePlans: false,
    readBinaryTree: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sub-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create sub admin");
        return;
      }
      router.push("/admin/sub-admins");
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
        <Link href="/admin/sub-admins" className="text-secondary hover:underline text-sm">← Back</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add Sub Admin</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" required />
            </div>
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
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required minLength={6} />
          </div>
          <div>
            <h3 className="font-medium text-primary mb-3">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["viewUsers", "viewReports", "approveWithdrawals", "manageKyc", "managePlans", "readBinaryTree"].map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create Sub Admin"}</button>
        </form>
      </div>
    </div>
  );
}
