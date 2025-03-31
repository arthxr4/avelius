'use client';

import { useState } from "react";

export default function ClientPortal() {
  const [adLinks, setAdLinks] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const adUrl = formData.get("adUrl");

    if (!adUrl) return alert("Please enter an ad link.");

    setAdLinks((prev) => [...prev, adUrl]); // ➕ ajoute à la liste
    console.log("➡️ New ad URL submitted:", adUrl);
    e.target.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Client Portal
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-md w-full">
        <label htmlFor="adUrl" className="text-sm font-medium text-gray-700">
          Add an ad link
        </label>
        <input
          id="adUrl"
          name="adUrl"
          type="url"
          placeholder="https://facebook.com/ads/..."
          required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
        >
          Submit
        </button>
      </form>

      {/* Liste des liens soumis */}
      {adLinks.length > 0 && (
        <div className="mt-10 max-w-md w-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your ad links</h2>
          <ul className="space-y-2">
            {adLinks.map((link, index) => (
              <li key={index} className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-gray-50">
                {link}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
