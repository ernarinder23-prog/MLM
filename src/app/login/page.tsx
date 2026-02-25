import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/" className="text-secondary hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
