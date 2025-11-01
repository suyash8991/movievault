import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

describe('User Profile Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.rating.deleteMany({});
    await prisma.watchlist.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'profile.test@example.com' }
    });

    // Register a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'profile.test@example.com',
        username: 'profiletester',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

    userId = registerResponse.body.user.id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'profile.test@example.com',
        password: 'TestPass123!'
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.rating.deleteMany({});
    await prisma.watchlist.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'profile.test@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile with statistics', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'profile.test@example.com',
        username: 'profiletester',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toMatchObject({
        watchlistCount: expect.any(Number),
        ratingsCount: expect.any(Number)
      });

      // Should not include password
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });

    it('should include correct statistics count', async () => {
      // Add some watchlist items and ratings
      const movieId1 = 550; // Fight Club
      const movieId2 = 680; // Pulp Fiction

      // Add to watchlist
      await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: movieId1 });

      await request(app)
        .post('/api/users/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movieId: movieId2 });

      // Add ratings
      await request(app)
        .post(`/api/movies/${movieId1}/ratings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 9.5, review: 'Amazing movie!' });

      // Get profile
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statistics).toMatchObject({
        watchlistCount: 2,
        ratingsCount: 1
      });
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Movie enthusiast and critic',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Movie enthusiast and critic',
        avatarUrl: 'https://example.com/avatar.jpg'
      });

      // Verify the update persisted
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body).toMatchObject(updateData);
    });

    it('should update only firstName', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'UpdatedFirstName' })
        .expect(200);

      expect(response.body.firstName).toBe('UpdatedFirstName');
      // Other fields should remain unchanged
      expect(response.body.email).toBe('profile.test@example.com');
    });

    it('should update only lastName', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lastName: 'UpdatedLastName' })
        .expect(200);

      expect(response.body.lastName).toBe('UpdatedLastName');
    });

    it('should update bio and avatarUrl', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: 'New bio text',
          avatarUrl: 'https://example.com/new-avatar.jpg'
        })
        .expect(200);

      expect(response.body.bio).toBe('New bio text');
      expect(response.body.avatarUrl).toBe('https://example.com/new-avatar.jpg');
    });

    it('should clear bio and avatarUrl with null values', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: null, avatarUrl: null })
        .expect(200);

      expect(response.body.bio).toBeNull();
      expect(response.body.avatarUrl).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put('/api/users/profile')
        .send({ firstName: 'Test' })
        .expect(401);
    });

    it('should reject invalid firstName (too short)', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: '' })
        .expect(400);
    });

    it('should reject invalid avatarUrl (not a URL)', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatarUrl: 'not-a-valid-url' })
        .expect(400);
    });

    it('should reject bio that is too long', async () => {
      const longBio = 'a'.repeat(501); // Assuming max 500 chars

      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: longBio })
        .expect(400);
    });

    it('should NOT allow updating email', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'newemail@example.com' })
        .expect(200);

      // Email should remain unchanged
      expect(response.body.email).toBe('profile.test@example.com');
    });

    it('should NOT allow updating username', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'newusername' })
        .expect(200);

      // Username should remain unchanged
      expect(response.body.username).toBe('profiletester');
    });

    it('should NOT allow updating password directly', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'NewPassword123!' })
        .expect(200);

      // Password should remain unchanged - verify by logging in with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile.test@example.com',
          password: 'TestPass123!' // Old password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
    });
  });
});
