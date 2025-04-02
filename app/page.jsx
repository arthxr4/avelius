"use client";

import { useState } from "react";
import { Button } from "../components/ui/button.jsx";
import { Check, Info } from "lucide-react";



export default function GetSocialTrust() {
  const PRESET_PACKS = [
    { comments: 20, pricePerComment: 1.99 },
    { comments: 50, pricePerComment: 1.79 },
    { comments: 100, pricePerComment: 1.59 },
    { comments: 200, pricePerComment: 1.29 },
    { comments: 400, pricePerComment: 0.89 },
  ];
  
  const getRateByVolume = (count) => {
    if (count >= 400) return 0.89;
    if (count >= 350) return 0.99;
    if (count >= 300) return 1.09;
    if (count >= 250) return 1.19;
    if (count >= 200) return 1.29;
    if (count >= 150) return 1.49;
    if (count >= 100) return 1.59;
    if (count >= 50)  return 1.79;
    if (count >= 20)  return 1.99;
    return 1.99; // prix maximum si en-dessous de 20
  };

  const getBasePricePerComment = () => {
    const minPack = PRESET_PACKS.reduce((prev, curr) =>
      curr.comments < prev.comments ? curr : prev
    );
    return minPack.pricePerComment;
  };

  const [selectedPack, setSelectedPack] = useState(PRESET_PACKS[0]);
  const [customCount, setCustomCount] = useState(null);
  const [subscribe, setSubscribe] = useState(true);

  const handleCustomChange = (count) => {
    setCustomCount(count);
    if (count) {
      const rate = getRateByVolume(count);
      setSelectedPack({ comments: count, pricePerComment: rate });
    }
  };

  const minAds = Math.ceil(selectedPack.comments / 20);
  const maxAds = Math.ceil(selectedPack.comments / 10);

  const unitAmount = selectedPack.pricePerComment;
const subtotal = unitAmount * selectedPack.comments;
const discount = subscribe ? subtotal * 0.1 : 0;
const total = subtotal - discount;


  // ...
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
  
    // 👉 ouvrir une fenêtre temporaire *immédiatement* pour ne pas être bloqué
    const popup = window.open("", "_blank");
  
    const res = await fetch("/api/checkout/public", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comments: selectedPack.comments,
        unitAmount: Math.round(unitAmount * 100),
        isSubscription: subscribe,
      }),
    });
  
    const data = await res.json();
  
    if (data?.url) {
      popup.location.href = data.url; // ✅ redirige la popup ouverte
    } else {
      popup.close(); // ❌ ferme si erreur
      alert("Something went wrong...");
    }
  
    setLoading(false);
  };
  


  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full">
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
                const basePrice = getBasePricePerComment();
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
                    <div className="text-sm group-hover:text-sm sm:text-base sm:group-hover:text-sm lg:text-lg lg:group-hover:text-base font-semibold transition-all group-hover:-translate-y-1">
                      {pack.comments.toLocaleString("en-US")} comments
                    </div>
                    <div className="overflow-hidden transition-all duration-200 ease-in-out group-hover:max-h-20 max-h-0 flex flex-col items-center mt-0 opacity-0 group-hover:opacity-100">
                      <div className="text-xs text-gray-400 line-through">
                        ${(1).toFixed(2)}
                      </div>
                      <div className="text-xs font-semibold text-black">
                        ${pack.pricePerComment.toFixed(2)}/comment
                      </div>
                    </div>
                  </button>
                );
              })}

   {/* Custom input block */}
