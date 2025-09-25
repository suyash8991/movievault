import { PrismaClient } from '../../generated/prisma';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  // password intentionally omitted from return type for security
}

export interface UserRepository {
  create(userData: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // password: false - explicitly exclude password
      }
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // password: false - explicitly exclude password
      }
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // password: false - explicitly exclude password
      }
    });

    return user;
  }

  // Additional method for authentication (includes password)
  async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        password: true, // Include password for authentication
      }
    });

    return user;
  }
}