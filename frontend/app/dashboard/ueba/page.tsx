"use client";

import UEBAAnalytics from "@/components/UEBAAnalytics";

export default function UEBAPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          User &amp; Entity Behaviour Analytics (UEBA) Engine
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Baseline statistical profiling tracking 6 threat vectors (Beaconing, Scanning, Brute Force, Exfiltration, DNS Tunneling).
        </p>
      </div>

      <UEBAAnalytics />
    </div>
  );
}
