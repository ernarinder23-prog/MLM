"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
}

export interface AddUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  placementId: string;
  placementSide: "LEFT" | "RIGHT";
  investmentAmount: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  ePin: string;
  planType: "FIXED" | "FLEXI" | "";
  planDuration: "2_YEARS" | "YEARLY" | "HALF_YEARLY" | "QUARTERLY" | "";
}

interface AddUserFormProps {
  submitApi: string;
  submitLabel?: string;
  backHref: string;
  backLabel?: string;
  title?: string;
  placementUsersApi?: string;
  onSuccess?: () => void;
  showEPin?: boolean;
}

const defaultForm: AddUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  dateOfBirth: "",
  placementId: "",
  placementSide: "LEFT",
  investmentAmount: "",
  bankName: "",
  accountNo: "",
  ifsc: "",
  ePin: "",
  planType: "",
  planDuration: "",
};

export function AddUserForm({
  submitApi,
  submitLabel = "Add Individual",
  backHref,
  backLabel = "Back",
  title = "Add Individual",
  placementUsersApi = "/api/franchise/placement-users",
  onSuccess,
  showEPin = true,
}: AddUserFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<AddUserFormValues>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(placementUsersApi)
      .then((r) => r.json())
      .then((userRes) => {
        if (userRes.users) setUsers(userRes.users);
      });
  }, [placementUsersApi]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.planType || !form.planDuration) {
        setError("Plan type and duration are required");
        return;
      }
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        placementId: form.placementId || undefined,
        placementSide: form.placementSide,
        investmentAmount: form.investmentAmount || undefined,
        bankDetails: form.bankName || form.accountNo || form.ifsc ? { bankName: form.bankName, accountNo: form.accountNo, ifsc: form.ifsc } : undefined,
        ePin: showEPin ? (form.ePin || undefined) : undefined,
        planType: form.planType,
        planDuration: form.planDuration,
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
          <label className="block text-sm font-medium mb-2">User ID</label>
          <input type="text" value="Auto-generated" className="input" disabled />
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
          <label className="block text-sm font-medium mb-2">Placement (Sponsor User ID)</label>
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
          <label className="block text-sm font-medium mb-2">Plan Type</label>
          <select
            value={form.planType}
            onChange={(e) => setForm({ ...form, planType: e.target.value as AddUserFormValues["planType"], planDuration: "" })}
            className="input"
            required
          >
            <option value="">Select</option>
            <option value="FIXED">Fixed</option>
            <option value="FLEXI">Flexi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Plan Duration</label>
          <select
            value={form.planDuration}
            onChange={(e) => setForm({ ...form, planDuration: e.target.value as AddUserFormValues["planDuration"] })}
            className="input"
            required
            disabled={!form.planType}
          >
            <option value="">Select</option>
            {form.planType === "FIXED" && (
              <option value="2_YEARS">2 Years</option>
            )}
            {form.planType === "FLEXI" && (
              <>
                <option value="YEARLY">Yearly</option>
                <option value="HALF_YEARLY">Half-Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Investment Amount (Rs)</label>
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
        {showEPin && (
          <div>
            <label className="block text-sm font-medium mb-2">E-Pin</label>
            <input type="text" value={form.ePin} onChange={(e) => setForm({ ...form, ePin: e.target.value })} className="input" placeholder="E-Pin" />
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : submitLabel}</button>
      </form>
    </div>
  );
}
