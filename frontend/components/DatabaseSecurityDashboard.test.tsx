import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatabaseSecurityDashboard from "./DatabaseSecurityDashboard";

describe("DatabaseSecurityDashboard", () => {
  test("renders header with Era 23 badge", () => {
    render(<DatabaseSecurityDashboard />);
    expect(screen.getByText(/Database Security & Data Protection/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 23 Active/i)).toBeInTheDocument();
  });

  test("renders database security score display", () => {
    render(<DatabaseSecurityDashboard />);
    expect(screen.getByText(/Database Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/97\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<DatabaseSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Database Posture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Access Control/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Encryption Status/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Query Audit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Backup Security/i })).toBeInTheDocument();
  });

  test("posture tab shows cards and hardening checks", () => {
    render(<DatabaseSecurityDashboard />);
    expect(screen.getByText(/PostgreSQL 16/i)).toBeInTheDocument();
    expect(screen.getByText(/Port 5432 Network Isolation/i)).toBeInTheDocument();
  });

  test("clicking Access Control tab shows roles and classified data fields", () => {
    render(<DatabaseSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Access Control/i });
    fireEvent.click(tab);
    expect(screen.getByText(/application_user/i)).toBeInTheDocument();
    expect(screen.getByText(/readonly_audit_user/i)).toBeInTheDocument();
    expect(screen.getByText(/password_hash/i)).toBeInTheDocument();
    expect(screen.getAllByText(/RESTRICTED/i).length).toBeGreaterThan(0);
  });

  test("clicking Encryption Status tab shows AES-256 and TLS 1.3 info", () => {
    render(<DatabaseSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Encryption Status/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Data At Rest Encryption/i)).toBeInTheDocument();
    expect(screen.getByText(/Data In Transit Encryption/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AES-256-GCM/i).length).toBeGreaterThan(0);
  });

  test("clicking Query Audit tab shows database audit actions", () => {
    render(<DatabaseSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Query Audit/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Recent Database Action Logs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/application_user/i).length).toBeGreaterThan(0);
  });

  test("clicking Backup Security tab shows backup status and restore test", () => {
    render(<DatabaseSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Backup Security/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Database Backup Security Posture/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PASSED/i).length).toBeGreaterThan(0);
  });
});
