import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ fix ici
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // 🔍 On cherche les clients Stripe qui ont ce mail
    const customers = await stripe.customers.list({ email });
    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({ payments: [] });
    }

    // 💳 Récupère les paiements réussis
    const payments = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: 5,
    });

    const successful = payments.data.filter(p => p.status === "succeeded");

    return NextResponse.json({ payments: successful });
  } catch (err) {
    console.error("💥 One-time payments API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
