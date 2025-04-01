"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-white w-full max-w-md rounded-xl border shadow-lg p-8 text-center space-y-6">
        <CheckCircle2 className="text-green-600 w-12 h-12 mx-auto" />

        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Payment Successful
          </h1>
          <p className="text-sm text-muted-foreground">
          We’ve sent a confirmation email with your receipt and important next steps. Please check your inbox.
          </p>
        </div>

       
        <Button variant="default" className="w-full bg-[#1870EC] hover:bg-[#0860DC]" asChild>
          <a href="https://www.getsocialtrust.com">Return to website</a>
        </Button>
      </div>
    </div>
  );
}
