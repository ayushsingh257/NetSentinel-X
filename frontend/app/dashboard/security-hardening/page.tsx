"use client";

import { useState } from "react";
import SecurityHardeningDashboard from "@/components/SecurityHardeningDashboard";
import AuthorizationDashboard from "@/components/AuthorizationDashboard";
import { ShieldCheck, Lock } from "lucide-react";

export default function SecurityHardeningPage() {
  const [activeView, setActiveView] = useState<"authz" | "hardening">("authz");

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Enterprise Security, RBAC &amp; Access Control
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
            Role-Based Access Control (RBAC), Permission Guards, Privilege Escalation Detection &amp; Session Management
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-800/80 dark:bg-zinc-900/80 rounded-xl border border-slate-700/50 dark:border-zinc-800 font-sans">
          <button
            onClick={() => setActiveView("authz")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === "authz"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Authorization &amp; RBAC (Era 18)
          </button>
          <button
            onClick={() => setActiveView("hardening")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === "hardening"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            Platform Hardening (Era 15)
          </button>
        </div>
      </div>

      {activeView === "authz" ? (
        <AuthorizationDashboard />
      ) : (
        <SecurityHardeningDashboard />
      )}
    </div>
  );
}
