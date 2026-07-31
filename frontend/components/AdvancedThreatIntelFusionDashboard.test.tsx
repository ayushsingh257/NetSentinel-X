import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdvancedThreatIntelFusionDashboard from "./AdvancedThreatIntelFusionDashboard";

describe("AdvancedThreatIntelFusionDashboard", () => {
  test("renders header with Era 35 badge and active feed metric", () => {
    render(<AdvancedThreatIntelFusionDashboard />);
    expect(screen.getByText(/Threat Intelligence Fusion Subsystem/i)).toBeInTheDocument();
    expect(screen.getByText(/Era 35 Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Feeds: 3 \| Ingested: 48,600 IOCs/i)).toBeInTheDocument();
  });

  test("renders configured threat feeds table", () => {
    render(<AdvancedThreatIntelFusionDashboard />);
    expect(screen.getByText(/MISP Cyber Threat Exchange/i)).toBeInTheDocument();
    expect(screen.getByText(/AlienVault OTX Pulse Stream/i)).toBeInTheDocument();
    expect(screen.getByText(/STIX\/TAXII Custom Enterprise Feed/i)).toBeInTheDocument();
  });

  test("switches tab to Normalized IOC Explorer", () => {
    render(<AdvancedThreatIntelFusionDashboard />);
    const iocTab = screen.getByRole("button", { name: /Normalized IOC Explorer/i });
    fireEvent.click(iocTab);

    expect(screen.getByText(/185\.220\.101\.5 \(IP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Threat Score: 95\/100/i)).toBeInTheDocument();
  });

  test("switches tab to On-Demand Enrichment and executes query", () => {
    render(<AdvancedThreatIntelFusionDashboard />);
    const enrichTab = screen.getByRole("button", { name: /On-Demand IOC Enrichment/i });
    fireEvent.click(enrichTab);

    const enrichBtn = screen.getByRole("button", { name: /Enrich Indicator Context/i });
    fireEvent.click(enrichBtn);

    expect(screen.getByText(/MALICIOUS \(95\/100\)/i)).toBeInTheDocument();
  });

  test("switches tab to Feed Health & Metrics", () => {
    render(<AdvancedThreatIntelFusionDashboard />);
    const healthTab = screen.getByRole("button", { name: /Feed Health & Metrics/i });
    fireEvent.click(healthTab);

    expect(screen.getByText(/Active Threat Feeds/i)).toBeInTheDocument();
    expect(screen.getByText(/48,600 Items/i)).toBeInTheDocument();
  });
});
