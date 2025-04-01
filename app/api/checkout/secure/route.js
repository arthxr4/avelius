import { auth, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId } = auth(request); // ✅ ici, on passe bien `request`
    console.log("✅ SECURE API HIT - userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔍 Récupère l'email de l'utilisateur connecté
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await request.json();
    const { comments, unitAmount, isSubscription } = body;
    console.log("📦 Body received:", body);

    const unitAmountInCents = Math.round(unitAmount); // Déjà multiplié par 100 côté front

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      billing_address_collection: "required",
      invoice_creation: !isSubscription ? { enabled: true } : undefined,
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
      ...(isSubscription
        ? {
            discounts: [
              {
                coupon: process.env.STRIPE_COUPON_10_PERCENT,
              },
            ],
          }
        : {
            customer_email: email, // ✅ lie à l'utilisateur Clerk existant
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
