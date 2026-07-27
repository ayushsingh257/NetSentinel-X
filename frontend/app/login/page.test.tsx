import { render, screen } from "@testing-library/react";
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
  test("renders login heading", () => {
    render(<LoginPage />);

    const heading = screen.getByText(/Welcome to NetSentinel-X/i);

    expect(heading).toBeInTheDocument();
  });
});