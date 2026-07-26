import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIIncidentDesk from "./AIIncidentDesk";

describe("AIIncidentDesk Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/incidents/list")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              incidents: [
                {
                  id: "INC-2026-8001",
                  title: "Automated C2 Beaconing Event",
                  summary: "Host 192.168.1.105 demonstrated strict periodic HTTPS C2 beaconing.",
                  severity: "CRITICAL",
                  priority: "P1",
                  status: "INVESTIGATING",
                  assigned_analyst: "Lead SOC Engineer",
                  assigned_role: "Incident Commander",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  due_date: new Date().toISOString(),
                  affected_assets: ["192.168.1.105"],
                  related_alerts: ["ALT-8001"],
                  related_investigations: [],
                  related_iocs: ["198.51.100.45"],
                  mitre_techniques: ["T1071"],
                  timeline: [
                    {
                      id: "TL-001",
                      incident_id: "INC-2026-8001",
                      timestamp: new Date().toISOString(),
                      activity: "Detection Triggered",
                      category: "ALERT",
                      actor: "Detection Engine",
                      details: "Rule alert generated.",
                    },
                  ],
                  evidence: [
                    {
                      id: "EVD-001",
                      incident_id: "INC-2026-8001",
                      timestamp: new Date().toISOString(),
                      source: "Packet DPI",
                      type: "PACKET",
                      title: "60s TLS Handshake",
                      content: "Client Hello SNI",
                      related_entity: "192.168.1.105",
                      confidence: 0.98,
                    },
                  ],
                  resolution_notes: "",
                  sla: {
                    incident_id: "INC-2026-8001",
                    target_response_time_min: 15,
                    target_resolution_time_min: 60,
                    actual_response_time_min: 10,
                    actual_resolution_time_min: 0,
                    sla_status: "ON_TRACK",
                    remaining_minutes: 15,
                  },
                },
              ],
            }),
        });
      }

      if (url.includes("/incidents")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_incidents: 1,
              open_incidents: 1,
              critical_incidents: 1,
              sla_breach_count: 0,
              avg_mttr_minutes: 38,
              incidents_by_status: { INVESTIGATING: 1 },
              recent_incidents: [],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders AI Incident Management Desk header and Work Queue", async () => {
    render(<AIIncidentDesk />);

    await waitFor(() => {
      expect(screen.getByText(/AI Incident Management Desk/i)).toBeInTheDocument();
      expect(screen.getByText(/Automated C2 Beaconing Event/i)).toBeInTheDocument();
    });
  });

  test("switches tabs to Case Inspector", async () => {
    render(<AIIncidentDesk />);

    await waitFor(() => {
      expect(screen.getByText(/AI Incident Management Desk/i)).toBeInTheDocument();
    });

    const inspectorTab = screen.getByRole("button", { name: /Case Inspector/i });
    fireEvent.click(inspectorTab);

    await waitFor(() => {
      expect(screen.getByText(/Chronological Incident Timeline/i)).toBeInTheDocument();
    });
  });
});
