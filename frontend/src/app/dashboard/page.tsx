'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard Page
 *
 * A protected page that demonstrates the authentication system.
 * This page is only accessible to authenticated users.
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

/**
 * Dashboard Content Component
 *
 * Contains the actual dashboard content. This is only rendered
 * if the user is authenticated.
 */
function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user?.firstName}!</h2>
            <p className="text-gray-600">
              This is a protected page that can only be accessed by authenticated users.
            </p>
          </div>

          <div className="bg-gray-100 rounded-md p-4 mb-6">
            <h3 className="font-semibold mb-2">Your Profile</h3>
            <ul className="space-y-2">
              <li><strong>Email:</strong> {user?.email}</li>
              <li><strong>Username:</strong> {user?.username}</li>
              <li><strong>Name:</strong> {user?.firstName} {user?.lastName}</li>
            </ul>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}