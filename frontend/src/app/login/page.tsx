'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login Page
 *
 * Displays the login form and handles authentication flow.
 */
export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(returnTo);
    return null;
  }

  // Handle successful login
  const handleLoginSuccess = (redirectUrl: string = returnTo) => {
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Movie Vault</h1>
          <p className="text-gray-600 mt-2">Your personal movie collection</p>
        </div>

        <LoginForm
          onSuccess={handleLoginSuccess}
          returnUrl={returnTo}
        />
      </div>
    </div>
  );
}