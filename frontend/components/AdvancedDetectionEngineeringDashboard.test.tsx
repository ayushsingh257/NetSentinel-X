import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdvancedDetectionEngineeringDashboard from "./AdvancedDetectionEngineeringDashboard";

describe("AdvancedDetectionEngineeringDashboard", () => {
  test("renders header with Era 34 badge and MITRE coverage metric", () => {
    render(<AdvancedDetectionEngineeringDashboard />);
    expect(screen.getByText(/Advanced Detection Engineering Subsystem/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 34 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/MITRE Coverage: 88.5%/i)).toBeInTheDocument();
  });

  test("renders default rules inventory table", () => {
    render(<AdvancedDetectionEngineeringDashboard />);
    expect(screen.getByText(/Suspicious PowerShell Encoded Command Execution/i)).toBeInTheDocument();
    expect(screen.getByText(/Cobalt Strike Beacon Signature Match/i)).toBeInTheDocument();
    expect(screen.getByText(/High Velocity Failed Auth Throttling/i)).toBeInTheDocument();
  });

  test("switches tab to Rule Testing & Validation and executes test", () => {
    render(<AdvancedDetectionEngineeringDashboard />);
    const testTab = screen.getByRole("button", { name: /Rule Testing & Validation/i });
    fireEvent.click(testTab);

    const testBtn = screen.getByRole("button", { name: /Run Rule Validation & Test Match/i });
    fireEvent.click(testBtn);

    expect(screen.getByText(/Rule Syntax Valid/i)).toBeInTheDocument();
    expect(screen.getByText(/Matches Found: 1 pattern trigger\(s\) detected in payload\./i)).toBeInTheDocument();
  });

  test("switches tab to Backtest Simulation and renders historical metrics", () => {
    render(<AdvancedDetectionEngineeringDashboard />);
    const simTab = screen.getByRole("button", { name: /Backtest Simulation/i });
    fireEvent.click(simTab);

    expect(screen.getByText(/Backtest Historical Rule Simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/14 Detections/i)).toBeInTheDocument();
  });

  test("switches tab to Detection Analytics and renders metrics cards", () => {
    render(<AdvancedDetectionEngineeringDashboard />);
    const metricsTab = screen.getByRole("button", { name: /Detection Analytics & Metrics/i });
    fireEvent.click(metricsTab);

    expect(screen.getByText(/Total Active Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/142 Matches/i)).toBeInTheDocument();
  });
});
