import { Suspense } from "react";
import { OtpVerification } from "@/components/OtpVerification";

function OtpVerificationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<OtpVerificationSkeleton />}>
          <OtpVerification />
        </Suspense>
      </div>
    </div>
  );
}
