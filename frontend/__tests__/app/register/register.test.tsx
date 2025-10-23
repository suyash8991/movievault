import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/register/page';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the RegisterForm component
jest.mock('@/components/auth/RegisterForm', () => {
  return function MockRegisterForm(props: any) {
    // Convert function props to strings to make them serializable
    const serializableProps = Object.fromEntries(
      Object.entries(props).map(([key, value]) => {
        return [key, typeof value === 'function' ? 'function() {}' : value];
      })
    );
    return <div data-testid="register-form" data-props={JSON.stringify(serializableProps)} />;
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the register page with form', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(<RegisterPage />);

    // Check for the page title
    expect(screen.getByText('Movie Vault')).toBeInTheDocument();

    // Check that the register form is rendered
    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Check that the subtitle is shown
    expect(screen.getByText('Create your personal movie collection')).toBeInTheDocument();

    // Check legal notes
    expect(screen.getByText(/By creating an account, you agree to our/i)).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('passes correct props to the RegisterForm component', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(<RegisterPage />);

    // Get the register form component
    const registerForm = screen.getByTestId('register-form');

    // Parse the props passed to it
    const passedProps = JSON.parse(registerForm.getAttribute('data-props') || '{}');

    // Verify that returnUrl is passed correctly
    expect(passedProps.returnUrl).toBe('/test-return-url');

    // Verify that onSuccess exists
    expect(passedProps.onSuccess).toBeDefined();
  });

  it('redirects to returnTo URL when already authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    render(<RegisterPage />);

    // Check that the router.push was called with the right URL
    expect(pushMock).toHaveBeenCalledWith('/test-return-url');

    // Check that the register form is not rendered
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
  });
});