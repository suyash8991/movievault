import { PrismaClient } from '../../generated/prisma';

export interface CreateMovieData {
  id: number;          // TMDb movie ID
  title: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string;
  voteAverage?: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  releaseDate: string | null;
  posterPath: string | null;
  voteAverage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieRepository {
  create(movieData: CreateMovieData): Promise<Movie>;
  findById(id: number): Promise<Movie | null>;
  search(query: string): Promise<Movie[]>;
}

export class PrismaMovieRepository implements MovieRepository {
  constructor(private prisma: PrismaClient) {}

  async create(movieData: CreateMovieData): Promise<Movie> {
    const movie = await this.prisma.movie.create({
      data: movieData
    });

    return movie;
  }

  async findById(id: number): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id }
    });

    return movie;
  }

  async search(query: string): Promise<Movie[]> {
    const movies = await this.prisma.movie.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive' // Case-insensitive search
        }
      },
      orderBy: {
        voteAverage: 'desc' // Best movies first
      }
    });

    return movies;
  }
}