import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { comments, unitAmount, isSubscription } = await req.json();

    const unitAmountInCents = Math.round(unitAmount); // déjà multiplié par 100 dans page.js

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      billing_address_collection: "required",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: process.env.STRIPE_PRODUCT_ID,
            unit_amount: unitAmountInCents,
            ...(isSubscription && {
              recurring: {
                interval: "month",
              },
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
            customer_creation: "always",
          }),

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: "https://divine-marketing-226902.framer.app/#pricing",
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
