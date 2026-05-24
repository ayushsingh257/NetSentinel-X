"use client";

import TrafficDashboard from "./TrafficDashboard";
import AlertDashboard from "./AlertDashboard";
import AnalyticsPanel from "./AnalyticsPanel";

export default function SOCDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-5xl font-bold text-cyan-400">
          NetSentinel-X Enterprise SOC
        </h1>

        <p className="text-zinc-400 mt-2">
          Realtime Network Monitoring & Threat Detection System
        </p>
      </div>

<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4">

  <div className="xl:col-span-2 border border-cyan-500 rounded-xl overflow-hidden">
    <TrafficDashboard />
  </div>

  <div className="border border-red-500 rounded-xl overflow-hidden">
    <AlertDashboard />
  </div>

  <div className="xl:col-span-3">
    <AnalyticsPanel />
  </div>

</div>
    </div>
  );
}