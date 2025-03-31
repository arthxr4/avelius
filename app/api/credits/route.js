import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const filterFormula = encodeURIComponent(`{email} = "${email}"`);

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients?filterByFormula=${filterFormula}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!data.records || data.records.length === 0) {
      return NextResponse.json({ credits: 0 });
    }

    const record = data.records[0];
    const credits = record.fields.credits || 0;

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Airtable fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
