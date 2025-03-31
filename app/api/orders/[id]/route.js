import { NextResponse } from "next/server";

export async function GET(_req, context) {
  const id = context.params?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  try {
    // 🔍 Récupérer la commande
    const orderRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const orderData = await orderRes.json();

    if (!orderData.fields) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const commentIds = orderData.fields["Comments"] || [];
    const totalCommentsOrdered = orderData.fields["Comments Per Ad"] || 0;

    // 🔍 Récupérer les commentaires liés
    const comments = [];

    for (const commentId of commentIds) {
      const commentRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/Comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const commentData = await commentRes.json();

      // 🔍 Username du compte lié
      let accountUsername = "—";
      const accountId = commentData.fields?.["Account"]?.[0];

      if (accountId) {
        const accountRes = await fetch(
          `https://api.airtable.com/v0/${baseId}/Accounts/${accountId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        const accountData = await accountRes.json();
        accountUsername = accountData.fields?.["Username"] || "—";
      }

      comments.push({
        id: commentData.id,
        content: commentData.fields?.["Comment Content"] || "—",
        state: commentData.fields?.["State"] || "—",
        account: accountUsername,
      });
    }

    return NextResponse.json({
      comments,
      totalOrdered: totalCommentsOrdered,
    });
  } catch (error) {
    console.error("Error fetching order/comments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
