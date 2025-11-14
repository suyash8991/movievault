'use client';

import { Suspense, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login Page Content Component
 *
 * Displays the login form and handles authentication flow.
 */
function LoginPageContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Detect and prevent infinite redirect loops
  useEffect(() => {
    // Check if we're in a redirect loop (visited this page multiple times in quick succession)
    const loginVisits = sessionStorage.getItem('loginVisitCount');
    const lastVisit = sessionStorage.getItem('lastLoginVisit');
    const now = Date.now();

    if (loginVisits && lastVisit) {
      const visitCount = parseInt(loginVisits);
      const timeSinceLastVisit = now - parseInt(lastVisit);

      // If we've been here more than 3 times in the last 2 seconds, we're in a loop
      if (visitCount > 3 && timeSinceLastVisit < 2000) {
        console.error('[LoginPage] Redirect loop detected! Clearing stale authentication data...');
        sessionStorage.removeItem('loginVisitCount');
        sessionStorage.removeItem('lastLoginVisit');
        logout(); // This will clear localStorage and cookies
        return;
      }
    }

    // Track this visit
    sessionStorage.setItem('loginVisitCount', loginVisits ? (parseInt(loginVisits) + 1).toString() : '1');
    sessionStorage.setItem('lastLoginVisit', now.toString());

    // Reset counter after 2 seconds of no visits
    const resetTimer = setTimeout(() => {
      sessionStorage.removeItem('loginVisitCount');
      sessionStorage.removeItem('lastLoginVisit');
    }, 2000);

    return () => clearTimeout(resetTimer);
  }, [logout]);

  // Redirect if already authenticated (use useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('[LoginPage] User already authenticated, redirecting to:', returnTo);
      // Use replace instead of push to avoid adding to browser history
      router.replace(returnTo);
    }
  }, [isAuthenticated, isLoading, returnTo]);

  // Show loading state while auth is being initialized
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render login form if authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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