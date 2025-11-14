'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/components/movies/StarRating';
import { ratingService } from '@/services/rating.service';
import { RatingWithMovie } from '@/types/movie.types';

export default function RecentRatings() {
  const [ratings, setRatings] = useState<RatingWithMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ratingService.getUserRatings(1, 5);
        setRatings(response.results);
      } catch (err) {
        setError('Failed to load ratings');
        console.error('Ratings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Ratings</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-16 h-24 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Ratings</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Ratings</h2>
      </div>

      {ratings.length === 0 ? (
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
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <p className="text-gray-600 mb-4">You haven&apos;t rated any movies yet</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Rating Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Link
              key={rating.id}
              href={`/movies/${rating.movie.id}`}
              className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-24 relative flex-shrink-0 rounded overflow-hidden">
                {rating.movie.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${rating.movie.posterPath}`}
                    alt={rating.movie.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-1">
                  {rating.movie.title}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={rating.rating} readonly size="sm" />
                  <span className="text-sm text-gray-600">
                    {rating.rating}/10
                  </span>
                </div>

                {rating.review && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {rating.review}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(rating.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
