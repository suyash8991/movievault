'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MovieGrid from '@/components/movies/MovieGrid';
import { watchlistService } from '@/services/watchlist.service';
import { Movie } from '@/types/movie.types';

export default function WatchlistPreview() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await watchlistService.getWatchlist(1, 6);
        setMovies(response.results);
      } catch (err) {
        setError('Failed to load watchlist');
        console.error('Watchlist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Watchlist</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/watchlist"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try viewing full watchlist →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Watchlist</h2>
        {movies.length > 0 && (
          <Link
            href="/watchlist"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {loading ? (
        <MovieGrid movies={[]} loading={true} />
      ) : movies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
          <p className="text-gray-600 mb-4">Your watchlist is empty</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <MovieGrid movies={movies} loading={false} />
      )}
    </div>
  );
}
