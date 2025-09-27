import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
// We'll import Prisma client for database testing
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Clean up database before/after each test
beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterEach(async()=>{
    await prisma.user.deleteMany();
})

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

  // 🔴 RED PHASE: Database persistence test (will fail)
  it('should save user to database', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Check user exists in database
    const savedUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(userData.email);
    expect(savedUser?.username).toBe(userData.username);
    expect(savedUser?.firstName).toBe(userData.firstName);
    expect(savedUser?.lastName).toBe(userData.lastName);
    expect(savedUser?.id).toBeDefined();
    expect(savedUser?.createdAt).toBeDefined();
  });

  // 🔴 RED PHASE: Password hashing test (will fail)
  it('should hash password before saving to database', async () => {
    const userData = {
      email: 'hash@example.com',
      username: 'hashuser',
      password: 'PlainText123!',
      firstName: 'Hash',
      lastName: 'User'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Check that password is hashed (not stored as plain text)
    const savedUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    expect(savedUser?.password).toBeDefined();
    expect(savedUser?.password).not.toBe(userData.password); // Should be hashed, not plain text
    expect(savedUser?.password.length).toBeGreaterThan(50); // Bcrypt hashes are long
    expect(savedUser?.password).toMatch(/^\$2[aby]?\$\d+\$/); // Bcrypt format
  });

  // 🔴 RED PHASE: Duplicate email test (will fail)
  it('should reject duplicate email addresses with 409 status', async () => {
    const userData = {
      email: 'duplicate@example.com',
      username: 'firstuser',
      password: 'Test@123',
      firstName: 'First',
      lastName: 'User'
    };

    // Create first user successfully
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Attempt to create second user with same email (different username)
    const duplicateUserData = {
      email: 'duplicate@example.com', // Same email
      username: 'seconduser', // Different username
      password: 'Different@123',
      firstName: 'Second',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(duplicateUserData)
      .expect(409); // Conflict status

    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('email');
    expect(response.body.error.toLowerCase()).toContain('already exists');
  });
});

describe('POST /api/auth/login', () => {
  it('should login user with valid credentials', async () => {
    // First, register a user
    const userData = {
      email: 'login@example.com',
      username: 'loginuser',
      password: 'Test@123',
      firstName: 'Login',
      lastName: 'User'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Now attempt to login
    const loginData = {
      email: 'login@example.com',
      password: 'Test@123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('should reject login with invalid password', async () => {
    // First, register a user
    const userData = {
      email: 'invalid@example.com',
      username: 'invaliduser',
      password: 'Test@123',
      firstName: 'Invalid',
      lastName: 'User'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Attempt login with wrong password
    const loginData = {
      email: 'invalid@example.com',
      password: 'WrongPassword@123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('Invalid credentials');
  });

  it('should reject login with non-existent email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'Test@123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain('Invalid credentials');
  });
});

