import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIDetectionOptimizer from "./AIDetectionOptimizer";

describe("AIDetectionOptimizer Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/optimizer/rules")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              performances: [
                {
                  rule_id: "RULE-SIGMA-001",
                  rule_name: "High Entropy DNS Tunneling Detection",
                  rule_type: "SIGMA",
                  executions_count: 1420,
                  true_positives_count: 28,
                  false_positives_count: 1,
                  false_positive_rate: 0.034,
                  performance_score: 94,
                  severity_accuracy: 0.96,
                  mitre_coverage_score: 0.95,
                  avg_response_time_ms: 0.12,
                  last_analyzed: new Date().toISOString(),
                },
              ],
            }),
        });
      }

      if (url.includes("/optimizer/recommendations")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              recommendations: [
                {
                  id: "REC-2026-001",
                  rule_id: "RULE-SIGMA-003",
                  rule_name: "Powershell Encoded Payload Execution",
                  category: "Asset Exclusion",
                  title: "Exclude Trusted Administrative Subnet",
                  description: "Internal IT management server 10.0.0.5 triggers noise.",
                  current_state: "All hosts evaluated.",
                  suggested_change: "Add src_ip != '10.0.0.5'",
                  expected_impact: "Reduces noise by 85%",
                  confidence_score: 0.95,
                  status: "PENDING",
                  created_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }

      if (url.includes("/optimizer/gaps")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              gaps: [
                {
                  id: "GAP-MITRE-T1003",
                  mitre_technique: "T1003 - OS Credential Dumping",
                  mitre_tactic: "Credential Access",
                  gap_title: "Uncovered LSASS Memory Read Attempt",
                  risk_severity: "CRITICAL",
                  observed_attack_pattern: "Process memory access targeting lsass.exe.",
                  recommended_rule_logic: "title: LSASS Process Memory Access",
                },
              ],
            }),
        });
      }

      if (url.includes("/optimizer")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_rules_analyzed: 1,
              avg_performance_score: 94,
              overall_false_positive_rate: 0.034,
              total_gaps_identified: 1,
              recommendations_count: 1,
              health_distribution: { OPTIMAL: 1 },
              top_recommendations: [],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  test("renders AI Detection Optimizer header and Rule Health", async () => {
    render(<AIDetectionOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/AI Detection Optimizer & Coverage Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/High Entropy DNS Tunneling Detection/i)).toBeInTheDocument();
    });
  });

  test("switches tabs to Tuning Recommendations", async () => {
    render(<AIDetectionOptimizer />);

    await waitFor(() => {
      expect(screen.getByText(/AI Detection Optimizer & Coverage Studio/i)).toBeInTheDocument();
    });

    const recTab = screen.getByRole("button", { name: /Tuning Recs/i });
    fireEvent.click(recTab);

    await waitFor(() => {
      expect(screen.getByText(/Exclude Trusted Administrative Subnet/i)).toBeInTheDocument();
    });
  });
});
