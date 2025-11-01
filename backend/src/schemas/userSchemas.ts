import { z } from 'zod';

/**
 * Schema for updating user profile
 * Only allows updating firstName, lastName, bio, and avatarUrl
 * Does NOT allow updating email, username, or password
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').nullable().optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').nullable().optional()
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
