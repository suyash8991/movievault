import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock next/link
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

describe('RegisterForm - Initial Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: jest.fn(),
    });
  });

  it('renders all form fields correctly', () => {
    render(<RegisterForm onSuccess={jest.fn()} />);

    // Check if all required form fields are rendered
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('displays the login link', () => {
    render(<RegisterForm />);

    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    const loginLink = screen.getByText(/Login/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

describe('RegisterForm - Validation and Functionality', () => {
  const mockRegister = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  it('validates email format', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/Email Address/i);

    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();

    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);

    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
  });

  it('validates password strength and shows strength meter', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^Password/i);

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    // Password strength meter should appear
    expect(await screen.findByText(/Weak password/i)).toBeInTheDocument();

    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });

    // Password strength should update
    expect(await screen.findByText(/Strong password/i)).toBeInTheDocument();
  });

  it('validates password confirmation matching', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    // Set password
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    // Set different confirmation
    fireEvent.change(confirmInput, { target: { value: 'DifferentPassword123!' } });
    fireEvent.blur(confirmInput);

    // Should show mismatch error
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();

    // Set matching confirmation
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    fireEvent.blur(confirmInput);

    // Error should disappear
    expect(screen.queryByText(/Passwords do not match/i)).not.toBeInTheDocument();
  });

  it('handles form submission with validation', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} returnUrl="/dashboard" />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' }
    });

    // Submit form
    mockRegister.mockResolvedValueOnce({});

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Should call register
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'Password123!'
      });
    });

    // Should call onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('/dashboard');
    });
  });
});