import { z } from 'zod';

// Schema for creating/updating a rating
export const createRatingSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10'),
  review: z.string().optional()
});

// Schema for movie ID parameter
export const movieIdParamSchema = z.object({
  movieId: z.coerce.number().int().positive('Movie ID must be a positive integer')
});

// Schema for pagination query parameters
export const ratingPaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page number must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional().default(20)
});
