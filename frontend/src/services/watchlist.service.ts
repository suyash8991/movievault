/**
 * Watchlist Service
 *
 * Handles API calls related to user watchlist using the centralized API client.
 * All endpoints require authentication.
 */
import api from '@/lib/api-client';
import type { PaginatedWatchlist, AddToWatchlistRequest } from '@/types/movie.types';

export const watchlistService = {
  /**
   * Get user's watchlist
   * GET /api/users/watchlist
   */
  async getWatchlist(page: number = 1, limit: number = 20): Promise<PaginatedWatchlist> {
    return api.get<PaginatedWatchlist>('/api/users/watchlist', {
      params: { page, limit }
    });
  },

  /**
   * Add a movie to watchlist
   * POST /api/users/watchlist
   */
  async addToWatchlist(movieId: number): Promise<void> {
    const payload: AddToWatchlistRequest = { movieId };
    await api.post('/api/users/watchlist', payload);
  },

  /**
   * Remove a movie from watchlist
   * DELETE /api/users/watchlist/:movieId
   */
  async removeFromWatchlist(movieId: number): Promise<void> {
    await api.delete(`/api/users/watchlist/${movieId}`);
  },

  /**
   * Check if a movie is in the user's watchlist
   * This is a helper method that fetches the watchlist and checks if the movie exists
   */
  async isInWatchlist(movieId: number): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist(1, 100); // Get first 100 items
      return watchlist.results.some(item => item.id === movieId);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      return false;
    }
  }
};

export default watchlistService;
