import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

export function createUserRoutes(userController: UserController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Protected user endpoints
  router.get('/profile', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    userController.getProfile(req, res)
  );

  router.put('/profile', authMiddleware.authenticate, (req: AuthenticatedRequest, res) =>
    userController.updateProfile(req, res)
  );

  return router;
}