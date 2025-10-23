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

export interface MovieDetails extends MovieSearchResult {
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  productionCompanies?: Array<{ id: number; name: string; logo_path?: string }>;
  voteCount?: number;
  backdropPath?: string | null;
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

  async getMovieById(id: number): Promise<MovieDetails> {
    try {
      // First check if the movie exists in our database
      const cachedMovie = await this.movieRepository.findById(id);

      // Get full details from TMDb API
      const tmdbMovie = await this.tmdbService.getMovieDetails(id);

      // Transform TMDb movie details to our format
      return this.transformTmdbMovieDetails(tmdbMovie);
    } catch (error) {
      if (error instanceof Error && error.message === 'Movie not found') {
        throw error; // Re-throw not found error
      }
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw TMDb errors as-is
      }
      throw new Error(`Failed to get movie details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSimilarMovies(movieId: number, page: number = 1): Promise<PaginatedMovieSearchResponse> {
    try {
      // Get similar movies from TMDb API
      const tmdbResponse = await this.tmdbService.getSimilarMovies(movieId, page);

      // Transform TMDb results to our format
      const results: MovieSearchResult[] = tmdbResponse.results.map(this.transformTmdbMovie);

      // Cache movies in database (non-blocking)
      Promise.all(tmdbResponse.results.map(movie => this.cacheMovieIfNotExists(movie)))
        .catch(error => console.warn('Error caching similar movies:', error));

      return {
        page: tmdbResponse.page,
        results,
        total_pages: tmdbResponse.total_pages,
        total_results: tmdbResponse.total_results
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Movie not found') {
        throw error; // Re-throw not found error
      }
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw TMDb errors as-is
      }
      throw new Error(`Failed to get similar movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformTmdbMovieDetails(tmdbMovie: TmdbMovie): MovieDetails {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      releaseDate: tmdbMovie.release_date,
      posterPath: tmdbMovie.poster_path,
      voteAverage: tmdbMovie.vote_average,
      genres: tmdbMovie.genres,
      runtime: tmdbMovie.runtime,
      tagline: tmdbMovie.tagline,
      budget: tmdbMovie.budget,
      revenue: tmdbMovie.revenue,
      productionCompanies: tmdbMovie.production_companies,
      voteCount: tmdbMovie.vote_count,
      backdropPath: tmdbMovie.backdrop_path,
    };
  }
}