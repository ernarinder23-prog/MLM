"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/" className="text-secondary hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary">MLM Platform</h1>
          <p className="text-text-secondary mt-2">Individual Login</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter username or email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-secondary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Individual Login"}
            </button>
          </form>
        </div>
        <p className="text-center text-text-secondary text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-secondary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
