/**
 * API Response Types
 */

export interface ApiError {
  error: string;
  statusCode?: number;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request Configuration
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  requiresAuth?: boolean;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}