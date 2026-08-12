import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AISecurityAnalystDashboard from "./AISecurityAnalystDashboard";

describe("AISecurityAnalystDashboard Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/ai/analysis")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: "AI-1001",
                  event_id: "EVT-1001",
                  confidence_score: 0.96,
                  classification: "Malware",
                  category: "Malware",
                  risk_score: 95.5,
                  false_positive_prob: 0.04,
                  mitre_mapping: {
                    tactic: "Initial Access",
                    technique: "Exploit Public-Facing Application",
                    technique_id: "T1190",
                    description: "SQLi Exploit Payload",
                    mitigations: ["Deploy WAF"],
                  },
                  recommendations: ["Isolate host"],
                  created_at: new Date().toISOString(),
                  provider_name: "DeterministicSOCEngine",
                },
              ],
            }),
        });
      }

      if (url.includes("/ai/investigation")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              incident_id: "INC-2026-9901",
              incident_summary: "Autonomous Timeline Reconstruction Summary",
              attack_timeline: [
                {
                  timestamp: new Date().toISOString(),
                  stage: "Initial Access",
                  description: "HTTP SQLi payload detected targeting Web-Server-01",
                  source: "DPI Engine",
                },
              ],
              affected_assets: ["192.168.1.100 (Web-Server-01)"],
              related_events: ["EVT-1001"],
              recommended_actions: ["Isolate Web-Server-01 (192.168.1.100)"],
              generated_at: new Date().toISOString(),
            }),
        });
      }

      if (url.includes("/ai/copilot/chat")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              answer: "Incident Investigation Summary: Web application exploitation detected.",
              confidence: 0.95,
              related_techniques: ["T1190: Exploit Public-Facing Application"],
              recommended_actions: ["Isolate Web-Server-01"],
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders AI Security Analyst header and Provider-Agnostic badge", async () => {
    render(<AISecurityAnalystDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/AI Security Analyst & Autonomous Copilot/i)).toBeInTheDocument();
      expect(screen.getByText(/Phase 4 Provider-Agnostic Engine/i)).toBeInTheDocument();
    });
  });

  test("renders Autonomous Risk Score and AI Threat Classification", async () => {
    render(<AISecurityAnalystDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Autonomous Risk Scoring Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Malware/i)).toBeInTheDocument();
      expect(screen.getByText(/T1190 - Exploit Public-Facing Application/i)).toBeInTheDocument();
    });
  });

  test("renders AI Investigation Timeline and recommended actions", async () => {
    render(<AISecurityAnalystDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/AI Investigation Timeline Reconstruction/i)).toBeInTheDocument();
      expect(screen.getByText(/HTTP SQLi payload detected targeting Web-Server-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Isolate Web-Server-01 \(192.168.1.100\)/i)).toBeInTheDocument();
    });
  });

  test("interacts with SOC Security Copilot chat", async () => {
    render(<AISecurityAnalystDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/SOC Security Copilot/i)).toBeInTheDocument();
    });

    const quickBtn = screen.getByRole("button", { name: /What happened during this incident\?/i });
    fireEvent.click(quickBtn);

    await waitFor(() => {
      expect(screen.getByText(/Incident Investigation Summary: Web application exploitation detected./i)).toBeInTheDocument();
    });
  });
});
