import { Request, Response } from 'express';
import { z } from 'zod';
import { MovieService } from '../services/movieService';
import { movieSearchSchema, movieIdSchema, moviePopularSchema } from '../schemas/movieSchemas';

export class MovieController {
  constructor(private movieService: MovieService) {}

  async search(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedParams = movieSearchSchema.parse(req.query);

      // Search movies using the movie service
      const results = await this.movieService.searchMovies(validatedParams.q, validatedParams.page);

      res.status(200).json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle TMDb API errors
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        if (error.message.includes('rate limit')) {
          res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
          return;
        }
        if (error.message.includes('authentication')) {
          res.status(503).json({ error: 'Movie service temporarily unavailable' });
          return;
        }
        res.status(500).json({ error: 'Movie search failed' });
        return;
      }

      console.error('Movie search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMovieById(req: Request, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { id } = movieIdSchema.parse(req.params);

      // Get movie details using the movie service
      const movie = await this.movieService.getMovieById(id);

      res.status(200).json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the error message for invalid ID
        const errorMessage = error.issues.map((issue) => {
          if (issue.path.includes('id')) {
            return `Invalid Movie ID format: ${issue.message}`;
          }
          return `${issue.path.join('.')}: ${issue.message}`;
        }).join(', ');

        res.status(400).json({ error: errorMessage });
        return;
      }

      // Handle movie not found - check for our custom isNotFoundError property or message
      if (
        error instanceof Error &&
        ((error as any).isNotFoundError ||
         error.message === 'Movie not found' ||
         error.message.includes('not found'))
      ) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }

      // Handle TMDb API errors
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        if (error.message.includes('rate limit')) {
          res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
          return;
        }
        if (error.message.includes('authentication')) {
          res.status(503).json({ error: 'Movie service temporarily unavailable' });
          return;
        }
        res.status(500).json({ error: 'Failed to retrieve movie details' });
        return;
      }

      console.error('Movie details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSimilarMovies(req: Request, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { id } = movieIdSchema.parse(req.params);

      // Get page parameter
      const page = req.query.page ? Number(req.query.page) : 1;

      // Get similar movies using the movie service
      const similarMovies = await this.movieService.getSimilarMovies(id, page);

      res.status(200).json(similarMovies);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the error message for invalid ID
        const errorMessage = error.issues.map((issue) => {
          if (issue.path.includes('id')) {
            return `Invalid Movie ID format: ${issue.message}`;
          }
          return `${issue.path.join('.')}: ${issue.message}`;
        }).join(', ');

        res.status(400).json({ error: errorMessage });
        return;
      }

      // Handle movie not found - check for our custom isNotFoundError property or message
      if (
        error instanceof Error &&
        ((error as any).isNotFoundError ||
         error.message === 'Movie not found' ||
         error.message.includes('not found'))
      ) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }

      // Handle TMDb API errors
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        if (error.message.includes('rate limit')) {
          res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
          return;
        }
        if (error.message.includes('authentication')) {
          res.status(503).json({ error: 'Movie service temporarily unavailable' });
          return;
        }
        res.status(500).json({ error: 'Failed to retrieve similar movies' });
        return;
      }

      console.error('Similar movies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPopularMovies(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedParams = moviePopularSchema.parse(req.query);

      // Get popular movies using the movie service
      const results = await this.movieService.getPopularMovies(validatedParams.page);

      res.status(200).json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle TMDb API errors
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        if (error.message.includes('rate limit')) {
          res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
          return;
        }
        if (error.message.includes('authentication')) {
          res.status(503).json({ error: 'Movie service temporarily unavailable' });
          return;
        }
        res.status(500).json({ error: 'Failed to retrieve popular movies' });
        return;
      }

      console.error('Popular movies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}