import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import '@testing-library/jest-dom';

// Mock the auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn().mockImplementation((credentials) => {
      // The actual implementation also sets the tokens in localStorage
      localStorage.setItem('accessToken', 'fake-access-token');
      localStorage.setItem('refreshToken', 'fake-refresh-token');

      return Promise.resolve({
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          createdAt: '2023-01-01'
        },
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      });
    }),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn().mockImplementation(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth hook
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      {user && (
        <div data-testid="user-email">{user.email}</div>
      )}
      <button
        data-testid="login-button"
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button
        data-testid="logout-button"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('should initially show as not authenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
  });

  test('should handle login successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2023-01-01'
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'fake-access-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'fake-refresh-token');
  });

  test('should handle logout', async () => {
    // Set up initial authenticated state
    localStorageMock.setItem('accessToken', 'fake-token');
    localStorageMock.setItem('refreshToken', 'fake-refresh-token');
    localStorageMock.setItem('user', JSON.stringify({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2023-01-01'
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for auth state to initialize from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Logout
    fireEvent.click(screen.getByTestId('logout-button'));

    // Verify we're logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');

    // Verify localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});