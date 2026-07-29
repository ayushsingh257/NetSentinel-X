import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CICDSecurityDashboard from "./CICDSecurityDashboard";

describe("CICDSecurityDashboard", () => {
  test("renders header with Era 26 badge", () => {
    render(<CICDSecurityDashboard />);
    expect(screen.getByText(/CI\/CD Security & Secure SDLC \(SSDLC\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 26 Active/i)).toBeInTheDocument();
  });

  test("renders SSDLC security score display", () => {
    render(<CICDSecurityDashboard />);
    expect(screen.getByText(/SSDLC Security Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/98\/100/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<CICDSecurityDashboard />);
    expect(screen.getByRole("button", { name: /Pipeline Security Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SAST Results/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dependency Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Container Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Software Bill of Materials \(SBOM\)/i })).toBeInTheDocument();
  });

  test("overview tab shows gate metrics", () => {
    render(<CICDSecurityDashboard />);
    expect(screen.getByText(/ALLOWED/i)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5 Gates/i)).toBeInTheDocument();
  });

  test("clicking SAST Results tab shows Semgrep findings", () => {
    render(<CICDSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /SAST Results/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Semgrep SAST Audit Results/i)).toBeInTheDocument();
    expect(screen.getByText(/go.lang.security.audit.sqli.string-formatted-query/i)).toBeInTheDocument();
  });

  test("clicking Dependency Security tab shows package CVE audit table", () => {
    render(<CICDSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Dependency Security/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Package CVE Vulnerability Scan/i)).toBeInTheDocument();
    expect(screen.getAllByText(/github.com\/gin-gonic\/gin/i).length).toBeGreaterThan(0);
  });

  test("clicking Container Security tab shows Trivy container table", () => {
    render(<CICDSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Container Security/i });
    fireEvent.click(tab);
    expect(screen.getByText(/Trivy Container Vulnerability Scan/i)).toBeInTheDocument();
    expect(screen.getAllByText(/netsentinel-backend:latest/i).length).toBeGreaterThan(0);
  });

  test("clicking SBOM tab shows package inventory table", () => {
    render(<CICDSecurityDashboard />);
    const tab = screen.getByRole("button", { name: /Software Bill of Materials \(SBOM\)/i });
    fireEvent.click(tab);
    expect(screen.getAllByText(/Software Bill of Materials \(SBOM\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/alpine-base-os/i)).toBeInTheDocument();
  });
});
