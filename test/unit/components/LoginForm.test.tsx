import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/forms/LoginForm";

// Mock CaptchaModal to avoid testing it together with LoginForm
vi.mock("@/components/modals/CaptchaModal", () => ({
  default: vi.fn(({ isOpen, onSuccess }) => {
    // Expose onSuccess to test cases
    if (isOpen) {
      (globalThis as any).captchaOnSuccess = onSuccess;
    }
    return isOpen ? <div data-testid="captcha-modal" /> : null;
  }),
}));

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form correctly", () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText("Enter your username"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should update username and password fields on input", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    await user.type(usernameInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(usernameInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should show CAPTCHA modal when form is submitted", async () => {
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

    expect(screen.getByTestId("captcha-modal")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with credentials when CAPTCHA is successful", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockResolvedValue({ success: true });

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

    // Simulate CAPTCHA success by calling the exposed onSuccess
    (globalThis as any).captchaOnSuccess("valid-captcha-token");

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "valid-captcha-token",
      );
    });
  });

  it("should display error message when login fails", async () => {
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

    // Simulate CAPTCHA success
    (globalThis as any).captchaOnSuccess("valid-captcha-token");

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password"),
      ).toBeInTheDocument();
    });
  });

  it("should call onError callback when login fails", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockResolvedValue({
      success: false,
      error: "Invalid username or password",
    });

    render(<LoginForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    await user.type(
      screen.getByPlaceholderText("Enter your username"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong-password",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Simulate CAPTCHA success
    (globalThis as any).captchaOnSuccess("valid-captcha-token");

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Invalid username or password");
    });
  });

  it("should show loading state while submitting", async () => {
    const user = userEvent.setup();

    // Make onSubmit take time to resolve
    mockOnSubmit.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ success: true }), 100);
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

    // Simulate CAPTCHA success
    (globalThis as any).captchaOnSuccess("valid-captcha-token");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /signing in/i }),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your username")).toBeDisabled();
      expect(screen.getByPlaceholderText("Enter your password")).toBeDisabled();
    });
  });

  it("should handle unexpected errors gracefully", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockRejectedValue(new Error("Network error"));

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

    // Simulate CAPTCHA success
    (globalThis as any).captchaOnSuccess("valid-captcha-token");

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith("Network error");
    });
  });

  it("should require both username and password fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Try to submit without entering anything
    await user.click(submitButton);

    // Form validation should prevent submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
