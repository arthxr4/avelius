
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    console.log("✅ SECURE API HIT - userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await request.json();
    const { comments, unitAmount, isSubscription } = body;
    console.log("📦 Body received:", body);

    const unitAmountInCents = Math.round(unitAmount);
    const customers = await stripe.customers.list({ email, limit: 1 });
    const existingCustomer = customers.data[0];

    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const newCustomer = await stripe.customers.create({
        email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      });
      customerId = newCustomer.id;
    }

    // Vérifie si une subscription existe déjà
    let existingSub = null;
    if (isSubscription) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      existingSub = subs.data[0];
    }

    if (isSubscription && existingSub) {
        const getRateByVolume = (count) => {
            if (count >= 400) return 0.85;
            if (count >= 200) return 0.9;
            if (count >= 100) return 1;
            if (count >= 50) return 1.1;
            if (count >= 20) return 1.25;
            return 1.25; // prix max si en-dessous de 20
        };
      
        const rate = getRateByVolume(comments);
        const unitAmountInCents = Math.round(rate * 100);
      
        const updatedSub = await stripe.subscriptions.update(existingSub.id, {
          items: [{
            id: existingSub.items.data[0].id,
            quantity: comments,
            price_data: {
              currency: "usd",
              product: process.env.STRIPE_PRODUCT_ID,
              unit_amount: unitAmountInCents,
              recurring: { interval: "month" },
            },
          }],
          proration_behavior: "always_invoice",
          discounts: [{
            coupon: process.env.STRIPE_COUPON_10_PERCENT,
          }],
        });
      
        const invoice = await stripe.invoices.create({
          customer: customerId,
          subscription: updatedSub.id,
          collection_method: "charge_automatically",
        });
      
        await stripe.invoices.pay(invoice.id);
      
        console.log("🔄 Subscription updated & charged with new unit_amount:", unitAmountInCents);
      
        return NextResponse.json({ url: "/settings/billing?updated=1" });
      }
      
      

    // ➕ Sinon, crée une nouvelle session de paiement (sub ou one-time)
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      invoice_creation: !isSubscription ? { enabled: true } : undefined,
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: process.env.STRIPE_PRODUCT_ID,
            unit_amount: unitAmountInCents,
            ...(isSubscription && {
              recurring: { interval: "month" },
            }),
          },
          quantity: comments,
        },
      ],
      ...(isSubscription && {
        discounts: [{
          coupon: process.env.STRIPE_COUPON_10_PERCENT,
        }],
      }),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error("💥 Stripe secure error:", error);
    return NextResponse.json({ error: "Secure checkout failed" }, { status: 500 });
  }
}
