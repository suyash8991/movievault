import { Request, Response } from 'express';
import { z } from 'zod';
import { WatchlistService } from '../services/watchlistService';
import { addToWatchlistSchema, getWatchlistSchema, removeFromWatchlistSchema } from '../schemas/watchlistSchemas';

// Extend Express Request type to include user information from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  async addToWatchlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate request body
      const { movieId } = addToWatchlistSchema.parse(req.body);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Add movie to watchlist
      const watchlistItem = await this.watchlistService.addToWatchlist(userId, movieId);

      res.status(201).json(watchlistItem);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle duplicate entry
      if (error instanceof Error && (error as any).code === 'DUPLICATE_ENTRY') {
        res.status(409).json({ error: 'Movie is already in watchlist' });
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

      console.error('Add to watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWatchlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const { page, limit } = getWatchlistSchema.parse(req.query);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get user's watchlist
      const watchlist = await this.watchlistService.getWatchlist(userId, { page, limit });

      res.status(200).json(watchlist);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      console.error('Get watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeFromWatchlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate movie ID parameter
      const { movieId } = removeFromWatchlistSchema.parse(req.params);

      // Get user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Remove movie from watchlist
      await this.watchlistService.removeFromWatchlist(userId, movieId);

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
        res.status(404).json({ error: 'Movie not found in watchlist' });
        return;
      }

      console.error('Remove from watchlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
