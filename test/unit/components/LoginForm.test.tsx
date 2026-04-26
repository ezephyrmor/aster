import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/forms/LoginForm";

let captchaOnSuccess: ((token: string) => void) | null = null;

// Mock CaptchaModal properly with no global leaks
vi.mock("@/components/modals/CaptchaModal", () => ({
  default: vi.fn(({ isOpen, onSuccess }) => {
    if (isOpen && onSuccess) {
      captchaOnSuccess = onSuccess;
    }
    return isOpen ? <div data-testid="captcha-modal" /> : null;
  }),
}));

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    captchaOnSuccess = null;
    mockOnSubmit.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    captchaOnSuccess = null;
  });

  it("should render the login form with all required elements", () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText("Enter your username"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it("should update username and password fields on user input", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    await user.type(usernameInput, "test@example.com");
    await user.type(passwordInput, "password123!@#");

    expect(usernameInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123!@#");
  });

  it("should show CAPTCHA modal when valid form is submitted", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByTestId("captcha-modal")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(captchaOnSuccess).toBeDefined();
  });

  it("should call onSubmit with credentials and captcha token when CAPTCHA succeeds", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "securePassword123!",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByTestId("captcha-modal");

    expect(captchaOnSuccess).toBeInstanceOf(Function);

    captchaOnSuccess!("valid-captcha-token-12345");

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledExactlyOnceWith(
        "test@example.com",
        "securePassword123!",
        "valid-captcha-token-12345",
      );
    });
  });

  it("should display error message when login returns failure", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockResolvedValue({
      success: false,
      error: "Invalid username or password",
    });

    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong-password",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    captchaOnSuccess!("valid-token");

    expect(
      await screen.findByText("Invalid username or password"),
    ).toBeInTheDocument();
  });

  it("should call onError callback when login fails", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockResolvedValue({
      success: false,
      error: "Account is locked",
    });

    render(<LoginForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    captchaOnSuccess!("valid-token");

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Account is locked");
    });
  });

  it("should show loading state and disable inputs while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: { success: boolean }) => void;

    mockOnSubmit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    captchaOnSuccess!("valid-token");

    // Verify loading state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /signing in/i }),
      ).toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    // Complete the submission
    resolveSubmit!({ success: true });

    // Verify loading state is cleared
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    expect(usernameInput).not.toBeDisabled();
    expect(passwordInput).not.toBeDisabled();
  });

  it("should handle unexpected network errors gracefully", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockRejectedValue(
      new Error("Connection failed: network timeout"),
    );

    render(<LoginForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    captchaOnSuccess!("valid-token");

    expect(
      await screen.findByText("Connection failed: network timeout"),
    ).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith(
      "Connection failed: network timeout",
    );
  });

  it("should prevent submission with empty required fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Form validation should block submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.queryByTestId("captcha-modal")).not.toBeInTheDocument();
  });

  it("should reset pending credentials after submission completes", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    captchaOnSuccess!("valid-token");

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Submit again - should require new captcha
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByTestId("captcha-modal")).toBeInTheDocument();
  });
});
