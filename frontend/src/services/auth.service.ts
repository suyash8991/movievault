/**
 * Authentication Service
 * Handles all auth-related API calls
 * 
 * This demonstrates how to use the API client in practice
 */
import api from '@/lib/api-client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth.types';

export const authService = {
    /**
     * User Registration
     * POST /api/auth/register
     */
    async register(credentials: RegisterRequest): Promise<AuthResponse> {
        return api.post<AuthResponse>('/api/auth/register', credentials, {
            requiresAuth: false, // Public endpoint, no token needed
        });

    },
    /**
      * User Login
      * POST /api/auth/login
      */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/api/auth/login', credentials, {
            requiresAuth: false,
        });

        // Store tokens in localStorage after successful login
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        return response;
    },

    /**
      * Token Refresh
      * POST /api/auth/refresh
      */
    async refreshToken(): Promise<{ accessToken: string }> {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post<{ accessToken: string }>(
            '/api/auth/refresh',
            { refreshToken },
            { requiresAuth: false }
        );

        // Update access token
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
        }
        return response;
    },

    /**
     * Logout
     * Clears tokens from localStorage
     */
    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },
};
