'use client';

import { useState, useEffect } from 'react';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types/movie.types';
import Image from 'next/image';
import Link from 'next/link';

interface SimilarMoviesProps {
  movieId: number;
  limit?: number;
}

/**
 * SimilarMovies Component
 *
 * Displays a horizontal scrolling list of movies similar to the current movie.
 */
export default function SimilarMovies({ movieId, limit = 10 }: SimilarMoviesProps) {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await movieService.getSimilarMovies(movieId);
        // Limit the number of movies to display
        setSimilarMovies(response.results.slice(0, limit));
      } catch (err) {
        console.error('Error fetching similar movies:', err);
        setError('Failed to load similar movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId, limit]);

  // Base URL for TMDB posters
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Placeholder for movies without posters - gray background with movie icon
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Similar Movies</h2>
        <div className="flex overflow-x-auto pb-4 space-x-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-36 animate-pulse"
            >
              <div className="bg-gray-200 rounded-lg aspect-[2/3] mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Similar Movies</h2>
        <p className="text-gray-600">Unable to load similar movies.</p>
      </div>
    );
  }

  if (similarMovies.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Similar Movies</h2>
        <p className="text-gray-600">No similar movies found.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Similar Movies</h2>
      <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {similarMovies.map((movie) => (
          <Link
            href={`/movies/${movie.id}`}
            key={movie.id}
            className="flex-shrink-0 w-36 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={movie.posterPath ? `${imageBaseUrl}${movie.posterPath}` : placeholderImage}
                alt={`${movie.title} poster`}
                fill
                sizes="150px"
                className="object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderImage;
                }}
              />
            </div>
            <div className="p-2">
              <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
              {movie.releaseDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(movie.releaseDate).getFullYear()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}