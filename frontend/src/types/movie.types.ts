/**
 * Movie Types
 *
 * Type definitions for movie-related data structures.
 */

/**
 * Movie object returned from API
 */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  voteAverage: number;
}

/**
 * Paginated response for movie searches
 */
export interface PaginatedMovies {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

/**
 * Search parameters for movie search endpoint
 */
export interface MovieSearchParams {
  q: string;
  page?: number;
}

/**
 * Movie details with extended information
 * For future implementation of movie details page
 */
export interface MovieDetails extends Movie {
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  productionCompanies?: Array<{ id: number; name: string; logo_path?: string }>;
  voteCount?: number;
  backdropPath?: string | null;
}

/**
 * Watchlist item - movie with addedAt timestamp
 */
export interface WatchlistItem extends Movie {
  addedAt: string; // ISO date string
}

/**
 * Paginated response for watchlist
 */
export interface PaginatedWatchlist {
  page: number;
  results: WatchlistItem[];
  limit: number;
  total: number;
}

/**
 * Request payload for adding to watchlist
 */
export interface AddToWatchlistRequest {
  movieId: number;
}