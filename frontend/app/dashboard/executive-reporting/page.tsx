"use client";

import ExecutiveReporting from "@/components/ExecutiveReporting";

export default function ExecutiveReportingPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Executive Reporting &amp; Compliance Intelligence Engine
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Automated compliance auditing (SOC 2, ISO 27001, HIPAA, PCI-DSS) and executive security PDF reports.
        </p>
      </div>

      <ExecutiveReporting />
    </div>
  );
}
