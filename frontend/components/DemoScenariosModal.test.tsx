import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DemoScenariosModal from "./DemoScenariosModal";

describe("DemoScenariosModal Component", () => {
  beforeAll(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/demo/scenarios")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              scenarios: [
                {
                  id: "SCENARIO-C2-BEACON",
                  name: "Command & Control (C2) Beaconing Attack",
                  category: "C2_COMMUNICATION",
                  severity: "CRITICAL",
                  description: "Simulates C2 beaconing",
                  attack_flow: ["Step 1", "Step 2"],
                  target_host: "192.168.1.105",
                  attacker_ip: "185.220.101.5",
                },
              ],
              total: 1,
            }),
        });
      }

      if (url.includes("/demo/load")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              scenario_id: "SCENARIO-C2-BEACON",
              scenario_name: "Command & Control (C2) Beaconing Attack",
              status: "SUCCESSFULLY_LOADED",
              alerts_count: 5,
              incident_id: "INC-8899",
              loaded_at: new Date().toISOString(),
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  test("renders modal when isOpen is true", async () => {
    render(<DemoScenariosModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise SOC Demonstration Environment/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Command & Control \(C2\) Beaconing Attack/i).length).toBeGreaterThan(0);
    });
  });

  test("launches attack scenario when inject button clicked", async () => {
    render(<DemoScenariosModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise SOC Demonstration Environment/i)).toBeInTheDocument();
    });

    const injectButton = screen.getByRole("button", { name: /Inject Attack Scenario/i });
    fireEvent.click(injectButton);

    await waitFor(() => {
      expect(screen.getByText(/Attack Scenario Live Stream Injected!/i)).toBeInTheDocument();
    });
  });
});
