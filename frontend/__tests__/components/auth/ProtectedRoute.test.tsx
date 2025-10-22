import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

describe('ProtectedRoute component', () => {
  test('should show loading state when authentication is being checked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      isAuthenticated: false
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Protected content should not be rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('should render children when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should render protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should not render children when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});