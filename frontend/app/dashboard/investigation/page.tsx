"use client";

import ThreatInvestigation from "@/components/ThreatInvestigation";
import AttackGraph from "@/components/AttackGraph";

export default function InvestigationPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          AI Threat Investigation &amp; Visual Attack Graph
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Multi-event attack correlation, lateral movement timeline, and interactive node graph visualization.
        </p>
      </div>

      <AttackGraph />
      <ThreatInvestigation />
    </div>
  );
}
