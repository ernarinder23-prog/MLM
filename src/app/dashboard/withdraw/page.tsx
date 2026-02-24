"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          bankDetails: { bankName, accountNo, ifsc },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-8 max-w-md">
        <div className="card text-center">
          <div className="text-4xl text-success mb-4">✓</div>
          <h2 className="text-xl font-heading font-semibold text-primary mb-2">Request Submitted</h2>
          <p className="text-text-secondary mb-6">Your withdrawal request is pending approval.</p>
          <Link href="/dashboard/wallet" className="btn-primary inline-block">Back to Wallet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md">
      <div className="mb-8">
        <Link href="/dashboard/wallet" className="text-secondary hover:underline text-sm">← Back</Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Withdrawal Request</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.00"
              required
              min="1"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Account Number</label>
            <input
              type="text"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">IFSC Code</label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
