import { PrismaClient } from '../../generated/prisma';

export interface RatingData {
  userId: string;
  movieId: number;
  rating: number;
  review?: string;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingWithUser extends Rating {
  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface RatingWithMovie extends Rating {
  movie: {
    id: number;
    title: string;
    overview: string | null;
    releaseDate: string | null;
    posterPath: string | null;
    voteAverage: number | null;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedRatings {
  results: RatingWithUser[];
  page: number;
  limit: number;
  total: number;
  averageRating: number | null;
  totalRatings: number;
}

export interface PaginatedUserRatings {
  results: RatingWithMovie[];
  page: number;
  limit: number;
  total: number;
}

export interface RatingRepository {
  upsert(data: RatingData): Promise<Rating>;
  findByMovieId(movieId: number, options?: PaginationOptions): Promise<PaginatedRatings>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedUserRatings>;
  findByUserIdAndMovieId(userId: string, movieId: number): Promise<Rating | null>;
  delete(userId: string, movieId: number): Promise<void>;
}

export class PrismaRatingRepository implements RatingRepository {
  constructor(private prisma: PrismaClient) {}

  async upsert(data: RatingData): Promise<Rating> {
    const rating = await this.prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: data.userId,
          movieId: data.movieId
        }
      },
      update: {
        rating: data.rating,
        review: data.review || null
      },
      create: {
        userId: data.userId,
        movieId: data.movieId,
        rating: data.rating,
        review: data.review || null
      }
    });

    return rating;
  }

  async findByMovieId(movieId: number, options?: PaginationOptions): Promise<PaginatedRatings> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.rating.count({
      where: { movieId }
    });

    // Calculate average rating
    const averageResult = await this.prisma.rating.aggregate({
      where: { movieId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    const averageRating = averageResult._avg.rating;
    const totalRatings = averageResult._count.rating;

    // Get ratings with user details
    const ratings = await this.prisma.rating.findMany({
      where: { movieId },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      skip,
      take: limit
    });

    return {
      results: ratings,
      page,
      limit,
      total,
      averageRating,
      totalRatings
    };
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedUserRatings> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.rating.count({
      where: { userId }
    });

    // Get ratings with movie details
    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            overview: true,
            releaseDate: true,
            posterPath: true,
            voteAverage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      skip,
      take: limit
    });

    return {
      results: ratings,
      page,
      limit,
      total
    };
  }

  async findByUserIdAndMovieId(userId: string, movieId: number): Promise<Rating | null> {
    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    return rating;
  }

  async delete(userId: string, movieId: number): Promise<void> {
    await this.prisma.rating.delete({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });
  }
}
