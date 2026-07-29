import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SecretsSecurityDashboard from "./SecretsSecurityDashboard";

describe("SecretsSecurityDashboard", () => {
  test("renders header with Era 22 badge", () => {
    render(<SecretsSecurityDashboard />);
    expect(screen.getByText(/Secrets Management & Cryptographic Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 22 Active/i)).toBeInTheDocument();
  });

  test("renders secrets security score display", () => {
    render(<SecretsSecurityDashboard />);
    expect(screen.getByText(/Secrets Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<SecretsSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Secret Posture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Secret Inventory/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rotation Management/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Leak Detection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cryptographic Posture/i })).toBeInTheDocument();
  });

  test("posture tab shows summary cards", () => {
    render(<SecretsSecurityDashboard />);
    expect(screen.getByText(/Active Secrets/i)).toBeInTheDocument();
    expect(screen.getByText(/Expiring Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Managed/i)).toBeInTheDocument();
  });

  test("clicking Secret Inventory tab shows table with registered secrets", () => {
    render(<SecretsSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Secret Inventory/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Production JWT Signing Key/i)).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL Master Database Credential/i)).toBeInTheDocument();
    expect(screen.getAllByText(/HASHICORP_VAULT/i).length).toBeGreaterThan(0);
  });

  test("clicking Rotation Management tab shows rotate buttons and rotates secret on click", () => {
    render(<SecretsSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Rotation Management/i });
    fireEvent.click(tab);
    expect(screen.getAllByText(/Rotate Secret/i).length).toBeGreaterThan(0);

    const rotateButtons = screen.getAllByRole("button", { name: /Rotate Secret/i });
    fireEvent.click(rotateButtons[0]);
    expect(screen.getByText(/successfully rotated/i)).toBeInTheDocument();
  });

  test("clicking Leak Detection tab shows leak findings", () => {
    render(<SecretsSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Leak Detection/i });
    fireEvent.click(tab);
    expect(screen.getByText(/JWT Bearer Token/i)).toBeInTheDocument();
    expect(screen.getAllByText(/API Key Prefix/i).length).toBeGreaterThan(0);
  });

  test("clicking Cryptographic Posture tab shows approved and prohibited algorithms", () => {
    render(<SecretsSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Cryptographic Posture/i });
    fireEvent.click(tab);
    expect(screen.getByText(/AES-256-GCM/i)).toBeInTheDocument();
    expect(screen.getByText(/ChaCha20-Poly1305/i)).toBeInTheDocument();
    expect(screen.getByText(/MD5/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PROHIBITED/i).length).toBeGreaterThan(0);
  });
});
