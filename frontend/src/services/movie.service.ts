/**
 * Movie Service
 *
 * Handles API calls related to movies using the centralized API client.
 */
import api from '@/lib/api-client';
import type { Movie, PaginatedMovies, MovieSearchParams, MovieDetails } from '@/types/movie.types';

export const movieService = {
  /**
   * Search movies
   * GET /api/movies/search
   */
  async searchMovies(params: MovieSearchParams): Promise<PaginatedMovies> {
    return api.get<PaginatedMovies>('/api/movies/search', {
      params: {
        q: params.q,
        page: params.page || 1
      }
    });
  },

  /**
   * Get popular movies (placeholder for future implementation)
   * GET /api/movies/popular
   */
  async getPopularMovies(page: number = 1): Promise<PaginatedMovies> {
    // This endpoint doesn't exist yet, but it's good to plan ahead
    try {
      return api.get<PaginatedMovies>('/api/movies/popular', {
        params: { page }
      });
    } catch (error) {
      // Fallback to search with empty query if endpoint doesn't exist yet
      return api.get<PaginatedMovies>('/api/movies/search', {
        params: { q: 'popular', page }
      });
    }
  },

  /**
   * Get movie details by ID (placeholder for future implementation)
   * GET /api/movies/:id
   */
  async getMovieById(id: number): Promise<MovieDetails> {
    return api.get<MovieDetails>(`/api/movies/${id}`);
  }
};

export default movieService;