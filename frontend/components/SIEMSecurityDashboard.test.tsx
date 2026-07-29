import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SIEMSecurityDashboard from "./SIEMSecurityDashboard";

describe("SIEMSecurityDashboard", () => {
  test("renders header with Era 25 badge", () => {
    render(<SIEMSecurityDashboard />);
    expect(screen.getByText(/SIEM-Grade Security Monitoring & Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 25 Active/i)).toBeInTheDocument();
  });

  test("renders SIEM monitoring score display", () => {
    render(<SIEMSecurityDashboard />);
    expect(screen.getByText(/SIEM Monitoring Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/99\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<SIEMSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Security Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Security Events/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Threat Detection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Alert Management/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log Integrity/i })).toBeInTheDocument();
  });

  test("overview tab shows metrics and controls", () => {
    render(<SIEMSecurityDashboard />);
    expect(screen.getByText(/CHAIN VALID/i)).toBeInTheDocument();
    expect(screen.getByText(/1,250 Events/i)).toBeInTheDocument();
  });

  test("clicking Security Events tab shows event table", () => {
    render(<SIEMSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Security Events/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Normalized Security Event Stream/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ayush/i).length).toBeGreaterThan(0);
  });

  test("clicking Threat Detection tab shows threat correlation rules", () => {
    render(<SIEMSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Threat Detection/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Brute Force Detection Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Privilege Escalation Detector/i)).toBeInTheDocument();
  });

  test("clicking Alert Management tab shows active alerts and resolve button", () => {
    render(<SIEMSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Alert Management/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Active SIEM Threat Alerts/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Resolve/i).length).toBeGreaterThan(0);
  });

  test("clicking Log Integrity tab shows hash chain validation status", () => {
    render(<SIEMSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Log Integrity/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Cryptographic Hash Chain Integrity Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Hash Chain: VALID/i)).toBeInTheDocument();
  });
});
