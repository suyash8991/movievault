'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/movies/SearchBar';
import MovieGrid from '@/components/movies/MovieGrid';
import Pagination from '@/components/common/Pagination';
import { movieService } from '@/services/movie.service';
import { PaginatedMovies } from '@/types/movie.types';

/**
 * Homepage Component
 *
 * The main landing page for Movie Vault featuring:
 * - Hero section with branding and search
 * - Popular movies section with pagination
 * - Dynamic CTAs based on authentication state
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [popularMovies, setPopularMovies] = useState<PaginatedMovies>({
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch popular movies on mount and page change
  useEffect(() => {
    const fetchPopularMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await movieService.getPopularMovies(currentPage);
        setPopularMovies(results);
      } catch (err) {
        console.error('Failed to load popular movies:', err);
        setError('Failed to load popular movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, [currentPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Branding */}
            <h1 className="text-5xl font-bold mb-4">Movie Vault</h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover, explore, and manage your personal movie collection
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <Suspense fallback={
                <div className="w-full p-3 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-gray-400">
                  Search for movies...
                </div>
              }>
                <SearchBar
                  placeholder="Search for movies..."
                  initialQuery=""
                />
              </Suspense>
            </div>

            {/* CTAs - Different for authenticated vs guest users */}
            <div className="flex gap-4 justify-center items-center flex-wrap">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
                  >
                    Go to Dashboard
                  </Link>
                  <span className="text-blue-100">
                    Welcome back, {user?.firstName}!
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out border-2 border-blue-500"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Movies Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Popular Movies
            </h2>
            <p className="text-gray-600">
              Trending movies everyone is watching right now
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Movie Grid */}
          <MovieGrid movies={popularMovies.results} loading={loading} />

          {/* Pagination */}
          {popularMovies.total_pages > 1 && !loading && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={popularMovies.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Movie Vault</h3>
                <p className="text-gray-400 text-sm">
                  Your personal movie database for discovering and organizing
                  your favorite films.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/movies/search"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Search Movies
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={isAuthenticated ? '/dashboard' : '/login'}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {isAuthenticated ? 'Dashboard' : 'Sign In'}
                    </Link>
                  </li>
                  {!isAuthenticated && (
                    <li>
                      <Link
                        href="/register"
                        className="text-gray-400 hover:text-white transition"
                      >
                        Register
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Attribution */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Source</h3>
                <p className="text-gray-400 text-sm">
                  Movie data provided by{' '}
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    The Movie Database (TMDb)
                  </a>
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Movie Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
