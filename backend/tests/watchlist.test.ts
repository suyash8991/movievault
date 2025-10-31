import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Watchlist Endpoints Test Suite
 *
 * Testing the user watchlist functionality:
 * - POST /api/users/watchlist - Add movie to watchlist
 * - GET /api/users/watchlist - Get user's watchlist
 * - DELETE /api/users/watchlist/:movieId - Remove movie from watchlist
 */

describe('Watchlist Endpoints', () => {
  let authToken: string;
  let userId: string;
  const testUser = {
    email: 'watchlist@test.com',
    username: 'watchlistuser',
    password: 'Test123!@#',
    firstName: 'Watchlist',
    lastName: 'User'
  };

  // Setup: Create a test user and authenticate
  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: {
        email: testUser.email
      }
    });

    // Register test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up test data
    await prisma.watchlist.deleteMany({
      where: { userId }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  // Clean up watchlist entries between tests
  afterEach(async () => {
    await prisma.watchlist.deleteMany({
      where: { userId }
    });
  });

  /**
   * POST /api/users/watchlist
   * Add a movie to the user's watchlist
   */
  describe('POST /api/users/watchlist', () => {
    it('should add a movie to the watchlist with valid movieId and auth token', async () => {
      const movieId = 550; // Fight Club

      const response = await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.movieId).toBe(movieId);
      expect(response.body.userId).toBe(userId);
      expect(response.body).toHaveProperty('addedAt');
    });

    it('should return 401 when no auth token is provided', async () => {
      const movieId = 550;

      const response = await request(app)
        .post('/api/users/watchlist')
        .send({ movieId })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when movieId is missing', async () => {
      const response = await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toContain('movieId');
    });

    it('should return 400 when movieId is not a number', async () => {
      const response = await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: 'invalid' })
        .expect(400);

      expect(response.body.error).toContain('movieId');
    });

    it('should return 409 when trying to add the same movie twice', async () => {
      const movieId = 550;

      // Add movie first time
      await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId })
        .expect(201);

      // Try to add the same movie again
      const response = await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId })
        .expect(409);

      expect(response.body.error).toContain('already in watchlist');
    });

    it('should return 404 when movie does not exist in TMDb', async () => {
      const movieId = 999999999; // Non-existent movie ID

      const response = await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId })
        .expect(404);

      expect(response.body.error).toContain('Movie not found');
    });
  });

  /**
   * GET /api/users/watchlist
   * Get the user's watchlist
   */
  describe('GET /api/users/watchlist', () => {
    beforeEach(async () => {
      // Add some movies to the watchlist for testing
      const movieIds = [550, 155, 13]; // Fight Club, The Dark Knight, Forrest Gump

      for (const movieId of movieIds) {
        await request(app)
          .post('/api/users/watchlist')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ movieId });
      }
    });

    it('should return user\'s watchlist with movie details', async () => {
      const response = await request(app)
        .get('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(3);

      // Check that each item has the expected structure
      const firstItem = response.body.results[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('title');
      expect(firstItem).toHaveProperty('overview');
      expect(firstItem).toHaveProperty('posterPath');
      expect(firstItem).toHaveProperty('voteAverage');
      expect(firstItem).toHaveProperty('releaseDate');
      expect(firstItem).toHaveProperty('addedAt');
    });

    it('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .get('/api/users/watchlist')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return empty array when watchlist is empty', async () => {
      // Clean up watchlist
      await prisma.watchlist.deleteMany({
        where: { userId }
      });

      const response = await request(app)
        .get('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results).toEqual([]);
    });

    it('should support pagination with page parameter', async () => {
      const response = await request(app)
        .get('/api/users/watchlist?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 2);
      expect(response.body).toHaveProperty('total');
      expect(response.body.results.length).toBeLessThanOrEqual(2);
    });

    it('should return watchlist ordered by addedAt (most recent first)', async () => {
      const response = await request(app)
        .get('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const addedDates = response.body.results.map((item: any) => new Date(item.addedAt));

      // Check that dates are in descending order (most recent first)
      for (let i = 0; i < addedDates.length - 1; i++) {
        expect(addedDates[i].getTime()).toBeGreaterThanOrEqual(addedDates[i + 1].getTime());
      }
    });
  });

  /**
   * DELETE /api/users/watchlist/:movieId
   * Remove a movie from the user's watchlist
   */
  describe('DELETE /api/users/watchlist/:movieId', () => {
    beforeEach(async () => {
      // Add a movie to the watchlist for testing
      await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: 550 });
    });

    it('should remove a movie from the watchlist', async () => {
      const movieId = 550;

      const response = await request(app)
        .delete(`/api/users/watchlist/${movieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify the movie is no longer in the watchlist
      const watchlist = await prisma.watchlist.findFirst({
        where: {
          userId,
          movieId
        }
      });

      expect(watchlist).toBeNull();
    });

    it('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .delete('/api/users/watchlist/550')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when trying to remove a movie not in the watchlist', async () => {
      const movieId = 155; // Movie not in watchlist

      const response = await request(app)
        .delete(`/api/users/watchlist/${movieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found in watchlist');
    });

    it('should return 400 when movieId is not a valid number', async () => {
      const response = await request(app)
        .delete('/api/users/watchlist/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toContain('movieId');
    });

    it('should not allow deleting another user\'s watchlist item', async () => {
      // Create another user
      const otherUser = {
        email: 'other@test.com',
        username: 'otheruser',
        password: 'Test123!@#',
        firstName: 'Other',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(otherUser);

      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: otherUser.password
        });

      const otherAuthToken = otherLoginResponse.body.accessToken;

      // Try to delete first user's watchlist item with second user's token
      const response = await request(app)
        .delete('/api/users/watchlist/550')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found in watchlist');

      // Clean up
      await prisma.user.deleteMany({
        where: { email: otherUser.email }
      });
    });
  });
});
