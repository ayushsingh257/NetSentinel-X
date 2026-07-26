import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ThreatHuntingWorkspace from "./ThreatHuntingWorkspace";

describe("ThreatHuntingWorkspace Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/hunting/query")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query_text: "dns tunneling",
              hypothesis: "AI hypothesis: C2 activity detected.",
              matched_events: [],
              ioc_matches: [],
              replay_sequence: [],
              risk_explanation: "High confidence pattern identified.",
              investigation_steps: ["Step 1: Isolate host.", "Step 2: Review UEBA baseline."],
              confidence_score: 92,
            }),
        });
      }

      if (url.includes("/history")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              events: [
                {
                  id: "HE-001",
                  event_type: "ALERT",
                  source: "185.220.101.45",
                  destination: "192.168.1.105",
                  protocol: "HTTPS",
                  risk_score: 95,
                  mitre_technique: "T1071.001",
                  description: "Outbound C2 beaconing detected.",
                  timestamp: new Date().toISOString(),
                  related_ioc: "185.220.101.45",
                  related_incident: "INC-2026-8001",
                },
              ],
              total: 1,
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders Threat Hunting Workspace header and Event History", async () => {
    render(<ThreatHuntingWorkspace />);

    await waitFor(() => {
      expect(screen.getByText(/Historical Investigation & AI Threat Hunting Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Outbound C2 beaconing detected./i)).toBeInTheDocument();
    });
  });

  test("switches to AI Hunt tab", async () => {
    render(<ThreatHuntingWorkspace />);

    await waitFor(() => {
      expect(screen.getByText(/Historical Investigation & AI Threat Hunting Engine/i)).toBeInTheDocument();
    });

    const huntTab = screen.getByRole("button", { name: /AI Hunt/i });
    fireEvent.click(huntTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Find all suspicious DNS tunneling events/i)).toBeInTheDocument();
    });
  });

  test("switches to Attack Replay tab", async () => {
    render(<ThreatHuntingWorkspace />);

    await waitFor(() => {
      expect(screen.getByText(/Historical Investigation & AI Threat Hunting Engine/i)).toBeInTheDocument();
    });

    const replayTab = screen.getByRole("button", { name: /Attack Replay/i });
    fireEvent.click(replayTab);

    await waitFor(() => {
      expect(screen.getByText(/Attack Chain Replay/i)).toBeInTheDocument();
    });
  });
});
