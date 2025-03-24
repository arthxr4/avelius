import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { comments, unitAmount, isSubscription } = await req.json();

    // ⚠️ Stripe exige un entier en CENTIMES
    const unitAmountInCents = Math.round(unitAmount); // tu l'envoies déjà depuis page.js multiplié par 100

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: process.env.STRIPE_PRODUCT_ID,
            unit_amount: unitAmountInCents, // ✅ bien un INT en centimes
            ...(isSubscription && {
              recurring: {
                interval: "month",
              },
            }),
          },
          quantity: comments, // ✅ nombre de commentaires achetés
        },
      ],
      discounts: isSubscription
        ? [
            {
              coupon: process.env.STRIPE_COUPON_10_PERCENT, // 👈 si tu passes par un coupon
            },
          ]
        : [],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong with Stripe checkout." },
      { status: 500 }
    );
  }
}
