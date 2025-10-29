/**
 * API Client - Centralized HTTP communication layer
 * 
 * This module provides a type-safe wrapper around the Fetch API with:
 * - Automatic JWT token attachment
 * - Request/response interceptors
 * - Error handling and transformation
 * - Base URL configuration
 */

import type { RequestConfig } from '@/types/api.types';

// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errors?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get authentication token from localStorage
 * Returns null if no token exists
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null; // Server-side check
    return localStorage.getItem('accessToken');
}

/**
 * Request Interceptor
 * Modifies outgoing requests before they're sent
 * - Adds Content-Type header
 * - Attaches JWT token for authenticated requests
 */
function requestInterceptor(config: RequestConfig): RequestInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...config.headers,
    };

    // Add JWT token if request requires authentication
    if (config.requiresAuth !== false) {
        const token = getAuthToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    return {
        method: config.method || 'GET',
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
    };
}

/**
 * Response Interceptor
 * Processes responses and handles errors consistently
 * - Parses JSON responses
 * - Throws ApiError for failed requests
 * - Handles token expiration (401 errors) with automatic refresh
 */

async function responseInterceptor<T>(
    response: Response,
    originalUrl: string,
    originalConfig: RequestInit
): Promise<T> {
    // Parse JSON response
    const data = await response.json().catch(() => null);

    // Handle unsuccessful responses
    if (!response.ok) {
        // Token expired or invalid - attempt to refresh
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                const refreshToken = localStorage.getItem('refreshToken');

                // Try to refresh the token if we have one
                if (refreshToken && !originalUrl.includes('/auth/refresh')) {
                    try {
                        // Attempt token refresh
                        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();

                            // Update tokens in localStorage
                            localStorage.setItem('accessToken', refreshData.accessToken);

                            // Update cookies
                            const { setAuthCookies } = await import('@/lib/cookies');
                            setAuthCookies(refreshData.accessToken, refreshToken);

                            // Retry the original request with new token
                            const retryHeaders = new Headers(originalConfig.headers);
                            retryHeaders.set('Authorization', `Bearer ${refreshData.accessToken}`);

                            const retryResponse = await fetch(originalUrl, {
                                ...originalConfig,
                                headers: retryHeaders,
                            });

                            return await retryResponse.json();
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }

                // If refresh fails or no refresh token, clear auth and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                const { clearAuthCookies } = await import('@/lib/cookies');
                clearAuthCookies();

                // Redirect to login
                window.location.href = '/login';
            }
        }

        throw new ApiError(
            data?.error || data?.message || 'An error occurred',
            response.status,
            data?.errors
        );
    }

    return data;
}

/**
 * Main API Client
 * Core function that makes HTTP requests
 * 
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param config - Request configuration
 * @returns Promise with typed response data
 */
async function apiClient<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> {
    // Build URL with query parameters if provided
    let url = `${API_BASE_URL}${endpoint}`;

    // Add query parameters if they exist
    if (config.params) {
        const queryParams = new URLSearchParams();

        // Add each parameter to the query string, filtering out undefined values
        Object.entries(config.params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        // Append query string to URL if there are parameters
        const queryString = queryParams.toString();
        if (queryString) {
            url = `${url}?${queryString}`;
        }
    }

    // Apply request interceptor
    const fetchConfig = requestInterceptor(config);

    try {
        // Make the HTTP request
        const response = await fetch(url, fetchConfig);

        // Apply response interceptor with retry capability
        return await responseInterceptor<T>(response, url, fetchConfig);
    } catch (error) {
        // Re-throw ApiError instances
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors or other unexpected errors
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error occurred',
            undefined,
            error
        );
    }
}

/**
 * Convenience methods for common HTTP verbs
 * These make API calls more readable and type-safe
 */
export const api = {
    /**
     * GET request
     * Usage: api.get<User>('/users/profile')
     */
    get: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...config, method: 'GET' }),

    /**
     * POST request
     * Usage: api.post<LoginResponse>('/auth/login', { email, password })
     */
    post: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
        apiClient<T>(endpoint, { ...config, body, method: 'POST' }),

    /**
     * PUT request (full update)
     * Usage: api.put<User>('/users/profile', userData)
     */
    put: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
        apiClient<T>(endpoint, { ...config, body, method: 'PUT' }),

    /**
     * PATCH request (partial update)
     * Usage: api.patch<User>('/users/profile', { displayName: 'New Name' })
     */
    patch: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
        apiClient<T>(endpoint, { ...config, body, method: 'PATCH' }),

    /**
     * DELETE request
     * Usage: api.delete('/users/watchlist/123')
     */
    delete: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
        apiClient<T>(endpoint, { ...config, method: 'DELETE' }),
};

export default api;