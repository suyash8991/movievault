import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Clean up database before/after each test
beforeEach(async () => {
  await prisma.movie.deleteMany();
  // Note: Don't clean users here to avoid interfering with auth tests
});

afterEach(async () => {
  await prisma.movie.deleteMany();
  // Note: Don't clean users here to avoid interfering with auth tests
});

describe('Movie API Endpoints', () => {
  describe('GET /api/movies/search', () => {
    it('should search movies with query parameter and return paginated results', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({
          q: 'fight club',
          page: 1
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.total_pages).toBeDefined();
      expect(response.body.total_results).toBeDefined();

      // Check movie structure if results exist
      if (response.body.results.length > 0) {
        const movie = response.body.results[0];
        expect(movie.id).toBeDefined();
        expect(movie.title).toBeDefined();
        expect(movie.overview).toBeDefined();
        expect(movie.releaseDate).toBeDefined();
        expect(movie.voteAverage).toBeDefined();
      }
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('q');
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ q: '' })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Query parameter is required');
    });

    it('should handle pagination with page parameter', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({
          q: 'movie',
          page: 2
        })
        .expect(200);

      expect(response.body.page).toBe(2);
    });

    it('should default to page 1 when page parameter is not provided', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ q: 'movie' })
        .expect(200);

      expect(response.body.page).toBe(1);
    });

    it('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({
          q: 'movie',
          page: 'invalid'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('page');
    });

    it('should handle TMDb API errors gracefully', async () => {
      // This test will simulate network/API errors
      const response = await request(app)
        .get('/api/movies/search')
        .query({
          q: 'test-query-that-might-fail',
          page: 1
        });

      // Should either return 200 with results or handle errors gracefully
      if (response.status !== 200) {
        expect([500, 503, 429]).toContain(response.status); // Common API error codes
        expect(response.body.error).toBeDefined();
      }
    });

    it('should return consistent response format for empty results', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({
          q: 'xyznonexistentmovie123456789',
          page: 1
        })
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.page).toBe(1);
      expect(response.body.total_pages).toBeDefined();
      expect(response.body.total_results).toBe(0);
    });
  });

  // 🔴 RED PHASE: Movie Details Endpoint Tests
  describe('GET /api/movies/:id', () => {
    it('should return movie details for valid ID', async () => {
      const movieId = 550; // Fight Club (TMDb ID)

      const response = await request(app)
        .get(`/api/movies/${movieId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(movieId);
      expect(response.body.title).toBeDefined();
      expect(response.body.overview).toBeDefined();
      expect(response.body.releaseDate).toBeDefined();
      expect(response.body.posterPath).toBeDefined();
      expect(response.body.voteAverage).toBeDefined();

      // Extended movie details fields
      expect(response.body.genres).toBeDefined();
      expect(Array.isArray(response.body.genres)).toBe(true);
      expect(response.body.runtime).toBeDefined();
      expect(response.body.tagline).toBeDefined();
      expect(response.body.budget).toBeDefined();
      expect(response.body.revenue).toBeDefined();
      expect(response.body.productionCompanies).toBeDefined();
      expect(Array.isArray(response.body.productionCompanies)).toBe(true);
    });

    it('should return 404 for non-existent movie', async () => {
      const nonExistentId = 9999999; // Assuming this ID doesn't exist

      const response = await request(app)
        .get(`/api/movies/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Movie not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/movies/invalid-id')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('ID');
    });

    it('should handle TMDb API errors gracefully', async () => {
      // Use a random ID that might trigger an API error
      const response = await request(app)
        .get('/api/movies/123456');

      // Should either return 200 with results or handle errors with proper status codes
      if (response.status !== 200) {
        expect([404, 500, 503, 429]).toContain(response.status);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  // 🔴 RED PHASE: Similar Movies Endpoint Tests
  describe('GET /api/movies/:id/similar', () => {
    it('should return similar movies for valid movie ID', async () => {
      const movieId = 550; // Fight Club

      const response = await request(app)
        .get(`/api/movies/${movieId}/similar`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.total_pages).toBeDefined();
      expect(response.body.total_results).toBeDefined();

      // If there are results, check their structure
      if (response.body.results.length > 0) {
        const movie = response.body.results[0];
        expect(movie.id).toBeDefined();
        expect(movie.title).toBeDefined();
        expect(movie.overview).toBeDefined();
        expect(movie.releaseDate).toBeDefined();
        expect(movie.voteAverage).toBeDefined();
      }
    });

    it('should return 404 when reference movie does not exist', async () => {
      const nonExistentId = 9999999;

      const response = await request(app)
        .get(`/api/movies/${nonExistentId}/similar`)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Movie not found');
    });

    it('should handle pagination with page parameter', async () => {
      const movieId = 550;

      const response = await request(app)
        .get(`/api/movies/${movieId}/similar`)
        .query({ page: 2 })
        .expect(200);

      expect(response.body.page).toBe(2);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/movies/invalid-id/similar')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('ID');
    });

    it('should handle TMDb API errors gracefully', async () => {
      const response = await request(app)
        .get('/api/movies/123456/similar');

      // Should either return 200 with results or handle errors properly
      if (response.status !== 200) {
        expect([404, 500, 503, 429]).toContain(response.status);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  // 🔴 RED PHASE: Popular Movies Endpoint Tests
  describe('GET /api/movies/popular', () => {
    it('should return popular movies with default pagination', async () => {
      const response = await request(app)
        .get('/api/movies/popular')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.total_pages).toBeDefined();
      expect(response.body.total_results).toBeDefined();

      // Check movie structure if results exist
      if (response.body.results.length > 0) {
        const movie = response.body.results[0];
        expect(movie.id).toBeDefined();
        expect(movie.title).toBeDefined();
        expect(movie.overview).toBeDefined();
        expect(movie.releaseDate).toBeDefined();
        expect(movie.voteAverage).toBeDefined();
      }
    });

    it('should handle pagination with page parameter', async () => {
      const response = await request(app)
        .get('/api/movies/popular')
        .query({ page: 2 })
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/movies/popular')
        .query({ page: 'invalid' })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('page');
    });

    it('should return 400 for negative page number', async () => {
      const response = await request(app)
        .get('/api/movies/popular')
        .query({ page: -1 })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle TMDb API errors gracefully', async () => {
      // This test verifies error handling
      const response = await request(app)
        .get('/api/movies/popular')
        .query({ page: 1 });

      // Should either return 200 with results or handle errors with proper status codes
      if (response.status !== 200) {
        expect([500, 503, 429]).toContain(response.status);
        expect(response.body.error).toBeDefined();
      }
    });
  });
});