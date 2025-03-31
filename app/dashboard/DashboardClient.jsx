'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from "next-auth/react";

export default function DashboardClient({ userEmail }) {
  const [credits, setCredits] = useState(null);
  const [requests, setRequests] = useState([
    {
      id: 1,
      url: 'https://facebook.com/ad-1',
      comments: 20,
      status: 'In progress',
    },
    {
      id: 2,
      url: 'https://facebook.com/ad-2',
      comments: 50,
      status: 'Delivered',
    },
    {
      id: 3,
      url: 'https://facebook.com/ad-3',
      comments: 10,
      status: 'In review',
    },
  ]);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!userEmail) return;
  
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });
  
      const data = await res.json();
      setCredits(data.credits || 0);
    };
  
    fetchCredits();
  }, [userEmail]);
  

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
      Welcome, {userEmail}
      </h1>
      
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="ml-auto mb-6 text-sm text-gray-500 hover:underline"
      >
        Log out
      </button>

      {/* Crédits restants */}
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">Credits remaining</p>
        <p className="text-3xl font-semibold text-orange-600">
          {credits === null ? "..." : credits}
        </p>
      </div>

      {/* Demandes existantes */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Your comment requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven't submitted any requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="p-4 border rounded-md bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-700">📌 {r.url}</p>
                <p className="text-sm text-gray-600">💬 {r.comments} comments</p>
                <p className="text-sm">
                  <span className="text-gray-500">Status: </span>
                  <span className="font-medium text-blue-600">{r.status}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulaire nouvelle demande */}
      <div className="border-t pt-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Submit a new request</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const url = form.adUrl.value;
            const commentCount = Number(form.commentCount.value);

            if (!url || !commentCount || commentCount <= 0) {
              alert('Please enter a valid URL and number of comments.');
              return;
            }

            const newRequest = {
              id: requests.length + 1,
              url,
              comments: commentCount,
              status: 'In progress',
            };

            setRequests([...requests, newRequest]);
            setCredits((prev) => prev - commentCount);
            form.reset();
          }}
          className="space-y-4"
        >
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
              Number of comments
            </label>
            <input
              type="number"
              name="commentCount"
              id="commentCount"
              min={1}
              max={credits || 1}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-md"
          >
            Submit request
          </button>
        </form>
      </div>
    </div>
  );
}
