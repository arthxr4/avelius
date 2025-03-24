"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const clientStatus = searchParams.get("client"); // "new" or "existing"

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientStatus === "new") {
        window.location.href = "https://your-onboarding.typeform.com";
      } else {
        window.location.href = "https://your-dashboard.vercel.app";
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [clientStatus]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment successful!</h1>
        <p className="text-gray-600 text-sm mb-4">
          Thank you for your purchase. A confirmation email has been sent.
        </p>
        <p className="text-xs text-gray-400">
          You’ll be redirected in a few seconds...
        </p>

        <div className="mt-6">
          <a
            href={
              clientStatus === "new"
                ? "https://your-onboarding.typeform.com"
                : "https://your-dashboard.vercel.app"
            }
            className="text-sm text-blue-600 hover:underline"
          >
            Click here if you’re not redirected
          </a>
        </div>
      </div>
    </div>
  );
}
