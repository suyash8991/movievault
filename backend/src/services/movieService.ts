import { TmdbService, TmdbMovie, TmdbSearchResponse } from './tmdbService';
import { MovieRepository, CreateMovieData } from '../repositories/movieRepository';

export interface MovieSearchResult {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  voteAverage: number;
}

export interface PaginatedMovieSearchResponse {
  page: number;
  results: MovieSearchResult[];
  total_pages: number;
  total_results: number;
}

export class MovieService {
  constructor(
    private tmdbService: TmdbService,
    private movieRepository: MovieRepository
  ) {}

  async searchMovies(query: string, page: number = 1): Promise<PaginatedMovieSearchResponse> {
    try {
      // Search TMDb for movies
      const tmdbResponse = await this.tmdbService.searchMovies(query, page);

      // Transform TMDb results to our format
      const results: MovieSearchResult[] = tmdbResponse.results.map(this.transformTmdbMovie);

      // Cache movies in database (upsert pattern)
      for (const tmdbMovie of tmdbResponse.results) {
        await this.cacheMovieIfNotExists(tmdbMovie);
      }

      return {
        page: tmdbResponse.page,
        results,
        total_pages: tmdbResponse.total_pages,
        total_results: tmdbResponse.total_results
      };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw TMDb errors as-is
      }
      throw new Error(`Movie search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformTmdbMovie(tmdbMovie: TmdbMovie): MovieSearchResult {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      releaseDate: tmdbMovie.release_date,
      posterPath: tmdbMovie.poster_path,
      voteAverage: tmdbMovie.vote_average
    };
  }

  private async cacheMovieIfNotExists(tmdbMovie: TmdbMovie): Promise<void> {
    try {
      // Check if movie already exists in our database
      const existingMovie = await this.movieRepository.findById(tmdbMovie.id);

      if (!existingMovie) {
        // Cache the movie in our database
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
      // Log but don't fail the search if caching fails
      console.warn(`Failed to cache movie ${tmdbMovie.id}:`, error);
    }
  }
}