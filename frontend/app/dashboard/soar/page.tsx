"use client";

import WorkflowAutomation from "@/components/WorkflowAutomation";

export default function SOARPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Autonomous SOAR Playbooks &amp; Workflows
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Automated containment playbooks, host isolations, and manual analyst approval queues.
        </p>
      </div>

      <WorkflowAutomation />
    </div>
  );
}
