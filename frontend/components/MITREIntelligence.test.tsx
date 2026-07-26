import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MITREIntelligence from "./MITREIntelligence";

describe("MITREIntelligence Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/matrix")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              matrix: [
                {
                  tactic_name: "Initial Access",
                  techniques: [
                    {
                      id: "T1190",
                      name: "Exploit Public-Facing Application",
                      tactic: "Initial Access",
                      description: "Adversaries attempt to exploit applications.",
                      detection_count: 18,
                      risk_level: "HIGH",
                      confidence_score: 0.92,
                      affected_hosts: ["192.168.1.100"],
                      current_alerts: ["ALT-1002"],
                      related_investigations: ["INV-2026-003"],
                      ai_explanation: "Exploitation enables intrusion.",
                      mitigation_guidance: "Apply WAF rules.",
                      reference_links: ["https://attack.mitre.org/techniques/T1190/"],
                    },
                  ],
                },
              ],
              total_tactics: 1,
            }),
        });
      }

      if (url.includes("/statistics")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_techniques_mapped: 12,
              active_tactics_count: 12,
              high_risk_techniques: 8,
              top_attacked_host: "192.168.1.105",
              overall_posture_score: 86.4,
            }),
        });
      }

      if (url.includes("/heatmap")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              most_triggered_techniques: ["T1071 (68)", "T1110 (45)"],
              most_active_tactics: ["Command & Control", "Credential Access"],
              most_attacked_hosts: ["192.168.1.105"],
              severity_distribution: { HIGH: 6 },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders MITRE ATT&CK Matrix heading and techniques", async () => {
    render(<MITREIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise MITRE ATT&CK Intelligence Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Exploit Public-Facing Application/i)).toBeInTheDocument();
    });
  });

  test("switches between Matrix Grid and Heat Map views", async () => {
    render(<MITREIntelligence />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise MITRE ATT&CK Intelligence Engine/i)).toBeInTheDocument();
    });

    const heatmapBtn = screen.getByRole("button", { name: /Heat Map/i });
    fireEvent.click(heatmapBtn);

    await waitFor(() => {
      expect(screen.getByText(/Most Triggered Techniques/i)).toBeInTheDocument();
    });
  });
});
