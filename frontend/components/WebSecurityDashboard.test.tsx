import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import WebSecurityDashboard from "./WebSecurityDashboard";

describe("WebSecurityDashboard Component (Era 19)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders web security dashboard title and security score", () => {
    render(<WebSecurityDashboard />);
    expect(
      screen.getByText(/Enterprise Web Application Security/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Era 19 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Web Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/98\/100/i)).toBeInTheDocument();
  });

  test("renders tabs and switches between tabs", () => {
    render(<WebSecurityDashboard />);

    const postureTab = screen.getByRole("button", {
      name: /Security Posture/i,
    });
    const logsTab = screen.getByRole("button", {
      name: /Attack Prevention Logs/i,
    });
    const configTab = screen.getByRole("button", {
      name: /Security Configuration/i,
    });

    expect(postureTab).toBeInTheDocument();
    expect(logsTab).toBeInTheDocument();
    expect(configTab).toBeInTheDocument();

    // Switch to Attack Prevention Logs
    fireEvent.click(logsTab);
    expect(
      screen.getByText(/Web Attack Prevention Log/i)
    ).toBeInTheDocument();

    // Switch to Security Configuration
    fireEvent.click(configTab);
    expect(
      screen.getByText(/Content Security Policy \(CSP\) Policy/i)
    ).toBeInTheDocument();
  });

  test("displays posture checks on posture tab", () => {
    render(<WebSecurityDashboard />);
    expect(screen.getByText(/XSS Protection/i)).toBeInTheDocument();
    expect(screen.getByText(/CSRF Protection/i)).toBeInTheDocument();
    expect(screen.getByText(/CSP Enforcement/i)).toBeInTheDocument();
  });
});
