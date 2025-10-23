import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '../../generated/prisma';
import { PrismaMovieRepository, CreateMovieData } from '../../src/repositories/movieRepository';

const prisma = new PrismaClient();

describe('MovieRepository', () => {
  let movieRepository: PrismaMovieRepository;

  beforeEach(async () => {
    // Clean up movies before each test
    await prisma.movie.deleteMany();

    // Create repository instance
    movieRepository = new PrismaMovieRepository(prisma);
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.movie.deleteMany();
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const movieData: CreateMovieData = {
        id: 550, // TMDb ID
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        releaseDate: '1999-10-15',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        voteAverage: 8.4
      };

      const movie = await movieRepository.create(movieData);

      expect(movie.id).toBe(550);
      expect(movie.title).toBe('Fight Club');
      expect(movie.voteAverage).toBe(8.4);
      expect(movie.createdAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find movie by TMDb ID', async () => {
      // First create a movie
      const movieData: CreateMovieData = {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        releaseDate: '1999-10-15',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        voteAverage: 8.4
      };

      await movieRepository.create(movieData);

      // Now find it
      const movie = await movieRepository.findById(550);

      expect(movie).toBeDefined();
      expect(movie?.title).toBe('Fight Club');
    });

    it('should return null for non-existent movie', async () => {
      const movie = await movieRepository.findById(999999);
      expect(movie).toBeNull();
    });
  });

  describe('search', () => {
    it('should search movies by title', async () => {
      // Create test movies
      await movieRepository.create({
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        releaseDate: '1999-10-15',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        voteAverage: 8.4
      });

      await movieRepository.create({
        id: 13,
        title: 'Forrest Gump',
        overview: 'A man with a low IQ...',
        releaseDate: '1994-06-23',
        posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        voteAverage: 8.8
      });

      // Search for "Fight"
      const results = await movieRepository.search('Fight');

      // Expect at least one result (might be more due to test data)
      expect(results.length).toBeGreaterThan(0);
      // Check if our specifically created movie is in the results
      expect(results.some(movie => movie.title === 'Fight Club')).toBe(true);
    });
  });
});