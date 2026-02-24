"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Pkg {
  id: string;
  name: string;
  amount: number;
}

interface EditUserFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    dateOfBirth: string | null;
    packageId: string | null;
    investmentAmount: number | null;
    bankName: string;
    accountNo: string;
    ifsc: string;
    ePin: string | null;
    isActive: boolean;
  };
  packages: Pkg[];
}

export function EditUserForm({ user, packages }: EditUserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    dateOfBirth: user.dateOfBirth || "",
    packageId: user.packageId || "",
    investmentAmount: user.investmentAmount?.toString() || "",
    bankName: user.bankName,
    accountNo: user.accountNo,
    ifsc: user.ifsc,
    ePin: user.ePin || "",
    isActive: user.isActive,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/individual/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          investmentAmount: form.investmentAmount ? parseFloat(form.investmentAmount) : null,
          bankDetails: { bankName: form.bankName, accountNo: form.accountNo, ifsc: form.ifsc },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      router.push("/dashboard/users");
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
        <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Package</label>
          <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} className="input">
            <option value="">Select</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (₹{p.amount})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Investment Amount (₹)</label>
          <input type="number" value={form.investmentAmount} onChange={(e) => setForm({ ...form, investmentAmount: e.target.value })} className="input" min="0" step="0.01" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Account No</label>
            <input type="text" value={form.accountNo} onChange={(e) => setForm({ ...form, accountNo: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">IFSC</label>
            <input type="text" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">E-Pin</label>
          <input type="text" value={form.ePin} onChange={(e) => setForm({ ...form, ePin: e.target.value })} className="input" />
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
