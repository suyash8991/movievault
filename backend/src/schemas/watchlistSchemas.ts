import { z } from 'zod';

// Schema for adding a movie to watchlist
export const addToWatchlistSchema = z.object({
  movieId: z.coerce.number().int().positive('movieId must be a positive integer')
});

// Schema for getting watchlist with pagination
export const getWatchlistSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page number must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional().default(20)
});

// Schema for removing a movie from watchlist
export const removeFromWatchlistSchema = z.object({
  movieId: z.coerce.number().int().positive('movieId must be a positive integer')
});
