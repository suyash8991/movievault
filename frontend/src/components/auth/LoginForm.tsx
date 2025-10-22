'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: (returnUrl?: string) => void;
  returnUrl?: string;
}

/**
 * LoginForm Component
 *
 * A reusable form component for user authentication.
 * Features:
 * - Email and password validation
 * - Loading state
 * - Error handling
 * - Remember me functionality
 */
export default function LoginForm({ onSuccess, returnUrl = '/dashboard' }: LoginFormProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Auth context
  const { login } = useAuth();

  const validateEmail = (): boolean => {
    // Basic email validation
    if (!email) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError(null);
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate form
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      // Store email in localStorage if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(returnUrl);
      }
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Login failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail();
              }}
              onBlur={validateEmail}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-red-500 text-sm">{emailError}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-6">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword();
              }}
              onBlur={validatePassword}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {passwordError && (
              <p className="mt-1 text-red-500 text-sm">{passwordError}</p>
            )}
          </div>

          {/* Remember me checkbox */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
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
                Logging in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}