"use client";

import TrafficDashboard from "@/components/TrafficDashboard";
import AlertDashboard from "@/components/AlertDashboard";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import ThreatFeed from "@/components/ThreatFeed";
import IncidentTimeline from "@/components/IncidentTimeline";

export default function MonitoringPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Live Network Packet Monitoring &amp; Telemetry
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          eBPF Deep Packet Inspection feeds, protocol distribution, and active alert telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 border border-slate-800 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-900/90 dark:bg-zinc-950/90 shadow-xl">
          <TrafficDashboard />
        </div>
        <div className="border border-slate-800 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-900/90 dark:bg-zinc-950/90 shadow-xl">
          <AlertDashboard />
        </div>
      </div>

      <div className="bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
        <AnalyticsPanel />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ThreatFeed />
        <IncidentTimeline />
      </div>
    </div>
  );
}
