import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UEBAAnalytics from "./UEBAAnalytics";

describe("UEBAAnalytics Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/ueba/anomalies")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              anomalies: [
                {
                  id: "ANOM-2026-001",
                  entity_id: "ENT-HOST-192-168-1-105",
                  entity_name: "192.168.1.105 (Workstation-A)",
                  anomaly_score: 94,
                  category: "Beaconing",
                  reason: "Strict 60.0s periodic outbound HTTPS communication",
                  observed_behaviour: "60 outbound connections",
                  expected_behaviour: "Sporadic web browsing",
                  deviation_percentage: 480.0,
                  related_alerts: ["ALT-8001"],
                  related_iocs: ["198.51.100.45"],
                  mitre_techniques: ["T1071"],
                  timestamp: new Date().toISOString(),
                  ai_explanation: "Automated periodic C2 beaconing.",
                  recommended_action: "Isolate host from VLAN.",
                },
              ],
            }),
        });
      }

      if (url.includes("/ueba")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_entities_monitored: 2,
              high_risk_entities_count: 2,
              active_anomalies_count: 1,
              risk_distribution: { CRITICAL: 1, HIGH: 1 },
              leaderboard: [
                {
                  id: "ENT-HOST-192-168-1-105",
                  entity_type: "HOST",
                  entity_name: "192.168.1.105 (Workstation-A)",
                  risk_score: 92,
                  risk_level: "CRITICAL",
                  baseline_conn_rate: 12.4,
                  baseline_packet_volume: 450000,
                  baseline_protocol_map: { HTTP: 3500 },
                  anomalies_count: 4,
                  last_active: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders UEBA Analytics header and Risk Leaderboard", async () => {
    render(<UEBAAnalytics />);

    await waitFor(() => {
      expect(screen.getByText(/User & Entity Behaviour Analytics/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Workstation-A/i).length).toBeGreaterThan(0);
    });
  });

  test("switches tabs to Anomaly Feed", async () => {
    render(<UEBAAnalytics />);

    await waitFor(() => {
      expect(screen.getByText(/User & Entity Behaviour Analytics/i)).toBeInTheDocument();
    });

    const anomalyTab = screen.getByRole("button", { name: /Anomaly Feed/i });
    fireEvent.click(anomalyTab);

    await waitFor(() => {
      expect(screen.getByText(/Strict 60.0s periodic outbound/i)).toBeInTheDocument();
    });
  });
});
