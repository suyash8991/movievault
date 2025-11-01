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
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  // password intentionally omitted from return type for security
}

export interface UserProfile extends User {
  statistics: {
    watchlistCount: number;
    ratingsCount: number;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UserRepository {
  create(userData: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null>;
  getProfileWithStatistics(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<User>;
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
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
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
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
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
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
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
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        password: true, // Include password for authentication
      }
    });

    return user;
  }

  async getProfileWithStatistics(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            watchlist: true,
            ratings: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    // Transform the Prisma result to match UserProfile interface
    const { _count, ...userData } = user;

    return {
      ...userData,
      statistics: {
        watchlistCount: _count.watchlist,
        ratingsCount: _count.ratings
      }
    };
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl })
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }
}