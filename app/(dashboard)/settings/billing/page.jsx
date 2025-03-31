// app/settings/billing/page.jsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import BuyCredits from "./_components/BuyCredits";

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState(null);
  const [credits, setCredits] = useState(null);

  // Fetch credits
  useEffect(() => {
    const fetchCredits = async () => {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
      });

      const data = await res.json();
      setCredits(data.credits);
    };

    if (user) fetchCredits();
  }, [user]);

  // Open Stripe customer portal
  const handlePortal = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (data?.url) {
      window.open(data.url, "_blank");
    } else {
      alert("Unable to open Stripe portal");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-8">Plan & Billing</h1>

      {/* Bloc 1 — Infos sur l'abonnement */}
      <div className="mb-8 bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-2">Current Plan</h2>
        <p className="text-sm text-gray-600 mb-2">
          You have <strong>{credits ?? "..."}</strong> credits available.
        </p>
        <Button onClick={handlePortal} disabled={loading}>
          {loading ? "Redirecting..." : "Manage Subscription"}
        </Button>
        
      </div>

      <BuyCredits />

      {/* Bloc 2 — Achat ponctuel */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-2">Buy More Credits</h2>
        <p className="text-sm text-gray-600 mb-4">
          One-time purchase — credits will be added to your account immediately.
        </p>

        

        {/* 👇 Tu peux intégrer ici le même composant que ta page d’achat principale */}
        <Button
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Buy More Credits
        </Button>
      </div>
    </div>
  );
}
