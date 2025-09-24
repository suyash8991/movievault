import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app'; // We'll create this

describe('POST /api/auth/register', () => {
  it('should register a new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'abc',
      password: 'Test@123',
      firstName: 'Abc',
      lastName: 'Def'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.user.firstName).toBe(userData.firstName);
    expect(response.body.user.lastName).toBe(userData.lastName);
    expect(response.body.user.password).toBeUndefined(); // Password should not be returned
  });

  // Red Phase: Add failing validation tests
  it('should return 400 for invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      username: 'testuser',
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('email');
  });

  it('should return 400 for weak password', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: '123', // Too weak
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('password');
  });

  it('should return 400 for missing required fields', async () => {
    const userData = {
      email: 'test@example.com'
      // Missing other required fields
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});