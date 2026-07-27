"use client";

import AIIncidentDesk from "@/components/AIIncidentDesk";

export default function IncidentsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Enterprise AI Incident Management Desk
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Unified incident lifecycle management, severity assignment, and AI-suggested remediation.
        </p>
      </div>

      <AIIncidentDesk />
    </div>
  );
}
