"use client";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Payment Confirmed</h1>
        <p className="text-gray-700 text-sm">
          Thanks for your order. All the next steps will be sent by email within the next few minutes.
        </p>
      </div>
    </div>
  );
}
