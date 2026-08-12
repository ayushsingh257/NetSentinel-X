import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SOARDashboard from "./SOARDashboard";

describe("SOARDashboard Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/soar/playbooks")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              playbooks: [
                {
                  id: "PB-BRUTE-FORCE-01",
                  name: "Automated Brute Force Mitigation Playbook",
                  description: "Autonomously blocks malicious source IPs",
                  category: "CREDENTIAL_ABUSE",
                  trigger_event: "threat.detected",
                  severity_threshold: "HIGH",
                  risk_threshold: 70.0,
                  enabled: true,
                  created_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }

      if (url.includes("/soar/executions")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              executions: [
                {
                  execution_id: "EXEC-1001",
                  playbook_id: "PB-BRUTE-FORCE-01",
                  playbook_name: "Automated Brute Force Mitigation Playbook",
                  event_id: "EVT-1001",
                  status: "AWAITING_APPROVAL",
                  started_at: new Date().toISOString(),
                  result: "Step 1 executed. Step 2 pending approval.",
                  logs: ["Step 1 completed"],
                },
              ],
            }),
        });
      }

      if (url.includes("/soar/approvals")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              approvals: [
                {
                  id: "APR-9901",
                  execution_id: "EXEC-1001",
                  playbook_name: "Automated Brute Force Mitigation Playbook",
                  action_type: "DISABLE_USER",
                  target: "user_ayush",
                  risk_level: "HIGH",
                  requested_at: new Date().toISOString(),
                  status: "PENDING",
                },
              ],
            }),
        });
      }

      if (url.includes("/soar/audit")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              audit_logs: [
                {
                  log_id: "SOAR-AUD-1001",
                  execution_id: "EXEC-1001",
                  playbook_name: "Automated Brute Force Mitigation Playbook",
                  action_type: "BLOCK_IP",
                  target: "198.51.100.42",
                  triggered_by: "AI_THREAT_ENGINE",
                  ai_reasoning: "Brute force detected",
                  approval_status: "AUTO_APPROVED",
                  executed_by: "SOAR_DISPATCHER",
                  timestamp: new Date().toISOString(),
                  hmac_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                },
              ],
            }),
        });
      }

      if (url.includes("/approve")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Approved" }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders SOAR Dashboard header and Human Approval Queue", async () => {
    render(<SOARDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Autonomous Security Orchestration & Response \(SOAR\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Human Approval Queue/i)).toBeInTheDocument();
    });
  });

  test("renders Registered Response Playbooks and Execution History", async () => {
    render(<SOARDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText(/Automated Brute Force Mitigation Playbook/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Playbook Execution History/i)).toBeInTheDocument();
    });
  });

  test("approves action when clicking Approve Execution button", async () => {
    render(<SOARDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Approve Execution/i })).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole("button", { name: /Approve Execution/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/approve"), expect.any(Object));
    });
  });
});
