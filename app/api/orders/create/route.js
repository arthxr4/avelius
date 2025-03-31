import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, adUrl, quantity } = await req.json();

  if (!email || !adUrl || !quantity) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Étape 1 : Trouver le client
    const clientRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients?filterByFormula={Contact Email}="${email}"`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
      }
    );

    const clientData = await clientRes.json();
    if (!clientData.records.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientId = clientData.records[0].id;

    // Étape 2 : Créer la commande dans Orders
    const orderRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Client": [clientId],
            "Ads Link": adUrl,
            "Comments Per Ad": quantity,
          },
        }),
      }
    );

    // Étape 3 : Décrémenter les crédits
    const currentCredits = clientData.records[0].fields.credits || 0;
    const updatedCredits = Math.max(currentCredits - quantity, 0);

    await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients/${clientId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            credits: updatedCredits,
          },
        }),
      }
    );

    const orderData = await orderRes.json();
    return NextResponse.json({ success: true, order: orderData });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
