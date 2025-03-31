'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { toast } from "sonner";

export default function DashboardClient() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [credits, setCredits] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchCredits = async () => {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      setCredits(data.credits || 0);
      setOrders(data.orders || []);
    };

    fetchCredits();
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const url = form.adUrl.value;
    const quantity = Number(form.commentCount.value);
    const language = form.language.value; 

    if (!url || !quantity || quantity <= 0) {
      alert("Please enter a valid URL and number of comments.");
      return;
    }

    if (quantity > 20) {
      alert("❌ You can’t order more than 20 comments per ad.");
      return;
    }

    if (quantity > credits) {
      alert("❌ You don’t have enough credits for this request.");
      return;
    }

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, adUrl: url, quantity, language}),
    });

    const data = await res.json();
    console.log("📦 API response:", data); // ← ajoute ça
    if (!data.success) {
      alert("An error occurred while submitting your request.");
      return;
    }

    const newOrder = {
      id: data.order.id,
      url,
      quantity,
      language,
      status: "To Do",
      date: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCredits((prev) => prev - quantity);
    toast.success("Your comment request has been submitted!");
    form.reset();
  };

  if (!userEmail) {
    return <div className="p-8 text-gray-600 text-sm">Loading user info...</div>;
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.firstName || userEmail}
        </h1>
        <SignOutButton>
          <button className="text-sm text-gray-500 hover:underline">Log out</button>
        </SignOutButton>
      </div>

      {/* Crédits restants */}
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">Credits remaining</p>
        <p className="text-3xl font-semibold text-orange-600">
          {credits === null ? "..." : credits}
        </p>
      </div>

      {/* Formulaire nouvelle commande */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Submit a new request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="adUrl" className="block text-sm font-medium text-gray-700">
              Ad URL
            </label>
            <input
              type="url"
              name="adUrl"
              id="adUrl"
              placeholder="https://facebook.com/ads/..."
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="commentCount" className="block text-sm font-medium text-gray-700">
              Number of comments (max: 20)
            </label>
            <input
              type="number"
              name="commentCount"
              id="commentCount"
              min={1}
              max={20}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
    Language
  </label>
  <select
  name="language"
  id="language"
  required
  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
>
  <option value="French">French</option>
  <option value="English">English</option>
</select>
</div>


          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-md"
          >
            Submit request
          </button>
        </form>
      </div>

      {/* Commandes Airtable */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Your comment requests</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven't submitted any requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {[...orders]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((r) => (
                <li key={r.id || `${r.url}-${r.date}`} className="p-4 border rounded-md bg-white shadow-sm">
                  <p className="text-sm font-medium text-gray-700">📌 {r.url}</p>
                  <p className="text-sm text-gray-600">💬 {r.quantity || 0} comments</p>
                  <p className="text-sm text-gray-600">🗣️ Language: {r.language || '—'}</p>
                  <p className="text-sm text-gray-600">🆔 Order ID: {r.id}</p>
                  <p className="text-sm text-gray-600">
                    🗓️ Date (UTC):{" "}
                    {r.date
                      ? new Date(r.date).toLocaleString("en-GB", {
                          timeZone: "UTC",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Status: </span>
                    <span className="font-medium text-blue-600">{r.status || "—"}</span>
                  </p>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
