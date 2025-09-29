import { Router } from 'express';
import { AuthController } from '../controllers/authController';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Auth endpoints
  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/refresh', (req, res) => authController.refresh(req, res));

  return router;
}