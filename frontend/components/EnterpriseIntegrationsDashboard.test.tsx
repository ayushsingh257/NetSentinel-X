import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnterpriseIntegrationsDashboard from "./EnterpriseIntegrationsDashboard";

describe("EnterpriseIntegrationsDashboard", () => {
  test("renders header with Era 36 badge and delivery success metric", () => {
    render(<EnterpriseIntegrationsDashboard />);
    expect(screen.getByText(/Enterprise Ecosystem Integrations Subsystem/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 36 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery Success Rate: 99\.98%/i)).toBeInTheDocument();
  });

  test("renders connected integration targets table", () => {
    render(<EnterpriseIntegrationsDashboard />);
    expect(screen.getByText(/Enterprise Splunk HEC Collector/i)).toBeInTheDocument();
    expect(screen.getByText(/Palo Alto Cortex XSOAR Incident Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/ServiceNow IT Service Management Gateway/i)).toBeInTheDocument();
  });

  test("switches tab to Log Export Pipelines and renders active streams", () => {
    render(<EnterpriseIntegrationsDashboard />);
    const pipelineTab = screen.getByRole("button", { name: /Log Export Pipelines/i });
    fireEvent.click(pipelineTab);

    expect(screen.getByText(/Common Event Format \(CEF\) Syslog Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Streaming JSON Audit Pipeline/i)).toBeInTheDocument();
  });

  test("switches tab to Integration Testing Suite and dispatches test event", () => {
    render(<EnterpriseIntegrationsDashboard />);
    const testTab = screen.getByRole("button", { name: /Integration Testing Suite/i });
    fireEvent.click(testTab);

    const sendBtn = screen.getByRole("button", { name: /Send Test Event Payload/i });
    fireEvent.click(sendBtn);

    expect(screen.getByText(/Delivery Verified \(HTTP 200\)/i)).toBeInTheDocument();
  });

  test("switches tab to Delivery Metrics & Health", () => {
    render(<EnterpriseIntegrationsDashboard />);
    const metricsTab = screen.getByRole("button", { name: /Delivery Metrics & Health/i });
    fireEvent.click(metricsTab);

    expect(screen.getByText(/Active Integration Endpoints/i)).toBeInTheDocument();
    expect(screen.getByText(/1,284,000 Events/i)).toBeInTheDocument();
  });
});
