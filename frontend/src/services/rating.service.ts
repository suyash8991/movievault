/**
 * Rating Service
 *
 * Handles API calls related to movie ratings and reviews using the centralized API client.
 */
import api from '@/lib/api-client';
import type {
  PaginatedMovieRatings,
  PaginatedUserRatings,
  CreateRatingRequest
} from '@/types/movie.types';

export const ratingService = {
  /**
   * Create or update a rating for a movie
   * POST /api/movies/:movieId/ratings
   * Requires authentication
   */
  async upsertRating(movieId: number, data: CreateRatingRequest): Promise<void> {
    await api.post(`/api/movies/${movieId}/ratings`, data);
  },

  /**
   * Get all ratings for a specific movie
   * GET /api/movies/:movieId/ratings
   * Public endpoint
   */
  async getMovieRatings(movieId: number, page: number = 1, limit: number = 20): Promise<PaginatedMovieRatings> {
    return api.get<PaginatedMovieRatings>(`/api/movies/${movieId}/ratings`, {
      params: { page, limit }
    });
  },

  /**
   * Get authenticated user's ratings
   * GET /api/users/ratings
   * Requires authentication
   */
  async getUserRatings(page: number = 1, limit: number = 20): Promise<PaginatedUserRatings> {
    return api.get<PaginatedUserRatings>('/api/users/ratings', {
      params: { page, limit }
    });
  },

  /**
   * Delete user's rating for a movie
   * DELETE /api/movies/:movieId/ratings
   * Requires authentication
   */
  async deleteRating(movieId: number): Promise<void> {
    await api.delete(`/api/movies/${movieId}/ratings`);
  }
};

export default ratingService;
