import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AICopilot from "./AICopilot";

describe("AICopilot Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: "Explain this packet",
            summary: "Deep Packet Inspection (DPI) analysis reveals high-volume TCP traffic.",
            reasoning: ["Matched TCP handshake sequence."],
            evidence: [
              {
                type: "DPI Engine",
                description: "Captured packet metadata",
                value: "Bytes: 512 | Port: 443",
                timestamp: "2026-07-26T12:00:00Z",
              },
            ],
            confidence_score: 0.94,
            confidence_level: "HIGH",
            mitre_technique: "T1071 - Application Protocol",
            mitre_tactic: "Command and Control",
            affected_assets: ["192.168.1.105"],
            related_events: ["LOG-101"],
            recommended_actions: ["Apply rate limiting"],
            timestamp: "2026-07-26T12:00:00Z",
          }),
      })
    ) as jest.Mock;
  });

  test("renders Copilot drawer when isOpen is true", () => {
    render(<AICopilot isOpen={true} onClose={() => {}} />);

    const title = screen.getByText(/AI Security Copilot/i);
    expect(title).toBeInTheDocument();
  });

  test("does not render when isOpen is false", () => {
    render(<AICopilot isOpen={false} onClose={() => {}} />);

    const title = screen.queryByText(/AI Security Copilot/i);
    expect(title).not.toBeInTheDocument();
  });

  test("submits query and displays reasoning and evidence", async () => {
    render(<AICopilot isOpen={true} onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/Ask AI Copilot/i);
    fireEvent.change(input, { target: { value: "Explain this packet" } });

    const submitBtn = screen.getByLabelText("Send Query");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Deep Packet Inspection \(DPI\) analysis/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Matched TCP handshake sequence/i)).toBeInTheDocument();
    expect(screen.getByText(/MITRE: T1071 - Application Protocol/i)).toBeInTheDocument();
  });
});
