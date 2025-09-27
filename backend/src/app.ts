import express from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '../generated/prisma';
import { PrismaUserRepository } from './repositories/userRepository';
import { AuthService } from './services/authService';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

const app = express();
app.use(express.json());

// Validation schema
const registerSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, 'Password must contain letter, number and special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Register user using service (handles password hashing)
    const user = await authService.registerUser(validatedData);

    // Return user data (password omitted by service/repository)
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // P2002 is Prisma's unique constraint violation error code
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          return res.status(409).json({
            error: 'Email address already exists. Please use a different email.'
          });
        }
        if (target?.includes('username')) {
          return res.status(409).json({
            error: 'Username already exists. Please choose a different username.'
          });
        }
        return res.status(409).json({
          error: 'A user with these details already exists.'
        });
      }
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});
app.post('/api/auth/login', async (req, res) => {
  try {

    const validatedData = loginSchema.parse(req.body);

    const result = await authService.loginUser(validatedData.email, validatedData.password);
    res.status(200).json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default app;