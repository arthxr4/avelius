"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllPayments() {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || []);
      })
      .catch((err) => {
        console.error("💥 Failed to load payments:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border rounded-lg shadow-sm mt-6">
      <CardHeader>
        <CardTitle>All Payments</CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground space-y-4">
        {loading && (
          <div className="space-y-4">
            {[...Array(1)].map((_, i) => (
              <div key={i} className="space-y-2">
                
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <hr />
              </div>
            ))}
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="text-muted italic">No payments found</div>
        )}

        {!loading &&
          payments.map((p) => {
            const amount = (p.amount / 100).toFixed(2);
            const unitAmount = p.amount_received && p.metadata?.unit_amount
              ? parseFloat(p.metadata.unit_amount) / 100
              : 1; // fallback
              const quantity = p.metadata?.quantity
              ? parseInt(p.metadata.quantity)
              : unitAmount
                ? Math.round(p.amount / (unitAmount * 100))
                : "—";
            const date = new Date(p.created * 1000).toLocaleDateString();

            return (
              <div key={p.id} className="space-y-1">
                <div>
                  <span className="text-foreground font-medium">${amount}</span> paid
                </div>
                
                <div className="text-xs text-muted-foreground">on {date}</div>
                <hr />
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
