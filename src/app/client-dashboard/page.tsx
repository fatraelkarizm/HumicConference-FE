"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Simple client-only dashboard page.
 * - Renders only in browser (use client)
 * - If user not present in AuthContext, redirect to /login
 * - Shows minimal UI + logout button
 *
 * This is a temporary client-only route to avoid server-side auth redirect loops.
 * Later you can replace or move this UI into the proper server-protected dashboard when backend/session works.
 */

export default function ClientDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated on client: go to login
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Client-only Dashboard</h1>
        <p className="text-gray-700 mb-4">Welcome, <strong>{user.name}</strong> ({user.email})</p>

        <div className="mb-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <ul className="mt-2 text-sm text-gray-600">
            <li><strong>Role:</strong> {user.role}</li>
            <li><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</li>
            <li><strong>Last updated:</strong> {new Date(user.updated_at).toLocaleString()}</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push("/")}
          >
            Go Home
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}