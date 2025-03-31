import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, adUrl, quantity, language } = await req.json();

  if (!email || !adUrl || !quantity) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_TOKEN;

    // 👉 Étape 1 : Récupère le client via email
    const clientRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula={Contact Email}="${email}"`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const clientData = await clientRes.json();
    if (!clientData.records.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = clientData.records[0];
    const clientId = client.id;
    const currentCredits = client.fields.credits || 0;
    const updatedCredits = Math.max(currentCredits - quantity, 0);

    // 👉 Étape 2 : Crée une commande dans Orders
    const orderRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Client": [clientId],
            "Ads Link": adUrl,
            "Comments Per Ad": quantity,
            "Language": [language || "French"],
            "Date": new Date().toISOString(),
       
          },
        }),
      }
    );

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error("❌ Failed to create order in Airtable:", orderData);
      return NextResponse.json({ error: "Airtable order creation failed" }, { status: 500 });
    }

    // 👉 Étape 3 : Met à jour les crédits dans Clients
    await fetch(
      `https://api.airtable.com/v0/${baseId}/Clients/${clientId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            credits: updatedCredits,
          },
        }),
      }
    );

    return NextResponse.json({ success: true, order: orderData });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  
  }
}
