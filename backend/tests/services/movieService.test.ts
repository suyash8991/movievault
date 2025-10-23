import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MovieService } from '../../src/services/movieService';
import { TmdbService } from '../../src/services/tmdbService';
import { MovieRepository } from '../../src/repositories/movieRepository';

// Create mock implementations
const mockTmdbService = {
  searchMovies: jest.fn(),
  getMovieDetails: jest.fn(),
  getPopularMovies: jest.fn(),
  getSimilarMovies: jest.fn()
} as unknown as jest.Mocked<TmdbService>;

const mockMovieRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  search: jest.fn()
} as unknown as jest.Mocked<MovieRepository>;

describe('MovieService', () => {
  let movieService: MovieService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create service instance with mocked dependencies
    movieService = new MovieService(mockTmdbService, mockMovieRepository);
  });

  // Existing functionality tests can go here (searchMovies, etc.)

  // 🔴 RED PHASE: Movie Details Tests
  describe('getMovieById', () => {
    it('should return movie details from TMDb API', async () => {
      // Mock movie not in cache
      mockMovieRepository.findById.mockResolvedValueOnce(null);

      // Mock TMDb API response
      const mockTmdbMovie = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        release_date: '1999-10-15',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdrop_path: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
        vote_average: 8.4,
        vote_count: 26280,
        runtime: 139,
        tagline: 'Mischief. Mayhem. Soap.',
        budget: 63000000,
        revenue: 100853753,
        genres: [
          { id: 18, name: 'Drama' },
          { id: 53, name: 'Thriller' }
        ],
        production_companies: [
          { id: 508, name: '20th Century Fox' }
        ]
      };

      mockTmdbService.getMovieDetails.mockResolvedValueOnce(mockTmdbMovie);

      const result = await movieService.getMovieById(550);

      // Verify TMDb service was called
      expect(mockTmdbService.getMovieDetails).toHaveBeenCalledWith(550);

      // Verify result structure
      expect(result.id).toBe(550);
      expect(result.title).toBe('Fight Club');
      expect(result.overview).toBe('A ticking-time-bomb insomniac...');
      expect(result.releaseDate).toBe('1999-10-15');
      expect(result.posterPath).toBe('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
      expect(result.backdropPath).toBe('/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg');
      expect(result.voteAverage).toBe(8.4);
      expect(result.voteCount).toBe(26280);
      expect(result.runtime).toBe(139);
      expect(result.tagline).toBe('Mischief. Mayhem. Soap.');
      expect(result.budget).toBe(63000000);
      expect(result.revenue).toBe(100853753);
      expect(result.genres).toEqual([
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' }
      ]);
      expect(result.productionCompanies).toEqual([
        { id: 508, name: '20th Century Fox' }
      ]);
    });

    it('should check repository cache before calling TMDb API', async () => {
      // Mock movie exists in cache
      const cachedMovie = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        releaseDate: '1999-10-15',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        voteAverage: 8.4,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockMovieRepository.findById.mockResolvedValueOnce(cachedMovie);

      // Even with cached data, we still need to get full details from TMDb
      const mockTmdbMovie = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        release_date: '1999-10-15',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        vote_average: 8.4,
        genres: [{ id: 18, name: 'Drama' }]
      };
      mockTmdbService.getMovieDetails.mockResolvedValueOnce(mockTmdbMovie);

      await movieService.getMovieById(550);

      // Verify repository was checked first
      expect(mockMovieRepository.findById).toHaveBeenCalledWith(550);
      expect(mockMovieRepository.findById).toHaveBeenCalledTimes(1);

      // Verify TMDb service was called to get full details
      expect(mockTmdbService.getMovieDetails).toHaveBeenCalledWith(550);
      expect(mockTmdbService.getMovieDetails).toHaveBeenCalledTimes(1);
    });

    it('should propagate TMDb errors', async () => {
      mockMovieRepository.findById.mockResolvedValueOnce(null);
      mockTmdbService.getMovieDetails.mockRejectedValueOnce(new Error('Movie not found'));

      await expect(movieService.getMovieById(9999999))
        .rejects
        .toThrow('Movie not found');
    });
  });

  // 🔴 RED PHASE: Similar Movies Tests
  describe('getSimilarMovies', () => {
    it('should return similar movies from TMDb API', async () => {
      // Mock TMDb API response
      const mockTmdbResponse = {
        page: 1,
        results: [
          {
            id: 807,
            title: 'Se7en',
            overview: 'Two homicide detectives...',
            release_date: '1995-09-22',
            poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
            vote_average: 8.3
          },
          {
            id: 63,
            title: 'Twelve Monkeys',
            overview: 'In the year 2035...',
            release_date: '1995-12-29',
            poster_path: '/6Sj9wDu3YugthXsU0Vry5XFAZGg.jpg',
            vote_average: 7.5
          }
        ],
        total_pages: 10,
        total_results: 192
      };

      mockTmdbService.getSimilarMovies.mockResolvedValueOnce(mockTmdbResponse);

      const result = await movieService.getSimilarMovies(550, 1);

      // Verify TMDb service was called
      expect(mockTmdbService.getSimilarMovies).toHaveBeenCalledWith(550, 1);

      // Verify result structure
      expect(result.page).toBe(1);
      expect(result.results).toHaveLength(2);
      expect(result.total_pages).toBe(10);
      expect(result.total_results).toBe(192);

      // Check transformed movie data
      expect(result.results[0].id).toBe(807);
      expect(result.results[0].title).toBe('Se7en');
      expect(result.results[0].releaseDate).toBe('1995-09-22');
    });

    it('should handle pagination for similar movies', async () => {
      const mockTmdbResponse = {
        page: 2,
        results: [],
        total_pages: 10,
        total_results: 192
      };

      mockTmdbService.getSimilarMovies.mockResolvedValueOnce(mockTmdbResponse);

      const result = await movieService.getSimilarMovies(550, 2);

      // Verify correct page parameter is passed
      expect(mockTmdbService.getSimilarMovies).toHaveBeenCalledWith(550, 2);
      expect(result.page).toBe(2);
    });

    it('should attempt to cache similar movies in the database', async () => {
      // Mock TMDb API response with a single movie for simplicity
      const mockTmdbResponse = {
        page: 1,
        results: [
          {
            id: 807,
            title: 'Se7en',
            overview: 'Two homicide detectives...',
            release_date: '1995-09-22',
            poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
            vote_average: 8.3
          }
        ],
        total_pages: 10,
        total_results: 192
      };

      // Mock existing movie check to return null (movie not in cache)
      mockMovieRepository.findById.mockResolvedValueOnce(null);

      // Mock TMDb API response
      mockTmdbService.getSimilarMovies.mockResolvedValueOnce(mockTmdbResponse);

      await movieService.getSimilarMovies(550, 1);

      // Verify similar movies are checked against the repository
      expect(mockMovieRepository.findById).toHaveBeenCalledWith(807);
    });

    it('should propagate TMDb errors', async () => {
      mockTmdbService.getSimilarMovies.mockRejectedValueOnce(new Error('Movie not found'));

      await expect(movieService.getSimilarMovies(9999999))
        .rejects
        .toThrow('Movie not found');
    });
  });
});