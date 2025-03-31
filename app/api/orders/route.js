import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    // Étape 1: Récupérer ID du client
    const resClient = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients?filterByFormula={Contact Email}="${email}"`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      },
    });

    const clientData = await resClient.json();
    if (!clientData.records.length) {
      return NextResponse.json({ orders: [] });
    }

    const clientId = clientData.records[0].id;

    // Étape 2: Récupérer les commandes
    const resOrders = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Orders?filterByFormula={Client}='${clientId}'`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      },
    });

    const ordersData = await resOrders.json();

    // Étape 3: Mapper
    const orders = ordersData.records.map((r) => ({
      id: r.id,
      url: r.fields["Ads Link"] || "",
      status: r.fields["Status"] || "Pending",
      quantity: r.fields["Quantité"] || 0,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("❌ Airtable Orders error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
