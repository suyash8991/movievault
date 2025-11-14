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
import { setAuthCookies, clearAuthCookies } from '@/lib/cookies';

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

  // Debug: Track auth state changes
  useEffect(() => {
    console.log('[Auth] State changed:', {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      hasUser: !!authState.user,
      userEmail: authState.user?.email,
    });
  }, [authState]);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[Auth] Initializing authentication state...');
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userJson = localStorage.getItem('user');

        console.log('[Auth] Storage check:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUser: !!userJson,
        });

        if (accessToken && refreshToken && userJson) {
          const user = JSON.parse(userJson) as User;

          console.log('[Auth] Valid tokens found, setting authenticated state');
          // Re-sync cookies to ensure middleware can access them
          setAuthCookies(accessToken, refreshToken);

          setAuthState({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Clear any stale cookies if localStorage doesn't have tokens
          console.log('[Auth] No valid tokens found, clearing cookies and setting unauthenticated state');
          clearAuthCookies();
          setAuthState({ ...defaultAuthState, isLoading: false });
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth state:', error);
        clearAuthCookies();
        setAuthState({ ...defaultAuthState, isLoading: false });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   * - Makes API request to login endpoint
   * - Updates auth state and stores tokens in both localStorage and cookies
   */
  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Login attempt for:', email);
      const response = await authService.login({ email, password });

      console.log('[Auth] Login successful, storing tokens');
      // Store tokens in cookies for middleware access
      setAuthCookies(response.accessToken, response.refreshToken);

      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      console.log('[Auth] Tokens stored, updating auth state');
      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('[Auth] Login complete, user authenticated');
    } catch (error) {
      console.error('[Auth] Login error:', error);
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

      // Store tokens in cookies for middleware access
      setAuthCookies(response.accessToken, response.refreshToken);

      // Store tokens and user data in localStorage
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
   * - Clears auth state and removes tokens from storage and cookies
   */
  const logout = () => {
    console.log('[Auth] Logging out user');
    // Clear tokens from localStorage
    authService.logout();

    // Clear authentication cookies
    clearAuthCookies();

    // Clear user data
    localStorage.removeItem('user');

    // Reset auth state
    setAuthState({ ...defaultAuthState, isLoading: false });
    console.log('[Auth] Logout complete');
  };

  /**
   * Refresh access token
   * - Uses refresh token to obtain new access token
   * - Updates auth state and cookies with new tokens
   */
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken();

      // Update access token in cookies
      setAuthCookies(response.accessToken, refreshToken);

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