import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Désactive le body parser par défaut
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Erreur de vérification Webhook :", err.message);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("✅ Paiement réussi !");
    console.log("👤 Client :", session.customer_email || "Non renseigné");
    console.log("💰 Montant total payé :", (session.amount_total / 100).toFixed(2), session.currency.toUpperCase());
    console.log("🧾 ID de session :", session.id);
    console.log("📦 Quantité :", session.amount_subtotal && session.amount_total
      ? Math.round((session.amount_total / session.amount_subtotal) * 100) + "%"
      : "Inconnue"
    );
    console.log("🕐 Mode :", session.mode); // "payment" ou "subscription"

    // Tu peux aussi utiliser session.metadata.comments ici si tu veux le rajouter plus tard
  }

  return NextResponse.json({ received: true });
}
