import { Router } from 'express';
import { MovieController } from '../controllers/movieController';

export function createMovieRoutes(movieController: MovieController): Router {
  const router = Router();

  // Movie endpoints
  router.get('/search', (req, res) => movieController.search(req, res));
  router.get('/:id', (req, res) => movieController.getMovieById(req, res));
  router.get('/:id/similar', (req, res) => movieController.getSimilarMovies(req, res));

  return router;
}