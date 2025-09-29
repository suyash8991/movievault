import express from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { PrismaMovieRepository } from './repositories/movieRepository';
import { AuthService } from './services/authService';
import { MovieService } from './services/movieService';
import { TmdbService } from './services/tmdbService';
import { AuthMiddleware, AuthenticatedRequest } from './middleware/authMiddleware';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const movieRepository = new PrismaMovieRepository(prisma);
const authService = new AuthService(userRepository);
const tmdbService = new TmdbService(process.env.TMDB_API_KEY || '');
const movieService = new MovieService(tmdbService, movieRepository);
const authMiddleware = new AuthMiddleware(userRepository);

const app = express();
app.use(express.json());

// Validation schema
const registerSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, 'Password must contain letter, number and special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Register user using service (handles password hashing)
    const user = await authService.registerUser(validatedData);

    // Return user data (password omitted by service/repository)
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // P2002 is Prisma's unique constraint violation error code
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          return res.status(409).json({
            error: 'Email address already exists. Please use a different email.'
          });
        }
        if (target?.includes('username')) {
          return res.status(409).json({
            error: 'Username already exists. Please choose a different username.'
          });
        }
        return res.status(409).json({
          error: 'A user with these details already exists.'
        });
      }
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});
app.post('/api/auth/login', async (req, res) => {
  try {

    const validatedData = loginSchema.parse(req.body);

    const result = await authService.loginUser(validatedData.email, validatedData.password);
    res.status(200).json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const validatedData = refreshSchema.parse(req.body);

    const result = await authService.refreshToken(validatedData.refreshToken);
    res.status(200).json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    // Handle refresh token errors
    if (error instanceof Error && error.message.includes('Invalid refresh token')) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
app.get('/api/users/profile', authMiddleware.authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // This is the most common and important reason. 
    // A JWT is valid until it expires. If a user's account is deleted or 
    // manually deactivated by an administrator, their existing, 
    // unexpired token would still be valid. The database lookup serves as 
    // a crucial real-time check to ensure the user associated with 
    // the token still exists and is an active member of the system.
    //  Without this check, a deleted user could continue to access 
    // protected resources until their token expires, 
    //  which could be days or weeks later
    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Movie search endpoint validation schema
const movieSearchSchema = z.object({
  q: z.string().min(1, 'Query parameter is required and cannot be empty'),
  page: z.coerce.number().int().min(1).optional().default(1)
});

// Movie routes
app.get('/api/movies/search', async (req, res) => {
  try {
    // Validate query parameters
    const validatedParams = movieSearchSchema.parse(req.query);

    // Search movies using the movie service
    const results = await movieService.searchMovies(validatedParams.q, validatedParams.page);

    res.status(200).json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    // Handle TMDb API errors
    if (error instanceof Error && error.message.startsWith('TMDb API')) {
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (error.message.includes('authentication')) {
        return res.status(503).json({ error: 'Movie service temporarily unavailable' });
      }
      return res.status(500).json({ error: 'Movie search failed' });
    }

    console.error('Movie search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;