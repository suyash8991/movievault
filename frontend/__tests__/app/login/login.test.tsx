import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the LoginForm component
jest.mock('@/components/auth/LoginForm', () => {
  return function MockLoginForm(props: any) {
    // Convert function props to strings to make them serializable
    const serializableProps = Object.fromEntries(
      Object.entries(props).map(([key, value]) => {
        return [key, typeof value === 'function' ? 'function() {}' : value];
      })
    );
    return <div data-testid="login-form" data-props={JSON.stringify(serializableProps)} />;
  };
});

// Mock next/navigation
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => ({
    get: jest.fn().mockImplementation((param: string) => {
      if (param === 'returnTo') return '/test-return-url';
      return null;
    }),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login page with form', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(<LoginPage />);

    // Check for the page title
    expect(screen.getByText('Movie Vault')).toBeInTheDocument();

    // Check that the login form is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Check that the subtitle is shown
    expect(screen.getByText('Your personal movie collection')).toBeInTheDocument();
  });

  it('passes correct props to the LoginForm component', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(<LoginPage />);

    // Get the login form component
    const loginForm = screen.getByTestId('login-form');

    // Parse the props passed to it
    const passedProps = JSON.parse(loginForm.getAttribute('data-props') || '{}');

    // Verify that returnUrl is passed correctly
    expect(passedProps.returnUrl).toBe('/test-return-url');

    // Verify that onSuccess exists and was passed
    expect(passedProps.onSuccess).toBeDefined();
    // In the mock representation, functions are stringified
    expect(typeof passedProps.onSuccess).toBe('string');
  });

  it('redirects to returnTo URL when already authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    render(<LoginPage />);

    // Check that the router.push was called with the right URL
    expect(pushMock).toHaveBeenCalledWith('/test-return-url');

    // Check that the login form is not rendered
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });
});