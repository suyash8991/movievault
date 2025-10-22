/**
 * Authentication Context and Provider
 *
 * This hook provides authentication state management and related methods
 * to the entire application using React Context API.
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, RegisterRequest, User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

// Default authentication state
const defaultAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state and methods.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userJson = localStorage.getItem('user');

        if (accessToken && refreshToken && userJson) {
          const user = JSON.parse(userJson) as User;

          setAuthState({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({ ...defaultAuthState, isLoading: false });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        setAuthState({ ...defaultAuthState, isLoading: false });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   * - Makes API request to login endpoint
   * - Updates auth state and stores tokens
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Handle user registration
   * - Makes API request to register endpoint
   * - Automatically logs user in on successful registration
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);

      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Handle user logout
   * - Clears auth state and removes tokens from storage
   */
  const logout = () => {
    // Clear tokens from localStorage
    authService.logout();

    // Clear user data
    localStorage.removeItem('user');

    // Reset auth state
    setAuthState({ ...defaultAuthState, isLoading: false });
  };

  /**
   * Refresh access token
   * - Uses refresh token to obtain new access token
   * - Updates auth state with new tokens
   */
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken();

      setAuthState((prevState) => ({
        ...prevState,
        accessToken: response.accessToken,
      }));

      return response.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);

      // If refresh fails, log out the user
      logout();
      throw error;
    }
  };

  // Combine all auth state and methods
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;