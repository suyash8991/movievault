import { RatingRepository, Rating, PaginatedRatings, PaginatedUserRatings, PaginationOptions } from '../repositories/ratingRepository';
import { MovieRepository, CreateMovieData } from '../repositories/movieRepository';
import { TmdbService } from './tmdbService';

export class RatingService {
  constructor(
    private ratingRepository: RatingRepository,
    private movieRepository: MovieRepository,
    private tmdbService: TmdbService
  ) {}

  /**
   * Create or update a rating for a movie
   * - Verifies movie exists in TMDb
   * - Caches movie in local database if not already cached
   * - Upserts the rating (creates or updates)
   */
  async upsertRating(userId: string, movieId: number, rating: number, review?: string): Promise<{ rating: Rating; isNew: boolean }> {
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
        if (error.message.includes('Movie not found')) {
          throw new Error('Movie not found');
        }
      }
      // Re-throw TMDb API errors as-is
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error;
      }
      throw error;
    }

    // Check if rating already exists (for determining status code)
    const existingRating = await this.ratingRepository.findByUserIdAndMovieId(userId, movieId);
    const isNew = !existingRating;

    // Upsert the rating
    const upsertedRating = await this.ratingRepository.upsert({
      userId,
      movieId,
      rating,
      review
    });

    return { rating: upsertedRating, isNew };
  }

  /**
   * Get all ratings for a specific movie with pagination
   */
  async getRatingsByMovieId(movieId: number, options?: PaginationOptions): Promise<PaginatedRatings> {
    const ratings = await this.ratingRepository.findByMovieId(movieId, options);
    return ratings;
  }

  /**
   * Get all ratings by a specific user with pagination
   */
  async getRatingsByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedUserRatings> {
    const ratings = await this.ratingRepository.findByUserId(userId, options);
    return ratings;
  }

  /**
   * Delete a user's rating for a movie
   * - Verifies the rating exists before deleting
   */
  async deleteRating(userId: string, movieId: number): Promise<void> {
    // Check if rating exists
    const existingRating = await this.ratingRepository.findByUserIdAndMovieId(userId, movieId);
    if (!existingRating) {
      const error = new Error('Rating not found');
      (error as any).code = 'NOT_FOUND';
      throw error;
    }

    // Delete the rating
    await this.ratingRepository.delete(userId, movieId);
  }
}
