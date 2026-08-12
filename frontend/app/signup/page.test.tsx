import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignupPage from "./page";

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

describe("Signup Page", () => {
  test("renders signup form with empty inputs and clean placeholders", () => {
    render(<SignupPage />);

    expect(screen.getByText(/Create NetSentinel-X Account/i)).toBeInTheDocument();

    const firstNameInput = screen.getByPlaceholderText("First Name");
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveValue("");

    const lastNameInput = screen.getByPlaceholderText("Last Name");
    expect(lastNameInput).toBeInTheDocument();
    expect(lastNameInput).toHaveValue("");

    const usernameInput = screen.getByPlaceholderText("Username");
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveValue("");

    const emailInput = screen.getByPlaceholderText("you@example.com");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue("");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveValue("");
  });
});
