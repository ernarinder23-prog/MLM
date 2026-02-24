"use client";

import { useState, useEffect } from "react";

interface Package {
  id: string;
  name: string;
  type: string;
  amount: number;
}
interface User {
  id: string;
  username: string;
}

export interface AddUserFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  placementId: string;
  placementSide: "LEFT" | "RIGHT";
  packageId: string;
  investmentAmount: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  ePin: string;
}

interface AddUserFormProps {
  submitApi: string;
  submitLabel?: string;
  backHref: string;
  backLabel?: string;
  title?: string;
  placementUsersApi?: string;
  onSuccess?: () => void;
}

const defaultForm: AddUserFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  dateOfBirth: "",
  placementId: "",
  placementSide: "LEFT",
  packageId: "",
  investmentAmount: "",
  bankName: "",
  accountNo: "",
  ifsc: "",
  ePin: "",
};

export function AddUserForm({
  submitApi,
  submitLabel = "Add Individual",
  backHref,
  backLabel = "Back",
  title = "Add Individual",
  placementUsersApi = "/api/franchise/placement-users",
  onSuccess,
}: AddUserFormProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<AddUserFormValues>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/packages").then((r) => r.json()),
      fetch(placementUsersApi).then((r) => r.json()),
    ]).then(([pkgRes, userRes]) => {
      if (pkgRes.packages) setPackages(pkgRes.packages);
      if (userRes.users) setUsers(userRes.users);
    });
  }, [placementUsersApi]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        placementId: form.placementId || undefined,
        placementSide: form.placementSide,
        packageId: form.packageId || undefined,
        investmentAmount: form.investmentAmount || undefined,
        bankDetails: form.bankName || form.accountNo || form.ifsc ? { bankName: form.bankName, accountNo: form.accountNo, ifsc: form.ifsc } : undefined,
        ePin: form.ePin || undefined,
      };
      const res = await fetch(submitApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add user");
        return;
      }
      setForm(defaultForm);
      onSuccess?.();
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
          <label className="block text-sm font-medium mb-2">Placement (Sponsor)</label>
          <select value={form.placementId} onChange={(e) => setForm({ ...form, placementId: e.target.value })} className="input">
            <option value="">Select</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Binary Placement</label>
          <select value={form.placementSide} onChange={(e) => setForm({ ...form, placementSide: e.target.value as "LEFT" | "RIGHT" })} className="input">
            <option value="LEFT">Left Leg</option>
            <option value="RIGHT">Right Leg</option>
          </select>
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
          <input type="number" value={form.investmentAmount} onChange={(e) => setForm({ ...form, investmentAmount: e.target.value })} className="input" min="0" step="0.01" placeholder="0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <input type="text" value={form.ePin} onChange={(e) => setForm({ ...form, ePin: e.target.value })} className="input" placeholder="E-Pin" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : submitLabel}</button>
      </form>
    </div>
  );
}
