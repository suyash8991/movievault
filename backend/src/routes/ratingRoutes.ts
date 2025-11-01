import { Router } from 'express';
import { RatingController } from '../controllers/ratingController';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

export function createRatingRoutes(ratingController: RatingController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // POST /api/movies/:movieId/ratings - Create or update rating (requires auth)
  router.post('/:movieId/ratings', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    ratingController.upsertRating(req, res)
  );

  // GET /api/movies/:movieId/ratings - Get all ratings for a movie (public)
  router.get('/:movieId/ratings', (req, res) =>
    ratingController.getRatingsByMovieId(req, res)
  );

  // DELETE /api/movies/:movieId/ratings - Delete user's rating (requires auth)
  router.delete('/:movieId/ratings', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    ratingController.deleteRating(req, res)
  );

  return router;
}

// Create user-specific rating routes
export function createUserRatingRoutes(ratingController: RatingController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // GET /api/users/ratings - Get authenticated user's ratings (requires auth)
  router.get('/', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    ratingController.getUserRatings(req, res)
  );

  return router;
}
