"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    investmentAmount: number | null;
    bankName: string;
    accountNo: string;
    ifsc: string;
    ePin: string | null;
    planType: "FIXED" | "FLEXI" | null;
    planDuration: "2_YEARS" | "YEARLY" | "HALF_YEARLY" | "QUARTERLY" | null;
    isActive: boolean;
  };
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    dateOfBirth: user.dateOfBirth || "",
    investmentAmount: user.investmentAmount?.toString() || "",
    bankName: user.bankName,
    accountNo: user.accountNo,
    ifsc: user.ifsc,
    isActive: user.isActive,
    planType: user.planType || "",
    planDuration: user.planDuration || "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.planType || !form.planDuration) {
        setError("Plan type and duration are required");
        return;
      }
      if (form.password || form.confirmPassword) {
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Password and confirm password do not match");
          return;
        }
      }

      const res = await fetch(`/api/individual/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          dateOfBirth: form.dateOfBirth,
          investmentAmount: form.investmentAmount ? parseFloat(form.investmentAmount) : null,
          bankDetails: { bankName: form.bankName, accountNo: form.accountNo, ifsc: form.ifsc },
          isActive: form.isActive,
          planType: form.planType,
          planDuration: form.planDuration,
          password: form.password || undefined,
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
          <label className="block text-sm font-medium mb-2">User ID</label>
          <input type="text" value={user.username} className="input" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" minLength={6} placeholder="Leave blank to keep current password" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input" minLength={6} placeholder="Re-enter password" />
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
          <label className="block text-sm font-medium mb-2">Plan Type</label>
          <select
            value={form.planType}
            onChange={(e) => setForm({ ...form, planType: e.target.value as "FIXED" | "FLEXI" | "", planDuration: "" })}
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
            onChange={(e) => setForm({ ...form, planDuration: e.target.value as typeof form.planDuration })}
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
          <span>Active</span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}
