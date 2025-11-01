import { UserRepository, UserProfile, User, UpdateProfileData } from '../repositories/userRepository';

/**
 * UserService
 * Handles business logic for user profile management
 */
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get user profile with statistics (watchlist count, ratings count)
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.userRepository.getProfileWithStatistics(userId);

    if (!profile) {
      throw new Error('User not found');
    }

    return profile;
  }

  /**
   * Update user profile
   * Only allows updating firstName, lastName, bio, and avatarUrl
   * Does NOT allow updating email, username, or password
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    // Verify user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update profile
    const updatedUser = await this.userRepository.updateProfile(userId, data);

    return updatedUser;
  }
}
