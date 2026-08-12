import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ObservabilityDashboard from "./ObservabilityDashboard";

describe("ObservabilityDashboard Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/ai/analysis") || url.includes("/ai/investigation")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: "AI-1001",
                  event_id: "EVT-1001",
                  confidence_score: 0.94,
                  classification: "Malware",
                  category: "Malware",
                  risk_score: 92.5,
                  false_positive_prob: 0.05,
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
              incident_id: "INC-2026-9901",
              incident_summary: "Autonomous Incident Reconstruction Summary",
              attack_timeline: [
                { timestamp: new Date().toISOString(), stage: "Initial Access", description: "SQLi Payload", source: "DPI" },
              ],
              affected_assets: ["192.168.1.100"],
              related_events: ["EVT-1001"],
              recommended_actions: ["Isolate Web-Server-01"],
            }),
        });
      }

      if (url.includes("/events")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              events: [
                {
                  event_id: "EVT-1001-TEST",
                  type: "threat.detected",
                  severity: "critical",
                  source: "dpi-engine",
                  timestamp: new Date().toISOString(),
                  payload: { protocol: "TCP", dst_port: 445 },
                  metadata: { schema_version: "2.0" },
                  correlation_id: "CORR-9901",
                  status: "PROCESSED",
                },
              ],
              workers: [
                { name: "AlertEnrichmentWorker", status: "RUNNING", last_active: new Date().toISOString(), processed: 100, errors: 0 },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/health")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              overall_score: 98,
              overall_status: "OPTIMAL",
              cpu_usage_percent: 14.2,
              memory_usage_mb: 245.5,
              memory_usage_percent: 28.6,
              database_status: "HEALTHY",
              db_connection_pool_active: 8,
              redis_status: "HEALTHY",
              websocket_connected_clients: 12,
              event_processing_rate_cps: 4850,
              threat_engine_status: "OPTIMAL",
              threat_engine_latency_ms: 15,
              service_uptime_seconds: 86400,
              system_version: "2.0.0-Enterprise",
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

  test("switches to Event Bus Stream tab", async () => {
    render(<ObservabilityDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Observability & Platform Health Studio/i)).toBeInTheDocument();
    });

    const streamTab = screen.getByRole("button", { name: /Event Bus Stream/i });
    fireEvent.click(streamTab);

    await waitFor(() => {
      expect(screen.getByText(/Distributed Event-Driven Architecture Engine/i)).toBeInTheDocument();
    });
  });

  test("switches to AI Security Analyst tab", async () => {
    render(<ObservabilityDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Observability & Platform Health Studio/i)).toBeInTheDocument();
    });

    const aiTab = screen.getByRole("button", { name: /AI Security Analyst/i });
    fireEvent.click(aiTab);

    await waitFor(() => {
      expect(screen.getByText(/AI Security Analyst & Autonomous Copilot/i)).toBeInTheDocument();
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
