import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkflowAutomation from "./WorkflowAutomation";

describe("WorkflowAutomation Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/workflows/history")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              executions: [
                {
                  id: "EXEC-2026-001",
                  workflow_id: "WF-001",
                  workflow_name: "Automated C2 Beaconing Isolation Playbook",
                  trigger_event: "Rule fired",
                  status: "COMPLETED",
                  steps: [],
                  current_step: 3,
                  started_at: new Date().toISOString(),
                  logs: ["Log 1"],
                },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/workflows/approvals")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              approvals: [
                {
                  id: "APP-101",
                  execution_id: "EXEC-2026-002",
                  workflow_name: "Ransomware & Lateral Movement Containment",
                  step_name: "Isolate Production DB Host",
                  action: "SIMULATED_HOST_ISOLATION",
                  requester: "Autonomous Playbook Engine",
                  status: "PENDING",
                  requested_at: new Date().toISOString(),
                },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/workflows")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              workflows: [
                {
                  id: "WF-001",
                  name: "Automated C2 Beaconing Isolation Playbook",
                  description: "Autonomously detects C2 beaconing.",
                  category: "C2_BEACONING",
                  status: "ACTIVE",
                  trigger: { id: "T1", type: "DETECTION_RULE", source: "Rule", condition: "Risk >= 85" },
                  steps: [
                    { id: "S1", name: "Triage Alert", action_type: "NOTIFY_TEAM", parameters: {}, status: "COMPLETED" },
                  ],
                  created_by: "Analyst",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              total: 1,
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders Workflow Automation header and Playbook Library", async () => {
    render(<WorkflowAutomation />);

    await waitFor(() => {
      expect(screen.getByText(/AI Workflow Automation & Autonomous SOC Playbooks/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Automated C2 Beaconing Isolation Playbook/i).length).toBeGreaterThan(0);
    });
  });

  test("switches to Execution History tab", async () => {
    render(<WorkflowAutomation />);

    await waitFor(() => {
      expect(screen.getByText(/AI Workflow Automation & Autonomous SOC Playbooks/i)).toBeInTheDocument();
    });

    const historyTab = screen.getByRole("button", { name: /Execution History/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText(/Workflow Execution Logs & Audit History/i)).toBeInTheDocument();
    });
  });

  test("switches to Approvals tab", async () => {
    render(<WorkflowAutomation />);

    await waitFor(() => {
      expect(screen.getByText(/AI Workflow Automation & Autonomous SOC Playbooks/i)).toBeInTheDocument();
    });

    const approvalsTab = screen.getByRole("button", { name: /Approvals/i });
    fireEvent.click(approvalsTab);

    await waitFor(() => {
      expect(screen.getByText(/Analyst Manual Approval Queue/i)).toBeInTheDocument();
    });
  });
});
