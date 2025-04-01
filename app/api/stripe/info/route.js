// app/api/stripe/info/route.js
import { auth, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 404 });
    }

    const [subscriptions, invoices] = await Promise.all([
      stripe.subscriptions.list({ customer: customer.id, limit: 1 }),
      stripe.invoices.list({ customer: customer.id, limit: 5 }),
    ]);

    const subscription = subscriptions.data[0] || null;
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    let card = null;
    if (defaultPaymentMethodId) {
      const paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);
      card = paymentMethod.card;
    }

    return NextResponse.json({
      subscription,
      invoices,
      card,
      customer,
    });
  } catch (error) {
    console.error("💥 Stripe info error:", error);
    return NextResponse.json({ error: "Stripe fetch failed" }, { status: 500 });
  }
}
