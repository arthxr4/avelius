import { buffer } from "micro";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  let event;
  const buf = await req.arrayBuffer();
  const body = Buffer.from(buf).toString();

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Quand un paiement est complété
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.mode === "payment") {
      console.log("💵 One-time payment completed → Creating invoice");

      try {
        await stripe.invoices.create({
          customer: session.customer,
          description: "One-time comment pack purchase",
          collection_method: "send_invoice",
          auto_advance: true,
        });

        console.log("✅ Invoice created");
      } catch (err) {
        console.error("❌ Failed to create invoice", err);
      }
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
