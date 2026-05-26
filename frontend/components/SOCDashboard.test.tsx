import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import SOCDashboard from "./SOCDashboard";

beforeAll(() => {

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => "admin-token"),
      setItem: jest.fn(),
    },
    writable: true,
  });

  global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        total_packets: 100,
        total_alerts: 5,
        high_alerts: 2,
      }),
  })
) as jest.Mock;
});

describe("SOC Dashboard", () => {

  test("renders SOC heading", () => {

    render(<SOCDashboard />);

    const heading = screen.getByRole(
      "heading",
      {
        name: "Security Operations Center",
      }
    );

    expect(heading).toBeInTheDocument();
  });
});