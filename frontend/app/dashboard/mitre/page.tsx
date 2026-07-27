"use client";

import MITREIntelligence from "@/components/MITREIntelligence";

export default function MitrePage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          MITRE ATT&amp;CK Intelligence Matrix &amp; Heatmap
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Realtime mapping across 12 ATT&CK tactics, technique detection frequency, and AI defensive mitigations.
        </p>
      </div>

      <MITREIntelligence />
    </div>
  );
}
