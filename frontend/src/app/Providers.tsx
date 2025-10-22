'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * App Providers
 *
 * Wraps the application with all necessary providers.
 * This component can be used to add more providers as the app grows.
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}