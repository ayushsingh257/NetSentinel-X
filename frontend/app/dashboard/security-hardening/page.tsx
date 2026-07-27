"use client";

import SecurityHardeningDashboard from "@/components/SecurityHardeningDashboard";

export default function SecurityHardeningPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Security Hardening, RBAC &amp; Session Controls
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Role-Based Access Control, session revocation, security header audits, and rate limiting status.
        </p>
      </div>

      <SecurityHardeningDashboard />
    </div>
  );
}
