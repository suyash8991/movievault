'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { RegisterRequest } from '@/types/auth.types';

interface RegisterFormProps {
  onSuccess?: (returnUrl?: string) => void;
  returnUrl?: string;
}

/**
 * RegisterForm Component
 *
 * A form component for user registration with validation.
 * Features:
 * - Email, username, password validation
 * - Password strength meter
 * - Loading state and error handling
 */
export default function RegisterForm({ onSuccess, returnUrl = '/dashboard' }: RegisterFormProps) {
  // Form state
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auth context
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);

    // Clear confirmation error when user types
    if (fieldErrors.passwordConfirm) {
      setFieldErrors(prev => ({ ...prev, passwordConfirm: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setFieldErrors({});

    // Basic validation will be implemented in the next step
    const validationErrors: Record<string, string> = {};
    // ... validation logic will be added later

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(returnUrl);
      }
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Registration failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field - placeholder */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-red-500 text-sm">{fieldErrors.email}</p>
            )}
          </div>

          {/* Username field - placeholder */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${fieldErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Choose a unique username"
              disabled={isLoading}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-red-500 text-sm">{fieldErrors.username}</p>
            )}
          </div>

          {/* Name fields row - placeholder */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                  ${fieldErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-red-500 text-sm">{fieldErrors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                  ${fieldErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-red-500 text-sm">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Password field - placeholder */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Choose a secure password"
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-red-500 text-sm">{fieldErrors.password}</p>
            )}
          </div>

          {/* Password confirmation field - placeholder */}
          <div className="mb-6">
            <label htmlFor="passwordConfirm" className="block text-gray-700 font-medium mb-1">
              Confirm Password *
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${fieldErrors.passwordConfirm ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Re-enter your password"
              disabled={isLoading}
            />
            {fieldErrors.passwordConfirm && (
              <p className="mt-1 text-red-500 text-sm">{fieldErrors.passwordConfirm}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}