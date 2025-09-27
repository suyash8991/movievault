import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class AuthMiddleware {
  constructor(private userRepository: UserRepository) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: 'Access token required'
        });
      }

      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Invalid authorization format. Use Bearer <token>'
        });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      if (!token) {
        return res.status(401).json({
          error: 'Access token required'
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as {
        userId: string;
        email: string;
        iat: number;  
        exp: number;
      };

      // Verify user still exists in database
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token'
        });
      }

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired'
        });
      }

      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
}