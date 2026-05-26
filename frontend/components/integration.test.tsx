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
          total_packets: 250,
          total_alerts: 12,
          high_alerts: 4,
        }),
    })
  ) as jest.Mock;
});

describe("Frontend Backend Integration", () => {

  test("loads analytics data into dashboard", async () => {

    render(<SOCDashboard />);

    const packets = await screen.findByText("250");

    expect(packets).toBeInTheDocument();
  });
});