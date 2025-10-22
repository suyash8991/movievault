import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders login form correctly', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    // Check if form elements exist
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/Email Address/i);

    // Test empty email
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();

    // Test invalid email format
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();

    // Test valid email format
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
  });

  it('validates password', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^Password/i);

    // Test empty password
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();

    // Test short password
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    fireEvent.blur(passwordInput);
    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();

    // Test valid password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.blur(passwordInput);
    expect(screen.queryByText(/Password must be at least 8 characters/i)).not.toBeInTheDocument();
  });

  it('handles form submission and login success', async () => {
    mockLogin.mockResolvedValueOnce({});

    render(<LoginForm onSuccess={mockOnSuccess} returnUrl="/dashboard" />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check if login was called with correct parameters
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');

    // Wait for onSuccess callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure and displays error message', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginForm onSuccess={mockOnSuccess} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check if error message is displayed
    expect(await screen.findByText(/Login failed/i)).toBeInTheDocument();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    // Check that onSuccess was not called
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles "Remember me" functionality', async () => {
    mockLogin.mockResolvedValueOnce({});

    render(<LoginForm onSuccess={mockOnSuccess} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' }
    });

    // Check "Remember me"
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /Remember me/i });
    fireEvent.click(rememberMeCheckbox);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check if localStorage was updated
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('rememberedEmail', 'test@example.com');
    });
  });
});