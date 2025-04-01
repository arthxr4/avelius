"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SubscriptionDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/subscription")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => console.error("💥 API error:", err))
      .finally(() => setLoading(false));
  }, []);

  const subscription = data?.subscription;
  const card = subscription?.default_payment_method?.card;
  const billing = subscription?.default_payment_method?.billing_details;
  const address = billing?.address;
  const name = billing?.name;

  const quantity = subscription?.quantity;
  const interval = subscription?.plan?.interval;
  const amount = subscription?.plan?.amount
    ? `$${(subscription.plan.amount / 100).toFixed(2)}`
    : null;
  const nextDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <Card className="border rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Manage Subscription</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
        {/* Left */}
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium">Next Renewal</div>
            {loading ? (
              <Skeleton className="h-4 w-32 mt-1" />
            ) : nextDate ? (
              <div className="text-foreground font-medium">{nextDate}</div>
            ) : (
              <div className="text-muted italic">No subscription</div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium">Plan</div>
            {loading ? (
              <>
                <Skeleton className="h-4 w-40 mt-1" />
                <Skeleton className="h-3 w-28 mt-1" />
              </>
            ) : quantity && interval ? (
              <>
                <div className="text-foreground">{quantity} comments / {interval}</div>
                <div className="text-muted-foreground text-xs">{amount} per unit</div>
              </>
            ) : (
              <div className="text-muted italic">One-time purchase</div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium">Billing Details</div>
            {loading ? (
              <>
                <Skeleton className="h-3 w-40 mt-1" />
                <Skeleton className="h-3 w-48 mt-1" />
                <Skeleton className="h-3 w-36 mt-1" />
                <Skeleton className="h-3 w-14 mt-1" />
              </>
            ) : name || address ? (
              <>
                {name && <div>{name}</div>}
                {address?.line1 && <div>{address.line1}</div>}
                {address?.postal_code && address?.city && (
                  <div>{address.postal_code} {address.city}</div>
                )}
                {address?.country && <div>{address.country}</div>}
              </>
            ) : (
              <div className="text-muted italic">No billing info</div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium">Credit Card</div>
            {loading ? (
              <>
                <Skeleton className="h-4 w-36 mt-1" />
                <Skeleton className="h-3 w-20 mt-1" />
              </>
            ) : card ? (
              <>
                <div className="font-medium text-foreground">**** **** **** {card.last4}</div>
                <div className="text-xs">Exp. {card.exp_month}/{card.exp_year}</div>
              </>
            ) : (
              <div className="text-muted italic">No card found</div>
            )}
          </div>

          <div className="mt-4">
          <Button
  variant="link"
  className="text-sm font-medium text-primary hover:underline p-0 h-auto"
  onClick={async () => {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: billing?.email }),
    });

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Stripe portal unavailable.");
    }
  }}
>
  Invoices & Manage subscription →
</Button>
            <div className="text-xs text-muted-foreground mt-1">
              View and cancel in the Stripe portal
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
