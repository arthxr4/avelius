"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn("email", {
      email,
      callbackUrl: "/dashboard", // où rediriger après login
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          Send magic link
        </button>
      </form>
    </div>
  );
}