<div
  className={`group relative border rounded-xl h-20 sm:h-20 md:h-24 w-full flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out px-3 z-0
    ${customCount ? "bg-gray-50 border-gray-600 text-gray-800 ring-1 ring-gray-300" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}
>
  <div className="text-sm font-medium text-gray-500 mb-0 md:mb-2">Custom</div>
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    min={10}
    max={5000}
    value={customCount || ""}
    onChange={(e) => {
      let value = e.target.value.replace(/[.,]/g, "");
      value = value.replace(/\D/g, "");
      
     
      if (value.length > 0 && Number(value) > 5000) return;

    const numeric = Number(value);
    setCustomCount(numeric);

      if (numeric >= 10 && numeric <= 5000) {
        setCustomCount(numeric);
        const rate = getRateByVolume(numeric);
        setSelectedPack({ comments: numeric, pricePerComment: rate });
      } else {
        setCustomCount(numeric);
      }
    }}
    className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm"
    placeholder="Enter"
  />
  <div className="text-xs text-gray-400 mt-1">10-5000 comments</div>
</div>

            </div>
            {/* Features */}
            <div className="bg-white rounded-xl border p-6 mt-2">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-800">
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Human-written comments</div>
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Strategic replies</div>
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Increased social proof</div>
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Real profiles only</div>
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Persona-matched engagement</div>
                <div className="flex items-start gap-2"><Check className="text-[#1870EC] mt-1 w-4 h-4" /> Fast & reliable delivery</div>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600 mt-6">
                <span className="font-medium text-gray-800 mr-2">Countries available:</span>
                <img src="https://flagcdn.com/w80/us.png" alt="English" className="w-6 h-4 rounded-sm" />
                <img src="https://flagcdn.com/w80/gb.png" alt="USA" className="w-6 h-4 rounded-sm" />
                <img src="https://flagcdn.com/w80/au.png" alt="Australia" className="w-6 h-4 rounded-sm" />
                <img src="https://flagcdn.com/w80/ca.png" alt="Canada" className="w-6 h-4 rounded-sm" />
                <img src="https://flagcdn.com/w80/fr.png" alt="French" className="w-6 h-4 rounded-sm" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-8 bg-white border-l border-gray-200 flex flex-col justify-between">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-5">Summary</h3>
              <div className="space-y-2 text-sm text-black">
                <div className="flex justify-between">
                  <span className="font-bold text-base">Total comments</span>
                  <span className="font-bold text-base">{selectedPack.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-regular">Price per comment</span>
                  <span className="font-bold">${unitAmount.toFixed(2)}</span>
                </div>
                {/*
                <div className="flex justify-between items-center">
                  <span className="font-bold">Estimated ad range</span>
                  <span className=" text-lg font-bold">{minAds} - {maxAds} ads</span>
                </div>
                */}
              </div>

              <div className="flex items-start gap-3 rounded-md border border-muted bg-muted/50 text-muted-foreground text-xs px-4 py-3 mt-4">
                <Info className="w-5 h-5 text-primary mt-1" />
                <p className="leading-snug">
                  We recommend posting <strong className="text-foreground">15 to 20 comments per ad</strong> for best results. <br />
                  After checkout, you'll be able to split your comments across multiple ads by sending us their URLs.
                </p>
              </div>

              <hr className="my-6 border-t border-gray-200" />
              <div className="flex justify-between  text-sm text-black mb-2">
                <span className="font-regular">Sub-total</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

             

             {/* Subscription Option */}
<div className="mt-6 border border-dashed rounded-md p-4 text-sm bg-muted text-muted-foreground">
  <div className="flex justify-between items-center mb-1">
    <label htmlFor="subscribe" className="font-medium cursor-pointer text-foreground">
      <input
        id="subscribe"
        type="checkbox"
        className="mr-2 cursor-pointer"
        checked={subscribe}
        onChange={() => setSubscribe(!subscribe)}
      />
      Subscribe & save 10%
    </label>
    {subscribe && (
      <span className="font-semibold text-green-600">
        -${discount.toFixed(2)}
      </span>
    )}
  </div>
  <p className="text-xs leading-snug">
    Choose the subscription option at checkout to receive a <strong>10% discount</strong> on every monthly renewal. You can cancel anytime.
  </p>
</div>

              {/* Final total */}
              <div className="flex justify-between items-center  text-black mt-6">
                <span className="text-base font-regular">Total</span>
                <span className="font-bold text-2xl ">${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-right">
                {subscribe ? "Billed monthly (auto-renewal)" : "One-time payment"}
              </p>

              <Button
  onClick={handleCheckout}
  disabled={loading}
  className="w-full mt-6 bg-[#1870EC] hover:bg-[#0860DC] font-medium text-white py-5 text-base"
>
  {loading ? "Redirecting..." : "Confirm & Pay"}
</Button>
            </div>

             {/* Payment logos */}
             <div className="mt-0 pt-6 text-center text-gray-400 text-xs border-t">
              <p className="mb-3">Accepted payment methods:</p>
              <div className="flex flex-wrap justify-center items-center gap-4 grayscale opacity-50">
             
                <img src="/payments/visa.svg" alt="Visa" className="h-8" />
                <img src="/payments/mastercard.svg" alt="Mastercard" className="h-8" />
                
                <img src="/payments/applepay.svg" alt="Apple Pay" className="h-8" />
                <img src="/payments/googlepay.svg" alt="Google Pay" className="h-8" />
              </div>
              <p className="mt-4 flex items-center justify-center gap-1 font-semibold text-[11px] text-gray-500">
                 SSL Secure Payment — Powered by Stripe
              </p>
              <p className="text-[11px] text-gray-500">Your data is encrypted with 256-bit SSL.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}