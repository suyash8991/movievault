import bcrypt from 'bcryptjs';
import { UserRepository, CreateUserData, User } from '../repositories/userRepository';
import jwt from 'jsonwebtoken';

export interface RegisterUserData {
  email: string;
  username: string;
  password: string; // Plain text password
  firstName: string;
  lastName: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) { }

  async registerUser(userData: RegisterUserData): Promise<User> {
    // Hash password (business logic)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user data with hashed password
    const createUserData: CreateUserData = {
      ...userData,
      password: hashedPassword
    };

    // Save user via repository
    return await this.userRepository.create(createUserData);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  // For future login functionality
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({
      userId: user.id, email: user.email
    },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign({
      userId: user.id
    },
      process.env.JWT_REFRESH_SECRET || 'REFRESH-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'REFRESH-secret-key'
      ) as { userId: string };

      // Check if user still exists
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newAccessToken = jwt.sign({
        userId: user.id,
        email: user.email
      },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '15m' }
      );

      // Generate new refresh token (token rotation)
      const newRefreshToken = jwt.sign({
        userId: user.id
      },
        process.env.JWT_REFRESH_SECRET || 'REFRESH-secret-key',
        { expiresIn: '7d' }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }
}