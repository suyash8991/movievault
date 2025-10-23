export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  runtime?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{ id: number; name: string; logo_path?: string }>;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
}

export class TmdbService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchMovies(query: string, page: number = 1): Promise<TmdbSearchResponse> {
    try {
      const url = this.buildUrl('search/movie', {
        query: query,
        page: page.toString()
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json() as TmdbSearchResponse;
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw our custom errors
      }
      throw new Error(`TMDb API network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMovieDetails(movieId: number): Promise<TmdbMovie> {
    try {
      const url = this.buildUrl(`movie/${movieId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json() as TmdbMovie;
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw our custom errors
      }
      throw new Error(`TMDb API network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPopularMovies(page: number = 1): Promise<TmdbSearchResponse> {
    try {
      const url = this.buildUrl('movie/popular', {
        page: page.toString()
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json() as TmdbSearchResponse;
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw our custom errors
      }
      throw new Error(`TMDb API network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSimilarMovies(movieId: number, page: number = 1): Promise<TmdbSearchResponse> {
    try {
      const url = this.buildUrl(`movie/${movieId}/similar`, {
        page: page.toString()
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json() as TmdbSearchResponse;
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        throw error; // Re-throw our custom errors
      }
      throw new Error(`TMDb API network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    // Add API key
    url.searchParams.append('api_key', this.apiKey);

    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = 'Unknown API error';

    try {
      const errorData = await response.json() as TmdbErrorResponse;
      errorMessage = errorData.status_message || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }

    switch (response.status) {
      case 401:
        throw new Error(`TMDb API authentication failed: ${errorMessage}`);
      case 404:
        throw new Error('Movie not found');
      case 429:
        throw new Error('TMDb API rate limit exceeded');
      default:
        throw new Error(`TMDb API error (${response.status}): ${errorMessage}`);
    }
  }
}