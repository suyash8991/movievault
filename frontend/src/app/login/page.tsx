'use client';

import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login Page Content Component
 *
 * Displays the login form and handles authentication flow.
 */
function LoginPageContent() {
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

/**
 * Login Page
 *
 * Wraps the login content in Suspense boundary as required by Next.js 15.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}