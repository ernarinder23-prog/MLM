"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setSent(true);
      if (data.devToken) setDevToken(data.devToken);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md card text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-heading font-semibold text-primary mb-2">
            Check your email
          </h2>
          <p className="text-text-secondary mb-6">
            If an account exists with that email, you will receive a password reset link.
          </p>
          {devToken && (
            <div className="p-4 bg-warning/10 rounded-lg text-left mb-6">
              <p className="text-sm font-medium text-warning mb-2">Dev mode: Reset link</p>
              <Link
                href={`/reset-password?token=${devToken}`}
                className="text-sm text-secondary break-all hover:underline"
              >
                {typeof window !== "undefined"
                  ? window.location.origin
                  : ""}
                /reset-password?token={devToken}
              </Link>
            </div>
          )}
          <Link href="/login" className="btn-primary inline-block">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary">Reset Password</h1>
          <p className="text-text-secondary mt-2">Enter your email to receive a reset link</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
        <p className="text-center mt-6">
          <Link href="/login" className="text-secondary hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
