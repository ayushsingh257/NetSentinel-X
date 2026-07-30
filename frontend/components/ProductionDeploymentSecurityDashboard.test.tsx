import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductionDeploymentSecurityDashboard from "./ProductionDeploymentSecurityDashboard";

describe("ProductionDeploymentSecurityDashboard", () => {
  test("renders header with Era 27 badge", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    expect(screen.getByText(/Production Deployment Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 27 Active/i)).toBeInTheDocument();
  });

  test("renders production security score display", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    expect(screen.getByText(/Production Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/98\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Production Security Posture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Environment Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TLS & Browser Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Infrastructure Health/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deployment Strategy/i })).toBeInTheDocument();
  });

  test("posture tab shows metrics and readiness status", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    expect(screen.getByText(/READY FOR LIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5 Passed/i)).toBeInTheDocument();
  });

  test("clicking Environment Security tab shows debug mode status", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Environment Security/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Environment & Debug Status Validation/i)).toBeInTheDocument();
    expect(screen.getByText(/false \(Disabled\)/i)).toBeInTheDocument();
  });

  test("clicking TLS & Browser Security tab shows TLS 1.3 info", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /TLS & Browser Security/i });
    fireEvent.click(tab);
    expect(screen.getByText(/HTTPS Transport & TLS 1.3/i)).toBeInTheDocument();
    expect(screen.getByText(/TLS 1.3 ENFORCED/i)).toBeInTheDocument();
  });

  test("clicking Infrastructure Health tab shows service table", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Infrastructure Health/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Infrastructure Component Health \(Score: 98\/100\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Go DPI Backend Engine/i)).toBeInTheDocument();
  });

  test("clicking Deployment Strategy tab shows rollback version info", () => {
    render(<ProductionDeploymentSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Deployment Strategy/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Zero-Downtime Deployment Strategy & Rollback Snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/v2.27.0-era27/i)).toBeInTheDocument();
  });
});
