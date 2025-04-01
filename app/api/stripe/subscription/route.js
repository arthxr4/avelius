import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ fix ici
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("✅ userId from getAuth:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId); // ✅ maintenant ça fonctionne
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 404 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      expand: ["data.default_payment_method"],
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
        return NextResponse.json({ subscription: null, customer }, { status: 200 });

    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("💥 Subscription API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
