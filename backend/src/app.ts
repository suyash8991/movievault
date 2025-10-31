import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { PrismaMovieRepository } from './repositories/movieRepository';
import { PrismaWatchlistRepository } from './repositories/watchlistRepository';
import { AuthService } from './services/authService';
import { MovieService } from './services/movieService';
import { WatchlistService } from './services/watchlistService';
import { TmdbService } from './services/tmdbService';
import { AuthMiddleware } from './middleware/authMiddleware';
import { AuthController } from './controllers/authController';
import { UserController } from './controllers/userController';
import { MovieController } from './controllers/movieController';
import { WatchlistController } from './controllers/watchlistController';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createMovieRoutes } from './routes/movieRoutes';
import { createWatchlistRoutes } from './routes/watchlistRoutes';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const movieRepository = new PrismaMovieRepository(prisma);
const watchlistRepository = new PrismaWatchlistRepository(prisma);
const authService = new AuthService(userRepository);
const tmdbService = new TmdbService(process.env.TMDB_API_KEY || '');
const movieService = new MovieService(tmdbService, movieRepository);
const watchlistService = new WatchlistService(watchlistRepository, movieRepository, tmdbService);
const authMiddleware = new AuthMiddleware(userRepository);

// Initialize controllers
const authController = new AuthController(authService, userRepository);
const userController = new UserController(userRepository);
const movieController = new MovieController(movieService);
const watchlistController = new WatchlistController(watchlistService);

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
app.use('/api/movies', createMovieRoutes(movieController));

export default app;