'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes from unauthorized access.
 * It redirects unauthenticated users to the login page or another fallback path.
 *
 * Usage:
 * ```tsx
 * // In a page component:
 * export default function ProtectedPage() {
 *   return (
 *     <ProtectedRoute>
 *       <YourProtectedContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export default function ProtectedRoute({
  children,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during loading state to avoid flash redirect
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // Store the current path for redirect after login
      const returnPath = encodeURIComponent(pathname);
      router.push(`${fallbackPath}?returnTo=${returnPath}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, fallbackPath]);

  // Show loading state or render children
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}