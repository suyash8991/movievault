/**
 * Movie Service
 *
 * Handles API calls related to movies using the centralized API client.
 */
import api from '@/lib/api-client';
import type { PaginatedMovies, MovieSearchParams, MovieDetails } from '@/types/movie.types';

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
   * Get popular movies
   * GET /api/movies/popular
   */
  async getPopularMovies(page: number = 1): Promise<PaginatedMovies> {
    return api.get<PaginatedMovies>('/api/movies/popular', {
      params: { page }
    });
  },

  /**
   * Get movie details by ID
   * GET /api/movies/:id
   */
  async getMovieById(id: number): Promise<MovieDetails> {
    return api.get<MovieDetails>(`/api/movies/${id}`);
  },

  /**
   * Get similar movies based on a movie ID
   * GET /api/movies/:id/similar
   */
  async getSimilarMovies(id: number, page: number = 1): Promise<PaginatedMovies> {
    return api.get<PaginatedMovies>(`/api/movies/${id}/similar`, {
      params: { page }
    });
  }
};

export default movieService;