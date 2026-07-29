import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import APISecurityDashboard from "./APISecurityDashboard";

describe("APISecurityDashboard Component (Era 20)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders API security dashboard title and security score 99/100", () => {
    render(<APISecurityDashboard />);
    expect(
      screen.getByText(/Enterprise Secure API Architecture/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Era 20 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/API Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/99\/100/i)).toBeInTheDocument();
  });

  test("renders tabs and switches between tabs", () => {
    render(<APISecurityDashboard />);

    const postureTab = screen.getByRole("button", {
      name: /API Security Posture/i,
    });
    const keysTab = screen.getByRole("button", {
      name: /API Key Management/i,
    });
    const threatsTab = screen.getByRole("button", {
      name: /API Threat Monitor/i,
    });

    expect(postureTab).toBeInTheDocument();
    expect(keysTab).toBeInTheDocument();
    expect(threatsTab).toBeInTheDocument();

    // Switch to API Key Management
    fireEvent.click(keysTab);
    expect(
      screen.getByText(/Generate New Enterprise API Key/i)
    ).toBeInTheDocument();

    // Switch to API Threat Monitor
    fireEvent.click(threatsTab);
    expect(
      screen.getByText(/API Threat Abuse Prevention Monitor/i)
    ).toBeInTheDocument();
  });

  test("displays posture cards on posture tab", () => {
    render(<APISecurityDashboard />);
    expect(screen.getByText(/JWT Authentication/i)).toBeInTheDocument();
    expect(screen.getAllByText(/OAuth2 Readiness/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Adaptive Rate Limiting/i)).toBeInTheDocument();
    expect(screen.getByText(/Signed Requests/i)).toBeInTheDocument();
  });
});
