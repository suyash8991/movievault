import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
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
    const { email, username, password, firstName, lastName } = validatedData;

    // Hash password before saving
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user to database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    // Return user data (password omitted for security)
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;