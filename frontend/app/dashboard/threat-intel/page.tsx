"use client";

import ThreatIntelFusion from "@/components/ThreatIntelFusion";
import ThreatIntelPanel from "@/components/ThreatIntelPanel";
import AdvancedThreatIntelFusionDashboard from "@/components/AdvancedThreatIntelFusionDashboard";

export default function ThreatIntelPage() {
  return (
    <div className="space-y-6 font-sans">
      <AdvancedThreatIntelFusionDashboard />
      <ThreatIntelFusion />

      <div className="max-w-2xl">
        <ThreatIntelPanel />
      </div>
    </div>
  );
}
