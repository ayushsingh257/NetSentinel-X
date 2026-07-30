import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SecurityCertificationDashboard from "./SecurityCertificationDashboard";

describe("SecurityCertificationDashboard", () => {
  test("renders header with Era 30 badge and security rating", () => {
    render(<SecurityCertificationDashboard />);
    expect(screen.getByText(/Final Enterprise Security Validation & Certification/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 30 Certified/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ENTERPRISE READY/i)[0]).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<SecurityCertificationDashboard />);
    expect(screen.getByRole("button", { name: /Enterprise Security Score/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Security Audit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /OWASP Validation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Attack Simulation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Certification Report/i })).toBeInTheDocument();
  });

  test("enterprise score tab displays overall score and category breakdown", () => {
    render(<SecurityCertificationDashboard />);
    expect(screen.getByText(/98 \/ 100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ENTERPRISE READY/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Identity Security \(20%\)/i)[0]).toBeInTheDocument();
  });

  test("clicking Security Audit tab shows audit checks table", () => {
    render(<SecurityCertificationDashboard />);
    const tab = screen.getByRole("button", { name: /Security Audit/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Automated Security Audit Findings/i)).toBeInTheDocument();
    expect(screen.getByText(/RS256 JWT Signature Validation/i)).toBeInTheDocument();
  });

  test("clicking OWASP Validation tab shows OWASP Top 10 checklist", () => {
    render(<SecurityCertificationDashboard />);
    const tab = screen.getByRole("button", { name: /OWASP Validation/i });
    fireEvent.click(tab);
    expect(screen.getByText(/OWASP Top 10:2021 Security Validation Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Broken Access Control/i)).toBeInTheDocument();
  });

  test("clicking Attack Simulation tab shows simulated attacks", () => {
    render(<SecurityCertificationDashboard />);
    const tab = screen.getByRole("button", { name: /Attack Simulation/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Penetration Test & Safe Attack Vector Simulations/i)).toBeInTheDocument();
    expect(screen.getByText(/BRUTE_FORCE_AUTH_SIMULATION/i)).toBeInTheDocument();
  });

  test("clicking Certification Report tab shows enterprise badge", () => {
    render(<SecurityCertificationDashboard />);
    const tab = screen.getByRole("button", { name: /Certification Report/i });
    fireEvent.click(tab);
    expect(screen.getByText(/ENTERPRISE CERTIFIED BADGE/i)).toBeInTheDocument();
    expect(screen.getByText(/NetSentinel-X V2 Production Certification Signed Off/i)).toBeInTheDocument();
  });
});
