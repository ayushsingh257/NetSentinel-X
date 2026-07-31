"use client";

import DetectionStudio from "@/components/DetectionStudio";
import AdvancedDetectionEngineeringDashboard from "@/components/AdvancedDetectionEngineeringDashboard";

export default function DetectionStudioPage() {
  return (
    <div className="space-y-6 font-sans">
      <AdvancedDetectionEngineeringDashboard />
      <DetectionStudio />
    </div>
  );
}
