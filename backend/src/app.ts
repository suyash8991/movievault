import express from 'express';
import { z } from 'zod';

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
app.post('/api/auth/register', (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    const { email, username, firstName, lastName } = validatedData;

    // Return user data (password omitted for security)
    res.status(201).json({
      user: {
        email,
        username,
        firstName,
        lastName
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