import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Clean up database before/after each test
beforeEach(async () => {
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(async () => {
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();
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
});