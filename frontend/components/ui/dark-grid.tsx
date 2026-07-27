"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ShieldAlert, Cpu, GitBranch, Terminal, ShieldCheck, Activity, KeyRound, Network } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    title: "eBPF Packet Telemetry & DPI",
    icon: Network,
    badge: "Sub-ms DPI",
    desc: "Real-time eBPF network packet capture inspecting Ethernet, IP, TCP, UDP, DNS, HTTP, and TLS SNI headers with zero latency.",
  },
  {
    title: "RAG AI Security Copilot",
    icon: Brain,
    desc: "Context-aware AI threat reasoning retrieving evidence across packet feeds, GeoIP enrichment, and MITRE techniques.",
  },
  {
    title: "Multi-Event Attack Correlation",
    icon: Activity,
    desc: "Automated correlation engine synthesizing isolated alerts into full visual attack stories, timelines, and root cause analysis.",
  },
  {
    title: "12-Tactic MITRE ATT&CK Matrix",
    icon: Cpu,
    desc: "Interactive ATT&CK grid with live threat heatmaps, technique breakdown, and AI-driven defensive mitigations.",
  },
  {
    title: "Sigma & YARA Detection Studio",
    icon: Terminal,
    desc: "Custom detection rule authoring with interactive simulation sandbox, rule validation, and AI detection assistant.",
  },
  {
    title: "Autonomous SOAR Playbooks",
    icon: GitBranch,
    desc: "Configurable workflow automation executing containment actions, host isolations, and manual analyst approval queues.",
  },
  {
    title: "Multi-Provider Intel Fusion",
    icon: ShieldAlert,
    desc: "Async aggregation across 8 threat intelligence providers generating composite reputation scores and IOC enrichment.",
  },
  {
    title: "UEBA Anomaly Analytics",
    icon: ShieldCheck,
    desc: "Baseline statistical profiling tracking 6 threat vectors (Beaconing, Scanning, Brute Force, Exfiltration, DNS Tunneling).",
  },
  {
    title: "7-Role RBAC & Session Control",
    icon: KeyRound,
    badge: "Hardened",
    desc: "Granular role-based access control, rate limiting, security headers, active session tracking, and one-click token revocation.",
  },
];

export default function DarkGrid() {
  return (
    <div className="min-h-[60vh] w-full bg-slate-900/40 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors py-16 px-4 font-sans">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">[ ENTERPRISE CAPABILITIES ]</p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Architected for Modern Enterprise SOC Operations
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-zinc-400 max-w-3xl">
          NetSentinel-X V2 combines Deep Packet Inspection, RAG AI Copilot, ATT&CK Matrix Correlation, and Autonomous SOAR Playbooks into a single high-performance platform.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, icon: Icon, desc, badge }) => (
            <Card
              key={title}
              className="group relative overflow-visible border-emerald-500/30 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/80 p-0 transition-all duration-300 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xl"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent" />
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/[0.05] group-hover:to-teal-500/[0.08] transition-colors" />

              <CardHeader className="relative z-10 flex flex-row items-start gap-3 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</CardTitle>
                    {badge && (
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 px-6 pb-6 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {desc}
              </CardContent>

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-emerald-500/0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
