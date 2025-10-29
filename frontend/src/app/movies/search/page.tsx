'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/movies/SearchBar';
import MovieGrid from '@/components/movies/MovieGrid';
import Pagination from '@/components/common/Pagination';
import { movieService } from '@/services/movie.service';
import { PaginatedMovies } from '@/types/movie.types';

/**
 * Movie Search Page Content Component
 *
 * Allows users to search for movies and view results with pagination.
 */
function MovieSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [searchResults, setSearchResults] = useState<PaginatedMovies>({
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch search results when query or page changes
  useEffect(() => {
    const fetchMovies = async () => {
      // Don't search if query is empty
      if (!query) {
        setSearchResults({
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await movieService.searchMovies({
          q: query,
          page: currentPage,
        });
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to load movies. Please try again.');
        setSearchResults({
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query, currentPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/movies/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Movie Search</h1>

        {/* Search bar */}
        <div className="mb-8">
          <SearchBar
            initialQuery={query}
            placeholder="Search for movies by title..."
          />
        </div>

        {/* Search results */}
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {query && !loading && searchResults.total_results > 0 && (
              <div className="mb-6 text-gray-600">
                Found {searchResults.total_results} results for &quot;{query}&quot;
              </div>
            )}

            <MovieGrid
              movies={searchResults.results}
              loading={loading}
            />

            {searchResults.total_pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={searchResults.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Movie Search Page
 *
 * Wraps the search content in Suspense boundary as required by Next.js 15.
 */
export default function MovieSearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Movie Search</h1>
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    }>
      <MovieSearchPageContent />
    </Suspense>
  );
}