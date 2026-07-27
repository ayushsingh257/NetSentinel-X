import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ObservabilityDashboard from "./ObservabilityDashboard";

describe("ObservabilityDashboard Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/health")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              overall_score: 98,
              overall_status: "OPTIMAL",
              services: [
                {
                  name: "Backend API",
                  status: "HEALTHY",
                  uptime: 99.9,
                  latency_ms: 12,
                  last_check: new Date().toISOString(),
                  error_count: 0,
                  version: "2.0.0-Enterprise",
                },
              ],
              checked_at: new Date().toISOString(),
            }),
        });
      }

      if (url.includes("/audit")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              logs: [
                {
                  id: "AUD-1001",
                  timestamp: new Date().toISOString(),
                  user_id: "USR-001",
                  username: "Ayush",
                  role: "SOC_ADMIN",
                  action: "THREAT_HUNT_EXECUTED",
                  category: "THREAT_HUNT",
                  resource: "ThreatHuntingWorkspace",
                  resource_id: "HUNT-9901",
                  ip_address: "192.168.1.10",
                  user_agent: "Browser",
                  severity: "MEDIUM",
                  status: "SUCCESS",
                },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/metrics")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              api: { total_requests: 100000, avg_latency_ms: 15.0, failed_requests: 50, error_percentage: 0.05 },
              security: {
                alerts_processed: 50000,
                incidents_created: 10,
                threat_hunts_executed: 20,
                rules_triggered: 100,
                workflows_executed: 15,
                reports_generated: 5,
                active_iocs_monitored: 1000,
                ueba_anomalies_flagged: 12,
                timestamp: new Date().toISOString(),
              },
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders Observability Dashboard header and System Health", async () => {
    render(<ObservabilityDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Observability & Platform Health Studio/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Backend API/i).length).toBeGreaterThan(0);
    });
  });

  test("switches to Audit Explorer tab", async () => {
    render(<ObservabilityDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Observability & Platform Health Studio/i)).toBeInTheDocument();
    });

    const auditTab = screen.getByRole("button", { name: /Audit Explorer/i });
    fireEvent.click(auditTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search user, action, resource.../i)).toBeInTheDocument();
    });
  });

  test("switches to Platform Metrics tab", async () => {
    render(<ObservabilityDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Observability & Platform Health Studio/i)).toBeInTheDocument();
    });

    const metricsTab = screen.getByRole("button", { name: /Platform Metrics/i });
    fireEvent.click(metricsTab);

    await waitFor(() => {
      expect(screen.getByText(/Total Alerts Processed/i)).toBeInTheDocument();
    });
  });
});
