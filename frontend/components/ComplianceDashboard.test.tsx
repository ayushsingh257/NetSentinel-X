import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ComplianceDashboard from "./ComplianceDashboard";

describe("ComplianceDashboard", () => {
  test("renders header with Era 29 badge and compliance index", () => {
    render(<ComplianceDashboard />);
    expect(screen.getByText(/Privacy, Data Governance & Compliance Framework/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 29 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Compliance Index:/i)).toBeInTheDocument();
    expect(screen.getByText(/96\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<ComplianceDashboard />);
    expect(screen.getByRole("button", { name: /Compliance Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Data Classification/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PII Protection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retention Management/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Audit Compliance/i })).toBeInTheDocument();
  });

  test("overview tab shows SOC 2, ISO 27001, and GDPR readiness scores", () => {
    render(<ComplianceDashboard />);
    expect(screen.getByText(/96% Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/98% Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/95% Ready/i)).toBeInTheDocument();
  });

  test("clicking Data Classification tab shows classification levels", () => {
    render(<ComplianceDashboard />);
    const tab = screen.getByRole("button", { name: /Data Classification/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Enterprise Data Classification Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/db.user_credentials/i)).toBeInTheDocument();
  });

  test("clicking PII Protection tab shows PII table", () => {
    render(<ComplianceDashboard />);
    const tab = screen.getByRole("button", { name: /PII Protection/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Personally Identifiable Information \(PII\) Findings & Masking/i)).toBeInTheDocument();
    expect(screen.getByText(/a\*\*\*\*\*@netsentinel.internal/i)).toBeInTheDocument();
  });

  test("clicking Retention Management tab shows retention policies", () => {
    render(<ComplianceDashboard />);
    const tab = screen.getByRole("button", { name: /Retention Management/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Data Retention Policies & Secure Expiration Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/365 Days/i)).toBeInTheDocument();
  });

  test("clicking Audit Compliance tab shows audit events", () => {
    render(<ComplianceDashboard />);
    const tab = screen.getByRole("button", { name: /Audit Compliance/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Privacy Audit Trail & Access Log/i)).toBeInTheDocument();
    expect(screen.getByText(/PRIVACY_DATA_ACCESSED/i)).toBeInTheDocument();
  });
});
