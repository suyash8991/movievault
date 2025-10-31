import { z } from 'zod';

export const movieSearchSchema = z.object({
  q: z.string().min(1, 'Query parameter is required and cannot be empty'),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export const movieIdSchema = z.object({
  id: z.coerce.number().int().positive('Movie ID must be a positive integer')
}).refine(data => !isNaN(data.id), {
  message: 'Invalid Movie ID format',
  path: ['id']
});

export const moviePopularSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page number must be at least 1').optional().default(1)
});

export type MovieSearchRequest = z.infer<typeof movieSearchSchema>;
export type MovieIdRequest = z.infer<typeof movieIdSchema>;
export type MoviePopularRequest = z.infer<typeof moviePopularSchema>;