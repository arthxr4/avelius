import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("✅ userId from getAuth:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // 🎯 Récupère le client Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({
        subscription: null,
        payments: [],
        customer: null,
      });
    }

    // 🔁 Récupère l'abonnement s'il existe
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      expand: ["data.default_payment_method"],
      limit: 1,
    });

    const subscription = subscriptions.data[0] || null;

    // 💸 Récupère les paiements uniques
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: 10,
    });

    const payments = paymentIntents.data.filter(p => p.status === "succeeded");

    return NextResponse.json({
      customer,
      subscription,
      payments,
    });
  } catch (error) {
    console.error("💥 Billing API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
