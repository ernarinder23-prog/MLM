"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OtpVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const loginType = searchParams.get("loginType") || "individual";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [resending, setResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle OTP input
  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // Handle backspace
  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // Verify OTP
  async function handleVerifyOtp() {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code: otpCode, loginType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setAttempts((prev) => prev + 1);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Successful verification
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      // Reset timer and attempts
      setTimeLeft(120);
      setAttempts(0);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!sessionId) {
    return (
      <div className="text-center">
        <p className="text-error">Invalid session. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary">Verify OTP</h1>
        <p className="text-text-secondary mt-2">Enter the OTP sent to your email or phone</p>
      </div>
      <div className="card">
        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
          )}

          {/* OTP Input Fields */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-4">
              Enter 6-Digit OTP
            </label>
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="0"
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-text-secondary">
                OTP expires in: <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-error">OTP has expired. Please resend.</p>
            )}
          </div>

          {/* Attempts Counter */}
          {attempts > 0 && (
            <div className="text-center">
              <p className="text-xs text-warning">
                Attempt {attempts} of 5. {5 - attempts} attempts remaining.
              </p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={loading || timeLeft <= 0}
            className="w-full btn-primary py-3 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            {timeLeft <= 0 ? (
              <button
                onClick={handleResendOtp}
                disabled={resending}
                className="text-sm text-secondary hover:underline disabled:opacity-70"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            ) : (
              <p className="text-xs text-text-secondary">
                Didn&apos;t receive OTP? Wait for timer to expire to resend.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
