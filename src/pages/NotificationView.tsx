// src/components/PastNotificationsList.tsx

import React, { useState, useEffect } from "react";

import { onMessage } from "firebase/messaging";
import { format } from "date-fns";
import DashboardLayout from '../components/DashboardLayout';


const PastNotificationsList = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Listen for new notifications received by the client
  useEffect(() => {
    // This listener is for when the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("New foreground message received!", payload);
      const newNotification = {
        title: payload.notification?.title,
        body: payload.notification?.body,
        date: new Date(),
        type: payload.data?.type || "Normal", // Assuming you send 'type' in the data payload
        image: payload.notification?.image,
      };
      // Add to the top of the list
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  // Simulate fetching initial/paginated data from your database (e.g., Firestore)
  useEffect(() => {
    setLoading(true);
    // TODO: Replace this with a real API call or Firestore query
    // Example: fetch(`/api/notifications?page=${page}&limit=10`)
    console.log(`Fetching page ${page}...`);
    setTimeout(() => {
      // This is mock data. In a real app, you would get this from your backend.
      const newItems = Array.from({ length: 10 }, (_, i) => ({
        id: `id_${page}_${i}`,
        title: `Past Notification Title #${(page - 1) * 10 + i + 1}`,
        body: "This is the body of a previously sent notification.",
        date: new Date(Date.now() - (i + (page - 1) * 10) * 3600000), // an hour ago, two hours ago, etc.
        type: i % 2 === 0 ? "Promotional" : "Normal",
        image: "https://via.placeholder.com/150",
      }));

      // In a real scenario, you'd append new items, not replace them
      // For this simulation, we'll just show the current page's data
      setNotifications(newItems);
      setHasMore(page < 5); // Simulate having 5 pages of data
      setLoading(false);
    }, 500);
  }, [page]);

  return (

    <DashboardLayout>
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Past Notifications</h2>
      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <div
              key={n.id || i}
              className="border rounded p-4 bg-white flex gap-4 items-center"
            >
              {n.image && (
                <img
                  src={n.image}
                  alt="Notification"
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold">{n.title}</div>
                <div className="text-gray-600">{n.body}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {n.type} · {n.date ? format(new Date(n.date), "PPpp") : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore || loading}
        >
          Next
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default PastNotificationsList;