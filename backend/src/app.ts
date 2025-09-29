import express from 'express';
import { PrismaClient } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { PrismaMovieRepository } from './repositories/movieRepository';
import { AuthService } from './services/authService';
import { MovieService } from './services/movieService';
import { TmdbService } from './services/tmdbService';
import { AuthMiddleware } from './middleware/authMiddleware';
import { AuthController } from './controllers/authController';
import { UserController } from './controllers/userController';
import { MovieController } from './controllers/movieController';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createMovieRoutes } from './routes/movieRoutes';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const movieRepository = new PrismaMovieRepository(prisma);
const authService = new AuthService(userRepository);
const tmdbService = new TmdbService(process.env.TMDB_API_KEY || '');
const movieService = new MovieService(tmdbService, movieRepository);
const authMiddleware = new AuthMiddleware(userRepository);

// Initialize controllers
const authController = new AuthController(authService, userRepository);
const userController = new UserController(userRepository);
const movieController = new MovieController(movieService);

const app = express();
app.use(express.json());

// Mount route modules
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/users', createUserRoutes(userController, authMiddleware));
app.use('/api/movies', createMovieRoutes(movieController));

export default app;