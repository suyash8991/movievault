'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import WatchlistPreview from '@/components/dashboard/WatchlistPreview';
import RecentRatings from '@/components/dashboard/RecentRatings';
import RecommendationsSection from '@/components/dashboard/RecommendationsSection';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/auth.types';

/**
 * Dashboard Page
 *
 * A comprehensive, personalized dashboard showcasing user activity,
 * statistics, watchlist, ratings, and personalized recommendations.
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
 * Contains the actual dashboard content with multiple sections:
 * - Hero section with personalized greeting
 * - Statistics cards (watchlist, ratings, average rating)
 * - Quick actions panel
 * - Watchlist preview
 * - Recent ratings
 * - Personalized recommendations
 */
function DashboardContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await userService.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">
              {getGreeting()}, {user?.firstName}!
            </h1>
            <p className="text-blue-100 text-lg">
              Welcome back to your personalized movie vault
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Movies in Watchlist"
              value={profile?.statistics?.watchlistCount ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
              loading={loading}
              subtitle="Saved for later"
            />

            <StatCard
              title="Movies Rated"
              value={profile?.statistics?.ratingsCount ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              loading={loading}
              subtitle="Your reviews"
            />

            <StatCard
              title="Profile Visits"
              value="Coming Soon"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              loading={loading}
              subtitle="Analytics feature"
            />

            <StatCard
              title="Total Movies"
              value={((profile?.statistics?.watchlistCount ?? 0) + (profile?.statistics?.ratingsCount ?? 0))}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              }
              loading={loading}
              subtitle="Your collection"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <QuickActions />
          </div>

          {/* Watchlist Preview */}
          <WatchlistPreview />

          {/* Recent Ratings */}
          <RecentRatings />

          {/* Recommendations */}
          <RecommendationsSection />
        </div>
      </div>
    </div>
  );
}
