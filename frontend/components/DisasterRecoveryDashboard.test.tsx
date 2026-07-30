import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DisasterRecoveryDashboard from "./DisasterRecoveryDashboard";

describe("DisasterRecoveryDashboard", () => {
  test("renders header with Era 28 badge and DR readiness score", () => {
    render(<DisasterRecoveryDashboard />);
    expect(screen.getByText(/Backup, Disaster Recovery & Business Continuity/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 28 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/DR Readiness Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/100\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<DisasterRecoveryDashboard />);
    expect(screen.getByRole("button", { name: /Backup Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Backup History/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restore Validation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Disaster Recovery/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Business Continuity/i })).toBeInTheDocument();
  });

  test("overview tab shows RPO and RTO metrics", () => {
    render(<DisasterRecoveryDashboard />);
    expect(screen.getByText(/≤ 5 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/≤ 30 Minutes/i)).toBeInTheDocument();
  });

  test("clicking Backup History tab shows history table", () => {
    render(<DisasterRecoveryDashboard />);
    const tab = screen.getByRole("button", { name: /Backup History/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Cryptographic Backup Record Archive/i)).toBeInTheDocument();
    expect(screen.getByText(/BKP-2026-001/i)).toBeInTheDocument();
  });

  test("clicking Restore Validation tab shows simulation trigger", () => {
    render(<DisasterRecoveryDashboard />);
    const tab = screen.getByRole("button", { name: /Restore Validation/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Automated Sandbox Restore Verification Engine/i)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Execute Restore Test/i });
    expect(btn).toBeInTheDocument();
  });

  test("clicking Disaster Recovery tab shows service restoration order", () => {
    render(<DisasterRecoveryDashboard />);
    const tab = screen.getByRole("button", { name: /Disaster Recovery/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Service Restoration Sequence & Failover Readiness/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Vault & Cryptographic Secrets/i)).toBeInTheDocument();
  });

  test("clicking Business Continuity tab shows availability SLA", () => {
    render(<DisasterRecoveryDashboard />);
    const tab = screen.getByRole("button", { name: /Business Continuity/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Business Continuity Metrics & SLAs/i)).toBeInTheDocument();
    expect(screen.getByText(/99.99% SLA/i)).toBeInTheDocument();
  });
});
