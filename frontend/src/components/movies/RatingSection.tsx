'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ratingService } from '@/services/rating.service';
import StarRating from './StarRating';
import type { PaginatedMovieRatings } from '@/types/movie.types';

interface RatingSectionProps {
  movieId: number;
}

/**
 * RatingSection Component
 *
 * Displays movie ratings and allows authenticated users to rate/review.
 */
export default function RatingSection({ movieId }: RatingSectionProps) {
  const { isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState<PaginatedMovieRatings | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [userReview, setUserReview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [movieId]);

  const loadRatings = async () => {
    try {
      const data = await ratingService.getMovieRatings(movieId, 1, 5);
      setRatings(data);
    } catch (err) {
      console.error('Error loading ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await ratingService.upsertRating(movieId, {
        rating: userRating,
        review: userReview || undefined
      });
      setSuccess(true);
      setUserReview('');
      await loadRatings(); // Reload ratings
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const error = err as {response?: {data?: {error?: string}}};
      setError(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      {ratings && ratings.totalRatings > 0 && (
        <div className="flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold text-gray-800">
              {ratings.averageRating?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {ratings.totalRatings} {ratings.totalRatings === 1 ? 'rating' : 'ratings'}
            </div>
          </div>
          <StarRating rating={ratings.averageRating || 0} readonly size="lg" showValue={false} />
        </div>
      )}

      {/* Add Your Rating (Auth Required) */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Rate this movie</h3>
          <div className="mb-4">
            <StarRating
              rating={userRating}
              onRatingChange={setUserRating}
              size="lg"
            />
          </div>
          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            placeholder="Write a review (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
          {success && <p className="text-green-600 mt-2">Rating submitted successfully!</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      )}

      {/* Recent Ratings */}
      {ratings && ratings.results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Reviews</h3>
          <div className="space-y-4">
            {ratings.results.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{rating.user.firstName} {rating.user.lastName}</div>
                    <div className="text-sm text-gray-500">@{rating.user.username}</div>
                  </div>
                  <StarRating rating={rating.rating} readonly size="sm" />
                </div>
                {rating.review && (
                  <p className="text-gray-700">{rating.review}</p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
