import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  try {
    // 👉 1. Cherche le client correspondant à l'email
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula={Contact Email}="${email}"`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await res.json();

    // 👉 Si aucun client trouvé, on en crée un automatiquement
    if (!data.records.length) {
      const createRes = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Contact Email": email,
            credits: 0,
          },
        }),
      });

      const newClient = await createRes.json();

      return NextResponse.json({
        credits: 0,
        orders: [],
        created: true, // facultatif, utile pour debug côté client
      });
    }

    // 👉 2. Sinon on récupère les données comme avant
    const clientRecord = data.records[0];
    const credits = clientRecord.fields.credits || 0;
    const orderIds = clientRecord.fields.Orders || [];

    const orders = [];

    for (const orderId of orderIds) {
      const orderRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/Orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const orderData = await orderRes.json();

      orders.push({
        id: orderData.id,
        url: orderData.fields["Ads Link"] || null,
        status: orderData.fields.Status || "In progress",
        quantity: orderData.fields["Comments Per Ad"] || null,
        language: orderData.fields["Language"] || "Unknown",
        date: orderData.fields["Date"] || null,
      });
    }

    return NextResponse.json({ credits, orders });
  } catch (error) {
    console.error("Airtable fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
