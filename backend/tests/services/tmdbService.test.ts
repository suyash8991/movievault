import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TmdbService } from '../../src/services/tmdbService';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('TmdbService', () => {
  let tmdbService: TmdbService;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create service instance with test API key
    tmdbService = new TmdbService(mockApiKey);
  });

  describe('searchMovies', () => {
    it('should return search results for valid query', async () => {
      // Mock successful TMDb API response
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 550,
            title: 'Fight Club',
            overview: 'A ticking-time-bomb insomniac...',
            release_date: '1999-10-15',
            poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            vote_average: 8.433,
            genre_ids: [18, 53]
          }
        ],
        total_pages: 1,
        total_results: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      } as Response);

      const result = await tmdbService.searchMovies('Fight Club');

      expect(result).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Fight Club');
      expect(result.results[0].id).toBe(550);

      // Verify API call was made correctly
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search/movie'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle empty search results', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      } as Response);

      const result = await tmdbService.searchMovies('NonexistentMovie123');

      expect(result.results).toHaveLength(0);
      expect(result.total_results).toBe(0);
    });

    it('should throw error for invalid API key (401)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          status_code: 7,
          status_message: 'Invalid API key'
        })
      } as Response);

      await expect(tmdbService.searchMovies('Fight Club'))
        .rejects
        .toThrow('TMDb API authentication failed: Invalid API key');
    });

    it('should throw error for rate limiting (429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          status_code: 25,
          status_message: 'Your request count (40) is over the allowed limit of 40'
        })
      } as Response);

      await expect(tmdbService.searchMovies('Fight Club'))
        .rejects
        .toThrow('TMDb API rate limit exceeded');
    });

    it('should throw error for network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(tmdbService.searchMovies('Fight Club'))
        .rejects
        .toThrow('TMDb API network error: Network error');
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details for valid movie ID', async () => {
      const mockResponse = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        release_date: '1999-10-15',
        runtime: 139,
        genres: [
          { id: 18, name: 'Drama' },
          { id: 53, name: 'Thriller' }
        ],
        production_companies: [
          { id: 508, name: '20th Century Fox' }
        ],
        vote_average: 8.433,
        vote_count: 26280
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      } as Response);

      const result = await tmdbService.getMovieDetails(550);

      expect(result).toBeDefined();
      expect(result.id).toBe(550);
      expect(result.title).toBe('Fight Club');
      expect(result.runtime).toBe(139);
      expect(result.genres).toHaveLength(2);

      // Verify correct API endpoint was called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('movie/550'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should throw error for non-existent movie (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_code: 34,
          status_message: 'The resource you requested could not be found.'
        })
      } as Response);

      await expect(tmdbService.getMovieDetails(999999))
        .rejects
        .toThrow('Movie not found');
    });
  });

  describe('getPopularMovies', () => {
    it('should return popular movies with pagination', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 1011985,
            title: 'Kung Fu Panda 4',
            overview: 'Po is gearing up...',
            release_date: '2024-03-02',
            vote_average: 7.1
          },
          {
            id: 653346,
            title: 'Kingdom of the Planet of the Apes',
            overview: 'Several generations...',
            release_date: '2024-05-08',
            vote_average: 6.9
          }
        ],
        total_pages: 500,
        total_results: 10000
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      } as Response);

      const result = await tmdbService.getPopularMovies(1);

      expect(result.results).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(500);

      // Verify correct endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('movie/popular'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('API URL construction', () => {
    it('should construct correct search URL with query and page', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
        status: 200
      } as Response);

      await tmdbService.searchMovies('Fight Club', 2);

      const expectedUrl = expect.stringMatching(
        /.*search\/movie.*api_key=test-api-key-123.*query=Fight\+Club.*page=2/
      );
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });
});