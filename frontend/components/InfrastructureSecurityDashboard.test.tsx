import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InfrastructureSecurityDashboard from "./InfrastructureSecurityDashboard";

describe("InfrastructureSecurityDashboard", () => {
  test("renders header with Era 21 badge", () => {
    render(<InfrastructureSecurityDashboard />);
    expect(screen.getAllByText(/Infrastructure & Platform Security/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Era 21 Active/i).length).toBeGreaterThan(0);
  });

  test("renders infrastructure score display", () => {
    render(<InfrastructureSecurityDashboard />);
    expect(screen.getAllByText(/Infrastructure Score/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/100/i).length).toBeGreaterThan(0);
  });

  test("renders all 5 navigation tabs", () => {
    render(<InfrastructureSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Security Posture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Server Hardening/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Container Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Network Segmentation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TLS & Cryptography/i })).toBeInTheDocument();
  });

  test("posture tab shows domain score cards", () => {
    render(<InfrastructureSecurityDashboard />);
    // Posture tab is active by default
    expect(screen.getAllByText(/Server Hardening/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Container Security/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Network Segmentation/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Environment Security/i)).toBeInTheDocument();
  });

  test("clicking Server Hardening tab shows hardening checks", () => {
    render(<InfrastructureSecurityDashboard />);
    const hardeningTab = screen.getByRole("button", { name: /Server Hardening/i });
    fireEvent.click(hardeningTab);
    expect(screen.getByText(/GIN_MODE Production Setting/i)).toBeInTheDocument();
    expect(screen.getByText(/JWT_SECRET Strength/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTPS & TLS Enforcement/i)).toBeInTheDocument();
  });

  test("hardening tab shows summary counts", () => {
    render(<InfrastructureSecurityDashboard />);
    const hardeningTab = screen.getByRole("button", { name: /Server Hardening/i });
    fireEvent.click(hardeningTab);
    expect(screen.getByText(/Passed/i)).toBeInTheDocument();
    expect(screen.getByText(/Warnings/i)).toBeInTheDocument();
    expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
  });

  test("clicking Container Security tab shows Docker checks", () => {
    render(<InfrastructureSecurityDashboard />);
    const dockerTab = screen.getByRole("button", { name: /Container Security/i });
    fireEvent.click(dockerTab);
    expect(screen.getByText(/Non-Root Container User/i)).toBeInTheDocument();
    expect(screen.getByText(/Read-Only Root Filesystem/i)).toBeInTheDocument();
    expect(screen.getByText(/No Privileged Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Limits/i)).toBeInTheDocument();
  });

  test("clicking Network Segmentation tab shows network zones", () => {
    render(<InfrastructureSecurityDashboard />);
    const netTab = screen.getByRole("button", { name: /Network Segmentation/i });
    fireEvent.click(netTab);
    expect(screen.getByText(/Internet DMZ/i)).toBeInTheDocument();
    expect(screen.getByText(/Application Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Management/i)).toBeInTheDocument();
  });

  test("network tab shows internet accessibility status", () => {
    render(<InfrastructureSecurityDashboard />);
    const netTab = screen.getByRole("button", { name: /Network Segmentation/i });
    fireEvent.click(netTab);
    // Data Layer and Application Layer should NOT be internet-accessible
    expect(screen.getAllByText(/🔒 No/i).length).toBeGreaterThanOrEqual(2);
  });

  test("clicking TLS tab shows TLS controls", () => {
    render(<InfrastructureSecurityDashboard />);
    const tlsTab = screen.getByRole("button", { name: /TLS & Cryptography/i });
    fireEvent.click(tlsTab);
    expect(screen.getByText(/TLS Version/i)).toBeInTheDocument();
    expect(screen.getByText(/HSTS Header/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Forward Secrecy/i).length).toBeGreaterThan(0);
  });

  test("TLS tab shows NIST standards", () => {
    render(<InfrastructureSecurityDashboard />);
    const tlsTab = screen.getByRole("button", { name: /TLS & Cryptography/i });
    fireEvent.click(tlsTab);
    expect(screen.getAllByText(/NIST/i).length).toBeGreaterThan(0);
  });

  test("hardening check expands on click to show description", () => {
    render(<InfrastructureSecurityDashboard />);
    const hardeningTab = screen.getByRole("button", { name: /Server Hardening/i });
    fireEvent.click(hardeningTab);
    // Click on the first hardening check to expand it
    const check = screen.getByText(/GIN_MODE Production Setting/i);
    fireEvent.click(check.closest("button")!);
    expect(screen.getByText(/Set GIN_MODE=release in production/i)).toBeInTheDocument();
  });
});
