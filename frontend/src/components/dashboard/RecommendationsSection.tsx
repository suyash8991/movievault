'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MovieGrid from '@/components/movies/MovieGrid';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types/movie.types';

export default function RecommendationsSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch personalized recommendations first
        // If that fails or returns empty, fallback to popular movies
        let recommendedMovies: Movie[] = [];

        // TODO: Implement personalized recommendations
        // try {
        //   const personalizedResponse = await movieService.getRecommendations();
        //   recommendedMovies = personalizedResponse.movies;
        //   setIsPersonalized(true);
        // } catch {
        //   console.log('Personalized recommendations not available, using popular movies');
        // }

        // For now, use popular movies as recommendations
        if (recommendedMovies.length === 0) {
          const popularResponse = await movieService.getPopularMovies(1);
          recommendedMovies = popularResponse.results.slice(0, 6);
          setIsPersonalized(false);
        }

        setMovies(recommendedMovies);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Recommendations fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse all movies →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isPersonalized ? 'Recommended For You' : 'Popular Movies'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isPersonalized
              ? 'Based on your ratings and preferences'
              : 'Trending movies to discover'}
          </p>
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
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
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="text-gray-600 mb-4">No recommendations available</p>
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
