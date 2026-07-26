import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ThreatIntelFusion from "./ThreatIntelFusion";

describe("ThreatIntelFusion Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/intelligence/ioc") || url.includes("/intelligence/ip")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "IOC-IP-192-168-1-105",
              type: "IP",
              value: "192.168.1.105",
              threat_score: 95,
              risk_level: "CRITICAL",
              confidence: 0.98,
              first_seen: new Date().toISOString(),
              last_seen: new Date().toISOString(),
              country: "United States",
              asn: "AS15169",
              organization: "Google LLC",
              reputation: "Malicious Scanning",
              categories: ["Command & Control"],
              related_threats: ["APT29"],
              mitre_techniques: ["T1071"],
              related_alerts: ["ALT-8001"],
              related_investigations: ["INV-2026-001"],
              provider_results: {
                VirusTotal: {
                  provider_name: "VirusTotal",
                  status: "MALICIOUS",
                  score: 48.0,
                  category: "C2 Server",
                  details: "48/72 engines flagged as malicious",
                  last_queried: new Date().toISOString(),
                },
              },
              ai_explanation: "High-risk IP address demonstrating active C2 beaconing.",
              recommended_actions: ["Isolate host"],
              updated_at: new Date().toISOString(),
            }),
        });
      }

      if (url.includes("/intelligence")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_iocs_enriched: 2,
              high_risk_iocs: 2,
              active_providers_count: 8,
              top_attacked_domains: ["malicious-c2-beacon.example-tunnel.org"],
              top_attacked_ips: ["192.168.1.105"],
              provider_health: { VirusTotal: true },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders Threat Intelligence Fusion Engine header and loaded IOC", async () => {
    render(<ThreatIntelFusion />);

    await waitFor(() => {
      expect(screen.getByText(/Threat Intelligence Fusion Engine/i)).toBeInTheDocument();
      expect(screen.getAllByText(/192.168.1.105/i).length).toBeGreaterThan(0);
    });
  });

  test("allows searching for a new IOC indicator", async () => {
    render(<ThreatIntelFusion />);

    await waitFor(() => {
      expect(screen.getByText(/Threat Intelligence Fusion Engine/i)).toBeInTheDocument();
    });

    const enrichBtn = screen.getByRole("button", { name: /Enrich IOC/i });
    fireEvent.click(enrichBtn);

    await waitFor(() => {
      expect(screen.getByText(/Composite Threat Score/i)).toBeInTheDocument();
    });
  });
});
