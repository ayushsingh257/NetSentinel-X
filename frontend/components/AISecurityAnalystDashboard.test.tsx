import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AISecurityAnalystDashboard from "./AISecurityAnalystDashboard";

describe("AISecurityAnalystDashboard", () => {
  test("renders header with Era 33 active badge and AI model badge", () => {
    render(<AISecurityAnalystDashboard />);
    expect(screen.getByText(/AI Security Analyst Subsystem/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 33 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Engine: NetSentinel-AI-v2/i)).toBeInTheDocument();
  });

  test("renders all 5 navigation tabs", () => {
    render(<AISecurityAnalystDashboard />);
    expect(screen.getByRole("button", { name: /Alert Explainer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Threat & Incident Summarizer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Attack Timeline & IOCs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MITRE ATT&CK Explainer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Threat Hunting Assistant/i })).toBeInTheDocument();
  });

  test("runs AI security analysis when clicking Run AI Security Analysis button", async () => {
    render(<AISecurityAnalystDashboard />);
    const runBtn = screen.getByRole("button", { name: /Run AI Security Analysis/i });
    fireEvent.click(runBtn);

    const resultTitle = await screen.findByText(/Brute Force & Privilege Escalation Attempt/i);
    expect(resultTitle).toBeInTheDocument();
  });

  test("switches tab to Threat Hunting Assistant and generates detection query", async () => {
    render(<AISecurityAnalystDashboard />);
    const tab = screen.getByRole("button", { name: /Threat Hunting Assistant/i });
    fireEvent.click(tab);

    const runBtn = screen.getByRole("button", { name: /Run AI Security Analysis/i });
    fireEvent.click(runBtn);

    const huntTitle = await screen.findByText(/Generated Sigma Threat Hunt Query/i);
    expect(huntTitle).toBeInTheDocument();
  });
});
