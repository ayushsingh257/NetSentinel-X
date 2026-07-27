"use client";

import ThreatIntelFusion from "@/components/ThreatIntelFusion";
import ThreatIntelPanel from "@/components/ThreatIntelPanel";

export default function ThreatIntelPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Multi-Provider Threat Intelligence Fusion Engine
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Async aggregation across 8 threat intelligence providers generating composite reputation scores and IOC enrichment.
        </p>
      </div>

      <ThreatIntelFusion />

      <div className="max-w-2xl">
        <ThreatIntelPanel />
      </div>
    </div>
  );
}
