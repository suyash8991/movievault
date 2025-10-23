'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

/**
 * Register Page
 *
 * Displays the registration form and handles account creation flow.
 */
export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(returnTo);
    return null;
  }

  // Handle successful registration
  const handleRegisterSuccess = (redirectUrl: string = returnTo) => {
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Movie Vault</h1>
          <p className="text-gray-600 mt-2">Create your personal movie collection</p>
        </div>

        {/* Registration Form */}
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          returnUrl={returnTo}
        />

        {/* Legal notes */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>By creating an account, you agree to our</p>
          <p className="mt-1">
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' and '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}