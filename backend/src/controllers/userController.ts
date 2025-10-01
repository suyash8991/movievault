import { Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class UserController {
  constructor(private userRepository: UserRepository) {}

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // This is the most common and important reason.
      // A JWT is valid until it expires. If a user's account is deleted or
      // manually deactivated by an administrator, their existing,
      // unexpired token would still be valid. The database lookup serves as
      // a crucial real-time check to ensure the user associated with
      // the token still exists and is an active member of the system.
      //  Without this check, a deleted user could continue to access
      // protected resources until their token expires,
      //  which could be days or weeks later
      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}