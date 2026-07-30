import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SecurityAuditReviewDashboard from "./SecurityAuditReviewDashboard";

describe("SecurityAuditReviewDashboard", () => {
  test("renders header with Era 31 badge and Zero Trust rating", () => {
    render(<SecurityAuditReviewDashboard />);
    expect(screen.getByText(/Enterprise DevSecOps & Zero Trust Security Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 31 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/100% COMPLIANT/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<SecurityAuditReviewDashboard />);
    expect(screen.getByRole("button", { name: /Threat Model \(STRIDE\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Risk Distribution/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Zero Trust Architecture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Audit Findings/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recommendations/i })).toBeInTheDocument();
  });

  test("threat model tab displays STRIDE metrics and category coverage", () => {
    render(<SecurityAuditReviewDashboard />);
    expect(screen.getByText(/14 Identified/i)).toBeInTheDocument();
    expect(screen.getByText(/S — Spoofing/i)).toBeInTheDocument();
  });

  test("clicking Risk Distribution tab shows severity counts", () => {
    render(<SecurityAuditReviewDashboard />);
    const tab = screen.getByRole("button", { name: /Risk Distribution/i });
    fireEvent.click(tab);
    expect(screen.getByText(/1 Mitigated/i)).toBeInTheDocument();
  });

  test("clicking Zero Trust Architecture tab shows NIST principles", () => {
    render(<SecurityAuditReviewDashboard />);
    const tab = screen.getByRole("button", { name: /Zero Trust Architecture/i });
    fireEvent.click(tab);
    expect(screen.getByText(/NIST SP 800-207 Zero Trust Principles Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Principle 1: Never Trust, Always Verify/i)).toBeInTheDocument();
  });

  test("clicking Audit Findings tab shows finding entries", () => {
    render(<SecurityAuditReviewDashboard />);
    const tab = screen.getByRole("button", { name: /Audit Findings/i });
    fireEvent.click(tab);
    expect(screen.getByText(/DevSecOps Audit Findings & Mitigations/i)).toBeInTheDocument();
    expect(screen.getByText(/Legacy Go dependency quic-go vulnerability \(GO-2026-5676\)/i)).toBeInTheDocument();
  });

  test("clicking Recommendations tab shows devsecops recommendations", () => {
    render(<SecurityAuditReviewDashboard />);
    const tab = screen.getByRole("button", { name: /Recommendations/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Enterprise DevSecOps Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Maintain continuous SAST\/SCA automated scanning on all GitHub pull requests\./i)).toBeInTheDocument();
  });
});
