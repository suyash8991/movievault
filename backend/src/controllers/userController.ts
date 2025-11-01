import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { updateProfileSchema } from '../schemas/userSchemas';
import { ZodError } from 'zod';

export class UserController {
  constructor(private userService: UserService) {}

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const profile = await this.userService.getProfile(req.user.userId);

      res.status(200).json(profile);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Validate request body
      const validatedData = updateProfileSchema.parse(req.body);

      // Update profile
      const updatedUser = await this.userService.updateProfile(req.user.userId, validatedData);

      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues
        });
        return;
      }

      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}