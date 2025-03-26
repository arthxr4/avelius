import Stripe from "stripe";
import { NextResponse } from "next/server";

// Init Stripe avec ta clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Désactivation du body parser
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

  // 👇 Gère l'événement Stripe : checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerId = session.customer;

    console.log("✅ Paiement réussi !");
    console.log("👤 Client :", session.customer_email || "Non renseigné");
    console.log("💰 Montant total payé :", (session.amount_total / 100).toFixed(2), session.currency.toUpperCase());
    console.log("🧾 ID de session :", session.id);
    console.log("📦 Quantité :", session.amount_subtotal && session.amount_total
      ? Math.round((session.amount_total / session.amount_subtotal) * 100) + "%"
      : "Inconnue"
    );
    console.log("🕐 Mode :", session.mode);

    // 👉 Création de facture uniquement si c'est un paiement one-time
    if (session.mode === "payment") {
      try {
        // Étape 1 : créer un invoice item (ligne de produit à facturer)
        await stripe.invoiceItems.create({
          customer: customerId,
          amount: session.amount_total, // en centimes
          currency: session.currency,
          description: `One-time purchase of ${session.amount_total / 100} USD`,
        });

        // Étape 2 : créer une facture associée à ce customer
        const invoice = await stripe.invoices.create({
          customer: customerId,
          collection_method: "charge_automatically",
        });

        // Étape 3 : finaliser la facture pour déclencher l'envoi
        await stripe.invoices.finalizeInvoice(invoice.id);

        console.log("📄 Facture générée pour le paiement one-time !");
      } catch (err) {
        console.error("❌ Erreur création facture :", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
