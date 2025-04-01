"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import BuyCredits from "./_components/BuyCredits";
import SubscriptionDetails from "./_components/SubscriptionDetails";
import AllPayments from "./_components/AllPayments";

function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const searchParams = useSearchParams();
  const showUpdatedNotice = searchParams.get("updated") === "1";

  useEffect(() => {
    if (showUpdatedNotice) {
      setTimeout(() => {
        toast.success("Your subscription has been updated successfully.");
      }, 1000);
    }
  }, [showUpdatedNotice]);

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

      <div className="mx-auto">
        <SubscriptionDetails />
        <AllPayments />
      </div>

      <BuyCredits />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
