import { z } from 'zod';

export const movieSearchSchema = z.object({
  q: z.string().min(1, 'Query parameter is required and cannot be empty'),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type MovieSearchRequest = z.infer<typeof movieSearchSchema>;