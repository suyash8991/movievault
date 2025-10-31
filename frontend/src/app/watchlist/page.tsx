'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MovieGrid from '@/components/movies/MovieGrid';
import Pagination from '@/components/common/Pagination';
import { watchlistService } from '@/services/watchlist.service';
import { PaginatedWatchlist } from '@/types/movie.types';
import { useAuth } from '@/hooks/useAuth';

/**
 * Watchlist Page
 *
 * Displays the user's watchlist with pagination.
 * Requires authentication.
 */
export default function WatchlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [watchlist, setWatchlist] = useState<PaginatedWatchlist>({
    page: 1,
    results: [],
    limit: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnTo=/watchlist');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch watchlist when page changes
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const results = await watchlistService.getWatchlist(currentPage, 20);
        setWatchlist(results);
      } catch (err) {
        console.error('Watchlist error:', err);
        setError('Failed to load watchlist. Please try again.');
        setWatchlist({
          page: 1,
          results: [],
          limit: 20,
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [currentPage, isAuthenticated]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total pages
  const totalPages = Math.ceil(watchlist.total / watchlist.limit);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Watchlist</h1>
          <p className="text-gray-600">
            {watchlist.total > 0
              ? `${watchlist.total} ${watchlist.total === 1 ? 'movie' : 'movies'} in your watchlist`
              : 'Your watchlist is empty'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && watchlist.results.length === 0 && !error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No movies in your watchlist
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding movies you want to watch to your watchlist
            </p>
            <button
              onClick={() => router.push('/movies/search')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Movies
            </button>
          </div>
        )}

        {/* Movie Grid */}
        {!error && watchlist.results.length > 0 && (
          <>
            <MovieGrid movies={watchlist.results} loading={loading} />

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
