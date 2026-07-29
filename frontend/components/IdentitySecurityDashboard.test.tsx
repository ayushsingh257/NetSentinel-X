import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IdentitySecurityDashboard from "./IdentitySecurityDashboard";

describe("IdentitySecurityDashboard", () => {
  test("renders header with Era 24 badge", () => {
    render(<IdentitySecurityDashboard />);
    expect(screen.getByText(/Secure Session & Advanced Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 24 Active/i)).toBeInTheDocument();
  });

  test("renders identity security score display", () => {
    render(<IdentitySecurityDashboard />);
    expect(screen.getByText(/Identity Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/98\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<IdentitySecurityDashboard />);
    expect(screen.getByRole("button", { name: /Identity Posture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Active Sessions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MFA Management/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login Risk Monitor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Authentication Events/i })).toBeInTheDocument();
  });

  test("posture tab shows cards and controls", () => {
    render(<IdentitySecurityDashboard />);
    expect(screen.getByText(/15 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/30 Days/i)).toBeInTheDocument();
    expect(screen.getByText(/15-Minute Short-Lived Access Tokens/i)).toBeInTheDocument();
  });

  test("clicking Active Sessions tab shows user sessions and revoke button", () => {
    render(<IdentitySecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Active Sessions/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Ayush/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah_SOC/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Revoke/i).length).toBeGreaterThan(0);
  });

  test("clicking MFA Management tab shows privileged user MFA statuses", () => {
    render(<IdentitySecurityDashboard />);
    const tab = screen.getByRole("button", { name: /MFA Management/i });
    fireEvent.click(tab);
    expect(screen.getByText(/SUPER_ADMIN/i)).toBeInTheDocument();
    expect(screen.getByText(/SOC_ADMIN/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MFA ENABLED/i).length).toBeGreaterThan(0);
  });

  test("clicking Login Risk Monitor tab shows impossible travel alerts", () => {
    render(<IdentitySecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Login Risk Monitor/i });
    fireEvent.click(tab);
    expect(screen.getByText(/IMPOSSIBLE TRAVEL DETECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/UNRECOGNIZED NEW DEVICE/i)).toBeInTheDocument();
  });

  test("clicking Authentication Events tab shows identity audit trail", () => {
    render(<IdentitySecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Authentication Events/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Identity Security Audit Events/i)).toBeInTheDocument();
    expect(screen.getAllByText(/LOGIN_SUCCESS/i).length).toBeGreaterThan(0);
  });
});
