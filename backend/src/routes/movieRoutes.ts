import { Router } from 'express';
import { MovieController } from '../controllers/movieController';

export function createMovieRoutes(movieController: MovieController): Router {
  const router = Router();

  // Movie endpoints
  router.get('/search', (req, res) => movieController.search(req, res));

  return router;
}