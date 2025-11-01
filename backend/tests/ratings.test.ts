import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Rating Endpoints Test Suite
 *
 * Testing the movie rating and review functionality:
 * - POST /api/movies/:movieId/ratings - Create/update rating
 * - GET /api/movies/:movieId/ratings - Get all ratings for a movie
 * - GET /api/users/ratings - Get user's ratings
 * - DELETE /api/movies/:movieId/ratings - Delete rating
 */

describe('Rating Endpoints', () => {
  let authToken: string;
  let userId: string;
  let otherAuthToken: string;
  let otherUserId: string;

  const testUser = {
    email: 'rater@test.com',
    username: 'ratinguser',
    password: 'Test123!@#',
    firstName: 'Rating',
    lastName: 'User'
  };

  const otherUser = {
    email: 'other.rater@test.com',
    username: 'otherrater',
    password: 'Test123!@#',
    firstName: 'Other',
    lastName: 'Rater'
  };

  // Setup: Create test users and authenticate
  beforeAll(async () => {
    // Clean up any existing test users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { email: otherUser.email }
        ]
      }
    });

    // Register first test user
    await request(app)
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

    // Register second test user
    await request(app)
      .post('/api/auth/register')
      .send(otherUser);

    // Login to get second auth token
    const otherLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: otherUser.email,
        password: otherUser.password
      });

    otherAuthToken = otherLoginResponse.body.accessToken;
    otherUserId = otherLoginResponse.body.user.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up test data
    await prisma.rating.deleteMany({
      where: {
        OR: [{ userId }, { userId: otherUserId }]
      }
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { email: otherUser.email }
        ]
      }
    });
    await prisma.$disconnect();
  });

  // Clean up ratings between tests
  afterEach(async () => {
    await prisma.rating.deleteMany({
      where: {
        OR: [{ userId }, { userId: otherUserId }]
      }
    });
  });

  /**
   * POST /api/movies/:movieId/ratings
   * Create or update a rating for a movie
   */
  describe('POST /api/movies/:movieId/ratings', () => {
    const movieId = 550; // Fight Club

    it('should create a new rating with valid data', async () => {
      const ratingData = {
        rating: 8.5,
        review: 'An excellent movie with a great twist ending!'
      };

      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.rating).toBe(8.5);
      expect(response.body.review).toBe(ratingData.review);
      expect(response.body.movieId).toBe(movieId);
      expect(response.body.userId).toBe(userId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a rating without review text', async () => {
      const ratingData = {
        rating: 9.0
      };

      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body.rating).toBe(9.0);
      expect(response.body.review).toBeNull();
    });

    it('should update existing rating (upsert behavior)', async () => {
      // Create initial rating
      await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 7.0, review: 'Good movie' })
        .expect(201);

      // Update the rating
      const updatedData = {
        rating: 9.5,
        review: 'Actually, this is amazing!'
      };

      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.rating).toBe(9.5);
      expect(response.body.review).toBe(updatedData.review);

      // Verify only one rating exists
      const ratings = await prisma.rating.findMany({
        where: { userId, movieId }
      });
      expect(ratings).toHaveLength(1);
    });

    it('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .send({ rating: 8.0 })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when rating is missing', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ review: 'Great movie!' })
        .expect(400);

      expect(response.body.error).toContain('rating');
    });

    it('should return 400 when rating is below minimum (1)', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 0.5 })
        .expect(400);

      expect(response.body.error).toContain('rating');
    });

    it('should return 400 when rating is above maximum (10)', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 10.5 })
        .expect(400);

      expect(response.body.error).toContain('rating');
    });

    it('should return 400 when movieId is invalid', async () => {
      const response = await request(app)
        .post('/api/movies/invalid/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 8.0 })
        .expect(400);

      expect(response.body.error).toContain('movieId');
    });

    it('should cache movie in database when rating a new movie', async () => {
      const newMovieId = 155; // The Dark Knight

      await request(app)
        .post(`/api/movies/${newMovieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 9.0 })
        .expect(201);

      // Verify movie was cached
      const cachedMovie = await prisma.movie.findUnique({
        where: { id: newMovieId }
      });

      expect(cachedMovie).toBeDefined();
      expect(cachedMovie?.id).toBe(newMovieId);
    });
  });

  /**
   * GET /api/movies/:movieId/ratings
   * Get all ratings for a specific movie
   */
  describe('GET /api/movies/:movieId/ratings', () => {
    const movieId = 550; // Fight Club

    beforeEach(async () => {
      // Create some test ratings
      await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 8.5, review: 'Great movie!' });

      await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ rating: 9.0, review: 'Masterpiece!' });
    });

    it('should return all ratings for a movie', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}/ratings`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(2);

      // Check rating structure
      const firstRating = response.body.results[0];
      expect(firstRating).toHaveProperty('id');
      expect(firstRating).toHaveProperty('rating');
      expect(firstRating).toHaveProperty('review');
      expect(firstRating).toHaveProperty('createdAt');
      expect(firstRating).toHaveProperty('user');
      expect(firstRating.user).toHaveProperty('username');
      expect(firstRating.user).toHaveProperty('firstName');
      expect(firstRating.user).toHaveProperty('lastName');
      expect(firstRating.user).not.toHaveProperty('password');
      expect(firstRating.user).not.toHaveProperty('email');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}/ratings?page=1&limit=1`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body).toHaveProperty('total');
      expect(response.body.results.length).toBeLessThanOrEqual(1);
    });

    it('should return ratings ordered by most recent first', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}/ratings`)
        .expect(200);

      const dates = response.body.results.map((r: any) => new Date(r.createdAt));
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    });

    it('should return empty array when movie has no ratings', async () => {
      const response = await request(app)
        .get('/api/movies/999999/ratings')
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should calculate average rating for the movie', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}/ratings`)
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body.averageRating).toBeCloseTo((8.5 + 9.0) / 2, 1);
      expect(response.body).toHaveProperty('totalRatings', 2);
    });
  });

  /**
   * GET /api/users/ratings
   * Get the authenticated user's ratings
   */
  describe('GET /api/users/ratings', () => {
    beforeEach(async () => {
      // Create ratings for test user
      await request(app)
        .post('/api/movies/550/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 8.5, review: 'Fight Club is great!' });

      await request(app)
        .post('/api/movies/155/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 9.5, review: 'Dark Knight is a masterpiece!' });

      // Create rating for other user (should not appear in first user's results)
      await request(app)
        .post('/api/movies/13/ratings')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ rating: 7.0, review: 'Forrest Gump is good' });
    });

    it('should return user\'s own ratings with movie details', async () => {
      const response = await request(app)
        .get('/api/users/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(2);

      // Check structure includes movie details
      const firstRating = response.body.results[0];
      expect(firstRating).toHaveProperty('id');
      expect(firstRating).toHaveProperty('rating');
      expect(firstRating).toHaveProperty('review');
      expect(firstRating).toHaveProperty('movie');
      expect(firstRating.movie).toHaveProperty('id');
      expect(firstRating.movie).toHaveProperty('title');
      expect(firstRating.movie).toHaveProperty('posterPath');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/ratings')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users/ratings?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.results.length).toBe(1);
    });

    it('should return empty array when user has no ratings', async () => {
      // Clean up ratings
      await prisma.rating.deleteMany({ where: { userId } });

      const response = await request(app)
        .get('/api/users/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  /**
   * DELETE /api/movies/:movieId/ratings
   * Delete user's rating for a movie
   */
  describe('DELETE /api/movies/:movieId/ratings', () => {
    const movieId = 550;

    beforeEach(async () => {
      // Create a rating to delete
      await request(app)
        .post(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 8.0, review: 'Good movie' });
    });

    it('should delete user\'s rating', async () => {
      const response = await request(app)
        .delete(`/api/movies/${movieId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify rating was deleted
      const rating = await prisma.rating.findFirst({
        where: { userId, movieId }
      });
      expect(rating).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/movies/${movieId}/ratings`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when rating does not exist', async () => {
      const response = await request(app)
        .delete('/api/movies/999999/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should not allow deleting another user\'s rating', async () => {
      // Other user creates a rating
      await request(app)
        .post('/api/movies/155/ratings')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ rating: 9.0 });

      // First user tries to delete it
      const response = await request(app)
        .delete('/api/movies/155/ratings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');

      // Verify other user's rating still exists
      const rating = await prisma.rating.findFirst({
        where: { userId: otherUserId, movieId: 155 }
      });
      expect(rating).not.toBeNull();
    });
  });
});
