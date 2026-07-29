import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthorizationDashboard from "./AuthorizationDashboard";

describe("AuthorizationDashboard Component (Era 18)", () => {
  beforeEach(() => {
    // Clear mock storage
    localStorage.clear();
  });

  test("renders authorization dashboard title and stats", () => {
    render(<AuthorizationDashboard />);
    expect(
      screen.getByText(/Enterprise Authorization & Access Control/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Era 18 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Defined Roles/i)).toBeInTheDocument();
  });

  test("renders tabs and switches between tabs", () => {
    render(<AuthorizationDashboard />);

    const explorerTab = screen.getByRole("button", {
      name: /Permission Explorer/i,
    });
    const matrixTab = screen.getByRole("button", {
      name: /Access Control Matrix/i,
    });
    const violationsTab = screen.getByRole("button", {
      name: /Security Violations/i,
    });

    expect(explorerTab).toBeInTheDocument();
    expect(matrixTab).toBeInTheDocument();
    expect(violationsTab).toBeInTheDocument();

    // Switch to Access Control Matrix
    fireEvent.click(matrixTab);
    expect(screen.getByText(/Role Permission Matrix/i)).toBeInTheDocument();

    // Switch to Security Violations
    fireEvent.click(violationsTab);
    expect(
      screen.getByText(/Logged Security Violations & Escalation Attempts/i)
    ).toBeInTheDocument();
  });

  test("role switching updates permission explorer views", () => {
    render(<AuthorizationDashboard />);

    const superAdminBtn = screen.getByRole("button", { name: "SUPER_ADMIN" });
    const viewOnlyBtn = screen.getByRole("button", { name: "VIEW_ONLY" });

    expect(superAdminBtn).toBeInTheDocument();
    expect(viewOnlyBtn).toBeInTheDocument();

    // Switch to VIEW_ONLY
    fireEvent.click(viewOnlyBtn);
    expect(
      screen.getByText(/Allowed Actions for VIEW_ONLY/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Denied Actions for VIEW_ONLY/i)
    ).toBeInTheDocument();
  });

  test("matrix tab displays roles and columns", () => {
    render(<AuthorizationDashboard />);
    const matrixTab = screen.getByRole("button", {
      name: /Access Control Matrix/i,
    });
    fireEvent.click(matrixTab);

    expect(screen.getByText("SUPER_ADMIN")).toBeInTheDocument();
    expect(screen.getByText("SECURITY_ANALYST")).toBeInTheDocument();
    expect(screen.getByText("VIEW_ONLY")).toBeInTheDocument();
  });
});
