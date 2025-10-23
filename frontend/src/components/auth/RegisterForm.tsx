'use client';

import { useState, useMemo } from 'react';
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

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!formData.password) return 0;

    let score = 0;

    // Length check
    if (formData.password.length >= 8) score += 1;
    if (formData.password.length >= 12) score += 1;

    // Character type checks
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[a-z]/.test(formData.password)) score += 1;
    if (/[0-9]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;

    // Normalize to 0-100 scale (max score is 6)
    return Math.min(Math.round((score / 6) * 100), 100);
  }, [formData.password]);

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

  const validateField = (name: string) => {
    const errors: Record<string, string> = {};

    switch(name) {
      case 'email':
        if (!formData.email) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        break;

      case 'username':
        if (!formData.username) {
          errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          errors.username = 'Username must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          errors.username = 'Username can only contain letters, numbers and underscores';
        }
        break;

      case 'firstName':
        if (!formData.firstName) {
          errors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          errors.firstName = 'First name must be at least 2 characters long';
        }
        break;

      case 'lastName':
        if (!formData.lastName) {
          errors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          errors.lastName = 'Last name must be at least 2 characters long';
        }
        break;

      case 'password':
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(formData.password)) {
          errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
          errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          errors.password = 'Password must contain at least one number';
        } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
          errors.password = 'Password must contain at least one special character';
        }

        // Also validate password confirmation if it exists
        if (passwordConfirm && passwordConfirm !== formData.password) {
          errors.passwordConfirm = 'Passwords do not match';
        }
        break;

      case 'passwordConfirm':
        if (!passwordConfirm) {
          errors.passwordConfirm = 'Please confirm your password';
        } else if (passwordConfirm !== formData.password) {
          errors.passwordConfirm = 'Passwords do not match';
        }
        break;
    }

    if (errors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
      return false;
    }

    return true;
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers and underscores';
    }

    // First name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    }

    // Last name validation
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }

    // Password confirmation validation
    if (!passwordConfirm) {
      errors.passwordConfirm = 'Please confirm your password';
    } else if (passwordConfirm !== formData.password) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setFieldErrors({});

    // Validate form
    const validationErrors = validateForm();

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
              onBlur={() => validateField('email')}
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
              onBlur={() => validateField('username')}
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
                onBlur={() => validateField('firstName')}
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
                onBlur={() => validateField('lastName')}
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
              onBlur={() => validateField('password')}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50
                ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Choose a secure password"
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-red-500 text-sm">{fieldErrors.password}</p>
            )}

            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      passwordStrength < 33 ? 'bg-red-500' :
                      passwordStrength < 66 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {passwordStrength < 33 ? 'Weak' :
                   passwordStrength < 66 ? 'Moderate' :
                   'Strong'} password
                </p>
              </div>
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
              onBlur={() => validateField('passwordConfirm')}
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