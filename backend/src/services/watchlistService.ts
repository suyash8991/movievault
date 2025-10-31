import { WatchlistRepository, WatchlistItem, PaginatedWatchlist, PaginationOptions } from '../repositories/watchlistRepository';
import { MovieRepository, CreateMovieData } from '../repositories/movieRepository';
import { TmdbService } from './tmdbService';

export class WatchlistService {
  constructor(
    private watchlistRepository: WatchlistRepository,
    private movieRepository: MovieRepository,
    private tmdbService: TmdbService
  ) {}

  /**
   * Add a movie to user's watchlist
   * - Verifies movie exists in TMDb
   * - Caches movie in local database if not already cached
   * - Prevents duplicate entries
   */
  async addToWatchlist(userId: string, movieId: number): Promise<WatchlistItem> {
    // Check if already in watchlist
    const existingItem = await this.watchlistRepository.findByUserIdAndMovieId(userId, movieId);
    if (existingItem) {
      const error = new Error('Movie is already in watchlist');
      (error as any).code = 'DUPLICATE_ENTRY';
      throw error;
    }

    // Verify movie exists in TMDb and cache it
    try {
      const tmdbMovie = await this.tmdbService.getMovieDetails(movieId);

      // Cache the movie in our database if not already cached
      const cachedMovie = await this.movieRepository.findById(movieId);
      if (!cachedMovie) {
        const movieData: CreateMovieData = {
          id: tmdbMovie.id,
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date,
          posterPath: tmdbMovie.poster_path || undefined,
          voteAverage: tmdbMovie.vote_average
        };
        await this.movieRepository.create(movieData);
      }
    } catch (error) {
      // If movie not found in TMDb, throw appropriate error
      if (error instanceof Error) {
        // Check for "Movie not found" in the error message
        if (error.message.includes('Movie not found')) {
          throw new Error('Movie not found');
        }
      }
      // Re-throw TMDb API errors as-is
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error;
      }
      // Re-throw other errors
      throw new Error(`Failed to verify movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Add to watchlist
    const watchlistItem = await this.watchlistRepository.add(userId, movieId);
    return watchlistItem;
  }

  /**
   * Get user's watchlist with movie details and pagination
   */
  async getWatchlist(userId: string, options?: PaginationOptions): Promise<any> {
    const watchlist = await this.watchlistRepository.findByUserId(userId, options);

    // Transform the nested structure to flatten movie properties
    const transformedResults = watchlist.results.map(item => ({
      id: item.movie.id,
      title: item.movie.title,
      overview: item.movie.overview,
      posterPath: item.movie.posterPath,
      voteAverage: item.movie.voteAverage,
      releaseDate: item.movie.releaseDate,
      addedAt: item.addedAt
    }));

    return {
      results: transformedResults,
      page: watchlist.page,
      limit: watchlist.limit,
      total: watchlist.total
    };
  }

  /**
   * Remove a movie from user's watchlist
   * - Verifies the item exists in the user's watchlist before removing
   */
  async removeFromWatchlist(userId: string, movieId: number): Promise<void> {
    // Check if movie is in user's watchlist
    const existingItem = await this.watchlistRepository.findByUserIdAndMovieId(userId, movieId);
    if (!existingItem) {
      const error = new Error('Movie not found in watchlist');
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    // Remove from watchlist
    await this.watchlistRepository.remove(userId, movieId);
  }
}
