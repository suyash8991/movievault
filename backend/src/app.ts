import express from 'express';
import { PrismaClient } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { PrismaMovieRepository } from './repositories/movieRepository';
import { AuthService } from './services/authService';
import { MovieService } from './services/movieService';
import { TmdbService } from './services/tmdbService';
import { AuthMiddleware, AuthenticatedRequest } from './middleware/authMiddleware';
import { AuthController } from './controllers/authController';
import { UserController } from './controllers/userController';
import { MovieController } from './controllers/movieController';

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

// Auth routes
app.post('/api/auth/register', (req, res) => authController.register(req, res));

app.post('/api/auth/login', (req, res) => authController.login(req, res));

app.post('/api/auth/refresh', (req, res) => authController.refresh(req, res));

// Protected routes
app.get('/api/users/profile', authMiddleware.authenticate, (req: AuthenticatedRequest, res) => userController.getProfile(req, res));

// Movie routes
app.get('/api/movies/search', (req, res) => movieController.search(req, res));

export default app;