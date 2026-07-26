import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ThreatInvestigation from "./ThreatInvestigation";

describe("ThreatInvestigation Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/generate")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "INV-2026-999",
              title: "AI Threat Story: Anomalous Traffic Chain on 192.168.1.105",
              severity: "HIGH",
              confidence_score: 0.94,
              confidence_level: "HIGH",
              mitre_technique: "T1110.001 - Password Guessing",
              mitre_tactic: "Credential Access",
              affected_assets: ["192.168.1.105"],
              status: "OPEN",
              created_at: "2026-07-26T12:00:00Z",
              threat_story: "At 14:32:05 UTC, internal host 192.168.1.105 triggered threat correlation sequence.",
              root_cause: "High-velocity TCP connection attempts targeting restricted service ports.",
              timeline: [
                {
                  step: 1,
                  title: "Telemetry Stream Ingestion",
                  description: "Captured packet payload via eBPF DPI engine.",
                  protocol: "TCP",
                  source_ip: "192.168.1.105",
                  dest_ip: "10.0.0.1",
                  timestamp: "2026-07-26T12:00:00Z",
                  severity: "INFO",
                },
              ],
              evidence: [
                {
                  id: "EV-999",
                  source: "Go DPI Dissector",
                  type: "Packet Telemetry Log",
                  description: "Recorded multi-protocol traffic",
                  value: "Protocol: TCP | Status: FLAGGED",
                  timestamp: "2026-07-26T12:00:00Z",
                },
              ],
              recommended_actions: ["Isolate asset 192.168.1.105"],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            investigations: [
              {
                id: "INV-2026-001",
                title: "DNS Tunneling & C2 Exfiltration Sequence",
                severity: "HIGH",
                confidence_score: 0.96,
                confidence_level: "CRITICAL",
                mitre_technique: "T1048.003 - Exfiltration Over Alternative Protocol",
                mitre_tactic: "Exfiltration",
                affected_assets: ["192.168.1.105"],
                status: "OPEN",
                created_at: "2026-07-26T12:00:00Z",
                threat_story: "At 14:32:05 UTC, internal host 192.168.1.105 initiated high-frequency DNS query bursts.",
                root_cause: "Compromised internal workstation workstation-A executing DNS bypass payload.",
                timeline: [
                  {
                    step: 1,
                    title: "Initial Network Socket Connection",
                    description: "Host 192.168.1.105 established UDP socket.",
                    protocol: "UDP",
                    source_ip: "192.168.1.105",
                    dest_ip: "8.8.8.8",
                    timestamp: "2026-07-26T12:00:00Z",
                    severity: "INFO",
                  },
                ],
                evidence: [
                  {
                    id: "EV-101",
                    source: "DPI Dissector",
                    type: "DNS TXT Payload",
                    description: "Captured sub-domain lookup with encoded payload chunk",
                    value: "malicious-c2-beacon.example-tunnel.org",
                    timestamp: "2026-07-26T12:00:00Z",
                  },
                ],
                recommended_actions: ["Quarantine host 192.168.1.105"],
              },
            ],
            total: 1,
          }),
      });
    }) as jest.Mock;
  });

  test("renders AI Threat Investigation Engine heading", async () => {
    render(<ThreatInvestigation />);

    await waitFor(() => {
      expect(screen.getByText(/AI Threat Investigation Engine/i)).toBeInTheDocument();
      expect(screen.getAllByText(/DNS Tunneling & C2 Exfiltration Sequence/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Initial Network Socket Connection/i)).toBeInTheDocument();
      expect(screen.getByText(/Quarantine host 192.168.1.105/i)).toBeInTheDocument();
    });
  });

  test("handles Generate Investigation button click", async () => {
    render(<ThreatInvestigation />);

    const generateBtn = await screen.findByText(/Generate Investigation/i);
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Anomalous Traffic Chain on 192.168.1.105/i)).toBeInTheDocument();
    });
  });
});
