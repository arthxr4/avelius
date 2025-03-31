import { NextResponse } from "next/server";

// 🧠 Cache global (valable tant que le serveur tourne)
const cache = new Map();

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const cacheKey = `credits:${email}`;

  // ✅ Check si en cache
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey));
  }

  try {
    // 👉 1. Cherche le client
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula={Contact Email}="${email}"`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    const data = await res.json();

    let credits = 0;
    let orders = [];

    if (!data.records.length) {
      // ✨ Crée un nouveau client si inexistant
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

      const response = { credits: 0, orders: [], created: true };
      cache.set(cacheKey, response);
      setTimeout(() => cache.delete(cacheKey), 10000); // 💾 10 sec TTL

      return NextResponse.json(response);
    }

    // 👉 2. Données du client
    const clientRecord = data.records[0];
    credits = clientRecord.fields.credits || 0;
    const orderIds = clientRecord.fields.Orders || [];

    // 👉 3. Récupère les commandes
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

    const response = { credits, orders };

    // ✅ Stock en cache pendant 30s
    cache.set(cacheKey, response);
    setTimeout(() => cache.delete(cacheKey), 30000);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Airtable fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
