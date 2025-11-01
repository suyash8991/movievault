import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { PrismaMovieRepository } from './repositories/movieRepository';
import { PrismaWatchlistRepository } from './repositories/watchlistRepository';
import { PrismaRatingRepository } from './repositories/ratingRepository';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { MovieService } from './services/movieService';
import { WatchlistService } from './services/watchlistService';
import { RatingService } from './services/ratingService';
import { TmdbService } from './services/tmdbService';
import { AuthMiddleware } from './middleware/authMiddleware';
import { AuthController } from './controllers/authController';
import { UserController } from './controllers/userController';
import { MovieController } from './controllers/movieController';
import { WatchlistController } from './controllers/watchlistController';
import { RatingController } from './controllers/ratingController';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createMovieRoutes } from './routes/movieRoutes';
import { createWatchlistRoutes } from './routes/watchlistRoutes';
import { createRatingRoutes, createUserRatingRoutes } from './routes/ratingRoutes';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const movieRepository = new PrismaMovieRepository(prisma);
const watchlistRepository = new PrismaWatchlistRepository(prisma);
const ratingRepository = new PrismaRatingRepository(prisma);
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const tmdbService = new TmdbService(process.env.TMDB_API_KEY || '');
const movieService = new MovieService(tmdbService, movieRepository);
const watchlistService = new WatchlistService(watchlistRepository, movieRepository, tmdbService);
const ratingService = new RatingService(ratingRepository, movieRepository, tmdbService);
const authMiddleware = new AuthMiddleware(userRepository);

// Initialize controllers
const authController = new AuthController(authService, userRepository);
const userController = new UserController(userService);
const movieController = new MovieController(movieService);
const watchlistController = new WatchlistController(watchlistService);
const ratingController = new RatingController(ratingService);

const app = express();
// Configure CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Mount route modules
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/users', createUserRoutes(userController, authMiddleware));
app.use('/api/users/watchlist', createWatchlistRoutes(watchlistController, authMiddleware));
app.use('/api/users/ratings', createUserRatingRoutes(ratingController, authMiddleware));
app.use('/api/movies', createMovieRoutes(movieController));
app.use('/api/movies', createRatingRoutes(ratingController, authMiddleware));

export default app;