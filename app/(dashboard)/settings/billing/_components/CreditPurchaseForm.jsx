"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";

export function CreditPurchaseForm({ isSubscription }) {
  const PRESET_PACKS = [
    { comments: 20, pricePerComment: 1.25 },
    { comments: 50, pricePerComment: 1.0 },
    { comments: 100, pricePerComment: 0.9 },
    { comments: 200, pricePerComment: 0.8 },
    { comments: 400, pricePerComment: 0.7 },
  ];

  const getRateByVolume = (count) => {
    if (count >= 400) return 0.7;
    if (count >= 200) return 0.8;
    if (count >= 100) return 0.9;
    if (count >= 50) return 1.0;
    if (count >= 20) return 1.25;
    return 1.25;
  };

  const [selectedPack, setSelectedPack] = useState(PRESET_PACKS[0]);
  const [customCount, setCustomCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const unitAmount = selectedPack.pricePerComment;
  const subtotal = unitAmount * selectedPack.comments;
  const discount = isSubscription ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleCheckout = async () => {
    setLoading(true);
    const popup = window.open("", "_blank");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comments: selectedPack.comments,
        unitAmount: Math.round(unitAmount * 100),
        isSubscription,
      }),
    });

    const data = await res.json();

    if (data?.url) {
      popup.location.href = data.url;
    } else {
      popup.close();
      alert("Something went wrong...");
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[55%_44%] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* LEFT */}
      <div className="bg-[#F6F6F6] p-6 md:p-8 z-0 flex flex-col gap-4 md:gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Select your total comment credits</h3>
          <p className="text-sm text-gray-500 mt-1">
            This is the total number of comments you’ll be able to allocate across your ads.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
          {PRESET_PACKS.map((pack) => {
            const isSelected = selectedPack.comments === pack.comments && !customCount;
            const basePrice = 1.25;
            const savings = Math.round(((basePrice - pack.pricePerComment) / basePrice) * 100);
            return (
              <button
                key={pack.comments}
                onClick={() => {
                  setSelectedPack(pack);
                  setCustomCount(null);
                }}
                className={`group relative border rounded-xl h-20 sm:h-20 md:h-24 w-full flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out px-3 z-0
                ${isSelected ? "bg-gray-50 border-gray-600 text-gray-800 ring-1 ring-gray-300" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}
              >
                {savings >= 10 && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-green-100 text-green-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    SAVE {savings}%
                  </div>
                )}
                <div className="text-sm sm:text-base font-semibold">{pack.comments.toLocaleString("en-US")} comments</div>
                <div className="text-xs text-gray-500">{pack.pricePerComment.toFixed(2)} €/comment</div>
              </button>
            );
          })}

          {/* Custom input */}
          <div className={`group relative border rounded-xl h-20 md:h-24 w-full flex flex-col items-center justify-center px-3 text-center ${customCount ? "bg-gray-50 border-gray-600 ring-1 ring-gray-300" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
            <div className="text-sm font-medium text-gray-500">Custom</div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={10}
              max={5000}
              value={customCount || ""}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, "");
                if (val && Number(val) <= 5000) {
                  const numeric = Number(val);
                  setCustomCount(numeric);
                  const rate = getRateByVolume(numeric);
                  setSelectedPack({ comments: numeric, pricePerComment: rate });
                } else {
                  setCustomCount(null);
                }
              }}
              className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm mt-1"
              placeholder="Enter"
            />
            <div className="text-xs text-gray-400 mt-1">10-5000 comments</div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border p-6 mt-2">
          <h4 className="text-base font-semibold mb-4">Features</h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-800">
            <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Human-written comments</div>
            <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Real profiles only</div>
            <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Persona-matched replies</div>
            <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Fast delivery</div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="p-8 bg-white border-l border-gray-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-5">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total comments</span><span>{selectedPack.comments}</span></div>
            <div className="flex justify-between"><span>Price/comment</span><span>€{unitAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Sub-total</span><span>€{subtotal.toFixed(2)}</span></div>
            {isSubscription && (
              <div className="flex justify-between text-green-600 font-medium"><span>Subscription discount</span><span>-€{discount.toFixed(2)}</span></div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>€{total.toFixed(2)}</span></div>
          </div>

          <div className="text-xs text-gray-500 mt-2 text-right">
            {isSubscription ? "Billed monthly (cancel anytime)" : "One-time payment"}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 bg-[#1870EC] hover:bg-[#0860DC] text-white font-medium py-4 text-base"
          >
            {loading ? "Redirecting..." : "Confirm & Pay"}
          </Button>
        </div>

        {/* Logos */}
        <div className="mt-8 text-center text-gray-400 text-xs border-t pt-4">
          <p className="mb-3">Accepted payment methods:</p>
          <div className="flex flex-wrap justify-center gap-4 grayscale opacity-50">
            <img src="/payments/visa.svg" className="h-6" alt="Visa" />
            <img src="/payments/mastercard.svg" className="h-6" alt="Mastercard" />
            <img src="/payments/applepay.svg" className="h-6" alt="Apple Pay" />
            <img src="/payments/googlepay.svg" className="h-6" alt="Google Pay" />
          </div>
          <p className="mt-3 text-[11px]">SSL Secure Payment — Powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
