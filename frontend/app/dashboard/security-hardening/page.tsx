"use client";

import { useState } from "react";
import SecurityHardeningDashboard from "@/components/SecurityHardeningDashboard";
import AuthorizationDashboard from "@/components/AuthorizationDashboard";
import WebSecurityDashboard from "@/components/WebSecurityDashboard";
import APISecurityDashboard from "@/components/APISecurityDashboard";
import InfrastructureSecurityDashboard from "@/components/InfrastructureSecurityDashboard";
import SecretsSecurityDashboard from "@/components/SecretsSecurityDashboard";
import DatabaseSecurityDashboard from "@/components/DatabaseSecurityDashboard";
import { ShieldCheck, Lock, Globe, Key, Server, KeyRound, Database } from "lucide-react";

export default function SecurityHardeningPage() {
  const [activeView, setActiveView] = useState<
    "database" | "secrets" | "infra" | "apisec" | "websec" | "authz" | "hardening"
  >("database");

  const tabs = [
    { id: "database", label: "Database & Data (Era 23)", icon: <Database className="w-4 h-4" /> },
    { id: "secrets", label: "Secrets & Crypto (Era 22)", icon: <KeyRound className="w-4 h-4" /> },
    { id: "infra", label: "Infrastructure (Era 21)", icon: <Server className="w-4 h-4" /> },
    { id: "apisec", label: "API Security (Era 20)", icon: <Key className="w-4 h-4" /> },
    { id: "websec", label: "Web Security (Era 19)", icon: <Globe className="w-4 h-4" /> },
    { id: "authz", label: "Authorization (Era 18)", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "hardening", label: "Platform Hardening (Era 15)", icon: <Lock className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Enterprise Security Controls
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
            Database Protection, Secrets Management, Infrastructure Hardening &amp; API Security — Eras 15–23
          </p>
        </div>

        <div className="flex flex-wrap items-center p-1 bg-slate-800/80 dark:bg-zinc-900/80 rounded-xl border border-slate-700/50 dark:border-zinc-800 font-sans gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeView === tab.id
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "database" ? (
        <DatabaseSecurityDashboard />
      ) : activeView === "secrets" ? (
        <SecretsSecurityDashboard />
      ) : activeView === "infra" ? (
        <InfrastructureSecurityDashboard />
      ) : activeView === "apisec" ? (
        <APISecurityDashboard />
      ) : activeView === "websec" ? (
        <WebSecurityDashboard />
      ) : activeView === "authz" ? (
        <AuthorizationDashboard />
      ) : (
        <SecurityHardeningDashboard />
      )}
    </div>
  );
}
