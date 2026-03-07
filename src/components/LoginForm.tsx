"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({ loginType: propLoginType }: { loginType?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginType = propLoginType || searchParams.get("type") || "individual";
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Admin uses traditional username/password login
      if (loginType === "admin") {
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
        router.push(data.redirect || "/admin");
        router.refresh();
      } else {
        // Franchise and Individual use OTP flow
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, loginType }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to send OTP");
          return;
        }
        // Redirect to OTP verification page with sessionId
        router.push(`/verify-otp?sessionId=${data.sessionId}&loginType=${loginType}`);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary">Cadence Solution</h1>
        <p className="text-text-secondary mt-2">
          {loginType === "admin" ? "Admin Login" : loginType === "franchise" ? "Franchise Login" : ""}
        </p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
          )}

          {/* Admin Login Fields */}
          {loginType === "admin" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Enter username"
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
            </>
          ) : (
            <>
              {/* Franchise and Individual Login Fields */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number or Email Address
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input"
                  placeholder="Enter Phone Number or Email Address"
                  required
                />
                <p className="text-xs text-text-secondary mt-1">
                  Example: +1234567890 or example@email.com
                </p>
                {/* <p className="text-xs text-text-secondary mt-2">
                  💡 <strong>Tip:</strong> Email OTP is fully working. For phone-based OTP, ensure your phone number is verified in your Twilio account settings.
                </p> */}
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
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-70"
          >
            {loading
              ? loginType === "admin"
                ? "Signing in..."
                : "Sending OTP..."
              : loginType === "admin"
              ? "Admin Login"
              : loginType === "franchise"
              ? "Franchise Login"
              : "Member Login"}
          </button>
        </form>
      </div>
    </>
  );
}
