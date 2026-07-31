"use client";

import WorkflowAutomation from "@/components/WorkflowAutomation";
import EnterpriseIntegrationsDashboard from "@/components/EnterpriseIntegrationsDashboard";

export default function SOARPage() {
  return (
    <div className="space-y-6 font-sans">
      <EnterpriseIntegrationsDashboard />
      <WorkflowAutomation />
    </div>
  );
}
