import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlistController';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

export function createWatchlistRoutes(watchlistController: WatchlistController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // All watchlist endpoints require authentication
  // POST /api/users/watchlist - Add movie to watchlist
  router.post('/', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    watchlistController.addToWatchlist(req, res)
  );

  // GET /api/users/watchlist - Get user's watchlist
  router.get('/', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    watchlistController.getWatchlist(req, res)
  );

  // DELETE /api/users/watchlist/:movieId - Remove movie from watchlist
  router.delete('/:movieId', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    watchlistController.removeFromWatchlist(req, res)
  );

  return router;
}
