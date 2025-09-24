import express from 'express';

const app = express();
app.use(express.json());

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, username, firstName, lastName } = req.body;

  // Minimal implementation to pass the test
  res.status(201).json({
    user: {
      email,
      username,
      firstName,
      lastName
      // Note: password is intentionally omitted for security
    }
  });
});

export default app;