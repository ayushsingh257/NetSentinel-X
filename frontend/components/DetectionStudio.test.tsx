import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DetectionStudio from "./DetectionStudio";

describe("DetectionStudio Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/rules")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              rules: [
                {
                  id: "RULE-SIGMA-001",
                  name: "High Entropy DNS Tunneling Detection",
                  description: "Detects rapid DNS TXT queries.",
                  author: "SOC Team",
                  severity: "CRITICAL",
                  type: "SIGMA",
                  mitre_technique: "T1048.003",
                  mitre_tactic: "Exfiltration",
                  logic: "selection: dst_port: 53",
                  status: "ENABLED",
                  version: "1.0.0",
                  detection_count: 29,
                  false_positive_rate: 0.02,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }

      if (url.includes("/analytics")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_rules: 1,
              active_rules: 1,
              total_detections: 29,
              avg_false_positive: 0.02,
              mitre_coverage: 92.5,
              most_triggered_rules: ["RULE-SIGMA-001 (29)"],
            }),
        });
      }

      if (url.includes("/simulate")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              matched: true,
              rule_name: "Test Rule",
              severity: "CRITICAL",
              mitre_technique: "T1048.003",
              affected_asset: "192.168.1.105",
              evidence: "Pattern matched",
              confidence_score: 0.94,
              execution_time_ms: 0.15,
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders Detection Engineering Studio header and rules", async () => {
    render(<DetectionStudio />);

    await waitFor(() => {
      expect(screen.getByText(/Detection Engineering Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/High Entropy DNS Tunneling Detection/i)).toBeInTheDocument();
    });
  });

  test("switches tabs to Simulation Sandbox and executes simulation", async () => {
    render(<DetectionStudio />);

    await waitFor(() => {
      expect(screen.getByText(/Detection Engineering Studio/i)).toBeInTheDocument();
    });

    const sandboxTab = screen.getByRole("button", { name: /Simulation Sandbox/i });
    fireEvent.click(sandboxTab);

    await waitFor(() => {
      expect(screen.getByText(/Execute Rule Simulation/i)).toBeInTheDocument();
    });

    const simBtn = screen.getByRole("button", { name: /Execute Rule Simulation/i });
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(screen.getByText(/RULE MATCHED/i)).toBeInTheDocument();
    });
  });
});
