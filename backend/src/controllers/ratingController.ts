import { Request, Response } from 'express';
import { z } from 'zod';
import { RatingService } from '../services/ratingService';
import { createRatingSchema, movieIdParamSchema, ratingPaginationSchema } from '../schemas/ratingSchemas';

// Extend Express Request type to include user information from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class RatingController {
  constructor(private ratingService: RatingService) {}

  async upsertRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { movieId } = movieIdParamSchema.parse(req.params);

      // Validate request body
      const { rating, review } = createRatingSchema.parse(req.body);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Create or update rating
      const result = await this.ratingService.upsertRating(userId, movieId, rating, review);

      // Return 201 for new rating, 200 for update
      const statusCode = result.isNew ? 201 : 200;
      res.status(statusCode).json(result.rating);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle movie not found
      if (error instanceof Error && error.message === 'Movie not found') {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }

      // Handle TMDb API errors
      if (error instanceof Error && error.message.startsWith('TMDb API')) {
        res.status(500).json({ error: 'Failed to verify movie' });
        return;
      }

      console.error('Upsert rating error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRatingsByMovieId(req: Request, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { movieId } = movieIdParamSchema.parse(req.params);

      // Validate pagination parameters
      const { page, limit } = ratingPaginationSchema.parse(req.query);

      // Get ratings for the movie
      const ratings = await this.ratingService.getRatingsByMovieId(movieId, { page, limit });

      res.status(200).json(ratings);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      console.error('Get movie ratings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserRatings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate pagination parameters
      const { page, limit } = ratingPaginationSchema.parse(req.query);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get user's ratings
      const ratings = await this.ratingService.getRatingsByUserId(userId, { page, limit });

      res.status(200).json(ratings);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      console.error('Get user ratings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { movieId } = movieIdParamSchema.parse(req.params);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Delete the rating
      await this.ratingService.deleteRating(userId, movieId);

      res.status(204).send();
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle not found
      if (error instanceof Error && (error as any).code === 'NOT_FOUND') {
        res.status(404).json({ error: 'Rating not found' });
        return;
      }

      console.error('Delete rating error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
