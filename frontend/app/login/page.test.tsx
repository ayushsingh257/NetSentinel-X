import { render, screen } from "@testing-library/react";

import LoginPage from "./page";

describe("Login Page", () => {

  test("renders login heading", () => {

    render(<LoginPage />);

    const heading = screen.getByText(
      /NetSentinel-X Login/i
    );

    expect(heading).toBeInTheDocument();
  });
});