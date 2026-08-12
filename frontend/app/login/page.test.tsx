import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./page";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Login Page", () => {
  test("renders login heading and empty inputs with production placeholders", () => {
    render(<LoginPage />);

    const heading = screen.getByText(/Welcome to NetSentinel-X/i);
    expect(heading).toBeInTheDocument();

    const usernameInput = screen.getByPlaceholderText("you@example.com");
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveValue("");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveValue("");

    expect(screen.queryByText(/Quick Demo Credentials:/i)).not.toBeInTheDocument();
  });
});