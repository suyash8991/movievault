/**
 * User Service
 *
 * Handles API calls related to user profile management using the centralized API client.
 */
import api from '@/lib/api-client';
import type { UserProfile, UpdateProfileRequest } from '@/types/auth.types';

export const userService = {
  /**
   * Get authenticated user's profile with statistics
   * GET /api/users/profile
   * Requires authentication
   */
  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/api/users/profile');
  },

  /**
   * Update authenticated user's profile
   * PUT /api/users/profile
   * Requires authentication
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return api.put<UserProfile>('/api/users/profile', data);
  }
};

export default userService;
