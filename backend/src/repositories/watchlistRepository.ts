import { PrismaClient } from '../../generated/prisma';

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: number;
  addedAt: Date;
}

export interface WatchlistWithMovie extends WatchlistItem {
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

export interface PaginatedWatchlist {
  results: WatchlistWithMovie[];
  page: number;
  limit: number;
  total: number;
}

export interface WatchlistRepository {
  add(userId: string, movieId: number): Promise<WatchlistItem>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedWatchlist>;
  remove(userId: string, movieId: number): Promise<void>;
  findByUserIdAndMovieId(userId: string, movieId: number): Promise<WatchlistItem | null>;
}

export class PrismaWatchlistRepository implements WatchlistRepository {
  constructor(private prisma: PrismaClient) {}

  async add(userId: string, movieId: number): Promise<WatchlistItem> {
    const watchlistItem = await this.prisma.watchlist.create({
      data: {
        userId,
        movieId
      }
    });

    return watchlistItem;
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedWatchlist> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.watchlist.count({
      where: { userId }
    });

    // Get watchlist items with movie details, ordered by most recent first
    const watchlistItems = await this.prisma.watchlist.findMany({
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
        addedAt: 'desc' // Most recent first
      },
      skip,
      take: limit
    });

    return {
      results: watchlistItems,
      page,
      limit,
      total
    };
  }

  async remove(userId: string, movieId: number): Promise<void> {
    await this.prisma.watchlist.deleteMany({
      where: {
        userId,
        movieId
      }
    });
  }

  async findByUserIdAndMovieId(userId: string, movieId: number): Promise<WatchlistItem | null> {
    const watchlistItem = await this.prisma.watchlist.findFirst({
      where: {
        userId,
        movieId
      }
    });

    return watchlistItem;
  }
}
