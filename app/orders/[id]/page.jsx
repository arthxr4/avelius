import React from "react";

export default async function OrderDetailPage({ params }) {
  const id = params?.id;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="p-6 text-red-500">Error loading order data.</div>;
  }

  const { comments = [], totalOrdered = 0 } = await res.json();
  const doneCount = comments.filter((c) => c.state === "Done").length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Order details</h1>

      {/* Résumé en haut */}
      <div className="mb-6 flex items-center justify-between bg-gray-100 p-4 rounded-md">
        <p className="text-sm text-gray-700">
          {doneCount} / {totalOrdered} comments completed
        </p>
        <span className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
          {totalOrdered > 0 ? `${Math.round((doneCount / totalOrdered) * 100)}%` : "0%"}
        </span>
      </div>

      {/* Tableau des commentaires */}
      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <div className="grid grid-cols-3 bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2">
          <span>Account</span>
          <span>Comment</span>
          <span>Status</span>
        </div>

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="grid grid-cols-3 px-4 py-3 border-t text-sm"
          >
            <span className="truncate text-gray-800">{comment.account}</span>
            <span className="text-gray-700">{comment.content}</span>
            <span
              className={`font-medium ${
                comment.state === "Done"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {comment.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
