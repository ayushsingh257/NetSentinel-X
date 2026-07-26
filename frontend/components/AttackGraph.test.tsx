import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AttackGraph from "./AttackGraph";

describe("AttackGraph Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/attack-graph")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              nodes: [
                { id: "NODE-EXT-IP-01", type: "EXTERNAL_IP", label: "185.220.101.45 (C2 Host)", threat_score: 96, risk_level: "CRITICAL" },
              ],
              edges: [
                { id: "EDGE-01", source: "NODE-EXT-IP-01", target: "NODE-DOM-01", relationship: "Connected To", confidence: 0.98, timestamp: new Date().toISOString() },
              ],
              critical_paths: [
                {
                  id: "PATH-2026-001",
                  path_name: "Critical C2 Attack Chain",
                  node_ids: ["NODE-EXT-IP-01"],
                  edge_ids: ["EDGE-01"],
                  severity: "CRITICAL",
                  path_risk_score: 96,
                  ai_explanation: "Attack originated from malicious IP.",
                  root_cause: "Compromised browser extension.",
                  attacker_objective: "Establish C2 channel.",
                  affected_assets: ["Workstation-A"],
                  recommended_containment: "Isolate Workstation-A.",
                },
              ],
              total_nodes: 1,
              total_edges: 1,
              global_max_risk_score: 96,
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders Attack Graph header and Topology Canvas", async () => {
    render(<AttackGraph />);

    await waitFor(() => {
      expect(screen.getByText(/Interactive Attack Graph & Threat Path Engine/i)).toBeInTheDocument();
      expect(screen.getAllByText(/185.220.101.45 \(C2 Host\)/i).length).toBeGreaterThan(0);
    });
  });

  test("switches tabs to Attack Paths", async () => {
    render(<AttackGraph />);

    await waitFor(() => {
      expect(screen.getByText(/Interactive Attack Graph & Threat Path Engine/i)).toBeInTheDocument();
    });

    const pathsTab = screen.getByRole("button", { name: /Attack Paths/i });
    fireEvent.click(pathsTab);

    await waitFor(() => {
      expect(screen.getByText(/Critical C2 Attack Chain/i)).toBeInTheDocument();
    });
  });
});
