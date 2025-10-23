import { Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import { registerSchema, loginSchema, refreshSchema } from '../schemas/authSchemas';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);

      // Register user using service (handles password hashing)
      const user = await this.authService.registerUser(validatedData);

      // Generate JWT tokens for automatic login upon registration
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'REFRESH-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data with tokens
      res.status(201).json({ user, accessToken, refreshToken });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle Prisma unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // P2002 is Prisma's unique constraint violation error code
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            res.status(409).json({
              error: 'Email address already exists. Please use a different email.'
            });
            return;
          }
          if (target?.includes('username')) {
            res.status(409).json({
              error: 'Username already exists. Please choose a different username.'
            });
            return;
          }
          res.status(409).json({
            error: 'A user with these details already exists.'
          });
          return;
        }
      }

      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await this.authService.loginUser(validatedData.email, validatedData.password);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
        return;
      }

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Invalid credentials')) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
        return;
      }

      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = refreshSchema.parse(req.body);

      const result = await this.authService.refreshToken(validatedData.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Refresh token is required'
        });
        return;
      }

      // Handle refresh token errors
      if (error instanceof Error && error.message.includes('Invalid refresh token')) {
        res.status(401).json({
          error: 'Invalid refresh token'
        });
        return;
      }

      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}