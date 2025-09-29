import { Request, Response } from 'express';
import { z } from 'zod';
import { MovieService } from '../services/movieService';
import { movieSearchSchema } from '../schemas/movieSchemas';

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
}