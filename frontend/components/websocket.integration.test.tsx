import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import TrafficDashboard from "./TrafficDashboard";

beforeAll(() => {

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => "admin-token"),
    },
    writable: true,
  });

  global.WebSocket = jest.fn(() => ({
    close: jest.fn(),
    send: jest.fn(),
    onmessage: null,
    onerror: null,
  })) as any;
});

describe("WebSocket Dashboard Integration", () => {

  test("renders live traffic monitor", () => {

    render(<TrafficDashboard />);

    const heading = screen.getByText(
      /Live Traffic Monitor/i
    );

    expect(heading).toBeInTheDocument();
  });
});