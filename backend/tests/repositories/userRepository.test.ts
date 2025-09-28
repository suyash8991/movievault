import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '../../generated/prisma';

// We'll create this interface and implementation
interface UserRepository {
  create(userData: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  // password intentionally omitted from return type for security
}

const prisma = new PrismaClient();

// Clean up database before/after each test
beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterEach(async () => {
  await prisma.user.deleteMany();
});

describe('UserRepository', () => {
  // 🔴 RED PHASE: This will fail because we haven't created the repository yet
  it('should create a user and return user data without password', async () => {
    // This import will fail initially - that's expected in Red phase
    const { PrismaUserRepository } = await import('../../src/repositories/userRepository');
    const userRepository: UserRepository = new PrismaUserRepository(prisma);

    const userData: CreateUserData = {
      email: 'repo@example.com',
      username: 'repouser',
      password: 'hashedpassword123', // Assume already hashed
      firstName: 'Repo',
      lastName: 'User'
    };

    const createdUser = await userRepository.create(userData);

    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe(userData.email);
    expect(createdUser.username).toBe(userData.username);
    expect(createdUser.firstName).toBe(userData.firstName);
    expect(createdUser.lastName).toBe(userData.lastName);
    expect(createdUser.id).toBeDefined();
    expect(createdUser.createdAt).toBeDefined();
    // Ensure password is not returned
    expect((createdUser as any).password).toBeUndefined();
  });

  it('should find user by email', async () => {
    const { PrismaUserRepository } = await import('../../src/repositories/userRepository');
    const userRepository: UserRepository = new PrismaUserRepository(prisma);

    const userData: CreateUserData = {
      email: 'findme@example.com',
      username: 'finduser',
      password: 'hashedpassword123',
      firstName: 'Find',
      lastName: 'Me'
    };

    // Create user first
    await userRepository.create(userData);

    // Find by email
    const foundUser = await userRepository.findByEmail('findme@example.com');

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
    expect((foundUser as any)?.password).toBeUndefined();
  });

  it('should return null when user not found by email', async () => {
    const { PrismaUserRepository } = await import('../../src/repositories/userRepository');
    const userRepository: UserRepository = new PrismaUserRepository(prisma);

    const foundUser = await userRepository.findByEmail('nonexistent@example.com');

    expect(foundUser).toBeNull();
  });
});