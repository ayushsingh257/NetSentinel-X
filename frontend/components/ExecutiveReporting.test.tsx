import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExecutiveReporting from "./ExecutiveReporting";

describe("ExecutiveReporting Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/compliance")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              frameworks: {
                SOC2: { framework: "SOC2", overall_status: "COMPLIANT", passed_controls: 24, total_controls: 24, compliance_score: 100, control_gaps: [] },
              },
            }),
        });
      }

      if (url.includes("/reports")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              reports: [
                {
                  id: "REP-2026-001",
                  title: "Q3 Executive Security Posture",
                  type: "EXECUTIVE",
                  ai_summary: "Isolated C2 beaconing with zero downtime.",
                  business_impact: "Zero data breach loss.",
                  security_score: 94,
                  threat_overview: "Analyzed 1.4M packets.",
                  control_coverage_map: { "Access Control": 98 },
                  compliance_status_map: { "SOC 2": "COMPLIANT" },
                  generated_at: new Date().toISOString(),
                  generated_by: "AI Security Analyst",
                  export_formats_available: ["PDF", "HTML"],
                  evidence_items_count: 14,
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

  test("renders Executive Reporting header and Report Library", async () => {
    render(<ExecutiveReporting />);

    await waitFor(() => {
      expect(screen.getByText(/Executive Reporting & Compliance Engine/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Q3 Executive Security Posture/i).length).toBeGreaterThan(0);
    });
  });

  test("switches tabs to Compliance Frameworks", async () => {
    render(<ExecutiveReporting />);

    await waitFor(() => {
      expect(screen.getByText(/Executive Reporting & Compliance Engine/i)).toBeInTheDocument();
    });

    const compTab = screen.getByRole("button", { name: /Compliance Frameworks/i });
    fireEvent.click(compTab);

    await waitFor(() => {
      expect(screen.getByText(/SOC2 Audit/i)).toBeInTheDocument();
    });
  });
});
