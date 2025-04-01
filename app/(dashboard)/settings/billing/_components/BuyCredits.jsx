"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CreditPurchaseForm } from "./CreditPurchaseForm.jsx";

export default function BuyCredits() {
  const [selectedTab, setSelectedTab] = useState("monthly");

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Tabs defaultValue="monthly" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="monthly">Monthly Subscription</TabsTrigger>
          <TabsTrigger value="one-time">One-time Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <CreditPurchaseForm isSubscription={true} />
        </TabsContent>

        <TabsContent value="one-time">
          <CreditPurchaseForm isSubscription={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
