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
          total_packets: 500,
          total_alerts: 25,
          high_alerts: 7,
        }),
    })
  ) as jest.Mock;

  global.WebSocket = jest.fn(() => ({
    close: jest.fn(),
    send: jest.fn(),
    onmessage: null,
    onerror: null,
  })) as any;
});

describe("SOC Workflow Integration", () => {

  test("loads complete SOC dashboard workflow", async () => {

    render(<SOCDashboard />);

    const heading = screen.getByRole(
      "heading",
      {
        name: "Security Operations Center",
      }
    );

    expect(heading).toBeInTheDocument();

    const packets = await screen.findByText("500");

    expect(packets).toBeInTheDocument();
  });
});