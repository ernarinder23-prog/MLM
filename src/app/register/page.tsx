"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RegisterForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    placementId: ref,
    placementSide: "LEFT" as "LEFT" | "RIGHT",
    packageId: "",
  });
  const [packages, setPackages] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [sponsors, setSponsors] = useState<{ id: string; username: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/packages").then((r) => r.json()),
      fetch("/api/register/sponsors").then((r) => r.json()),
    ]).then(([pkgRes, sponsorRes]) => {
      if (pkgRes.packages) setPackages(pkgRes.packages);
      if (sponsorRes.sponsors) setSponsors(sponsorRes.sponsors);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          confirmPassword: undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md card text-center">
          <div className="text-4xl text-success mb-4">✓</div>
          <h2 className="text-xl font-heading font-semibold text-primary mb-2">Registration Complete</h2>
          <p className="text-text-secondary mb-6">You can now sign in with your credentials.</p>
          <Link href="/login" className="btn-primary inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary">Individual Registration</h1>
          <p className="text-text-secondary mt-2">Create your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sponsor (Placement ID)</label>
              <select value={form.placementId} onChange={(e) => setForm({ ...form, placementId: e.target.value })} className="input">
                <option value="">Select sponsor</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Binary Placement</label>
              <select value={form.placementSide} onChange={(e) => setForm({ ...form, placementSide: e.target.value as "LEFT" | "RIGHT" })} className="input">
                <option value="LEFT">Left Leg</option>
                <option value="RIGHT">Right Leg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Package</label>
              <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} className="input">
                <option value="">Select package</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.amount})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">{loading ? "Registering..." : "Register"}</button>
          </form>
        </div>
        <p className="text-center mt-6">
          <Link href="/login" className="text-secondary hover:underline">Already have an account? Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
