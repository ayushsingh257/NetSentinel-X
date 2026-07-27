import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecurityHardeningDashboard from "./SecurityHardeningDashboard";

describe("SecurityHardeningDashboard Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/security/posture")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              security_score: 96,
              authentication_status: "HEALTHY",
              api_protection_status: "HEALTHY",
              secrets_status: "HEALTHY",
              dependencies_status: "HEALTHY",
              container_status: "WARNING",
              active_sessions_count: 2,
              recent_security_events: [
                {
                  id: "SECEVT-901",
                  event_type: "FAILED_LOGIN",
                  severity: "MEDIUM",
                  source: "Auth Layer",
                  description: "Failed login",
                  ip_address: "185.220.101.45",
                  timestamp: new Date().toISOString(),
                },
              ],
              checked_at: new Date().toISOString(),
            }),
        });
      }

      if (url.includes("/security/rbac")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              assignments: [
                {
                  user_id: "USR-001",
                  username: "Ayush",
                  role: "SUPER_ADMIN",
                  permissions: ["VIEW_INCIDENTS", "CREATE_INCIDENTS"],
                },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/security/sessions")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              sessions: [
                {
                  session_id: "SES-1001",
                  user_id: "USR-001",
                  username: "Ayush",
                  role: "SUPER_ADMIN",
                  ip_address: "192.168.1.10",
                  user_agent: "Browser",
                  device_info: "Chrome",
                  login_time: new Date().toISOString(),
                  last_seen: new Date().toISOString(),
                  is_active: true,
                },
              ],
              total: 1,
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders Security Hardening header and Posture Overview", async () => {
    render(<SecurityHardeningDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Security Hardening & Production Readiness/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Authentication Hardening/i).length).toBeGreaterThan(0);
    });
  });

  test("switches to RBAC Explorer tab", async () => {
    render(<SecurityHardeningDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Security Hardening & Production Readiness/i)).toBeInTheDocument();
    });

    const rbacTab = screen.getByRole("button", { name: /RBAC Explorer/i });
    fireEvent.click(rbacTab);

    await waitFor(() => {
      expect(screen.getAllByText(/Role-Based Access Control Assignments/i).length).toBeGreaterThan(0);
    });
  });

  test("switches to Sessions tab", async () => {
    render(<SecurityHardeningDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Security Hardening & Production Readiness/i)).toBeInTheDocument();
    });

    const sessionsTab = screen.getByRole("button", { name: /Sessions/i });
    fireEvent.click(sessionsTab);

    await waitFor(() => {
      expect(screen.getAllByText(/Active User Sessions/i).length).toBeGreaterThan(0);
    });
  });
});
