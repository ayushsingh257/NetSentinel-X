"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { FlickeringFooter } from "./ui/flickering-footer";
import DarkGrid from "./ui/dark-grid";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import {
  Activity,
  Bot,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart2,
  Users,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    packetsProcessed: 148920,
    activeThreats: 3,
    mitreMapped: 14,
    aiReasoningTimeMs: 42,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        packetsProcessed: prev.packetsProcessed + Math.floor(Math.random() * 25) + 5,
        aiReasoningTimeMs: 38 + Math.floor(Math.random() * 10),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stickyContent = [
    {
      title: "Who Should Use NetSentinel-X?",
      description:
        "Designed for SOC Analysts, Incident Responders, Threat Hunters, Detection Engineers, and CISOs who require real-time visibility, automated threat triage, eBPF telemetry, and RAG-powered AI incident reasoning without compromising on speed or compliance.",
      content: (
        <div className="h-full w-full bg-slate-950 dark:bg-black p-6 flex flex-col justify-between text-white font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Tailored for Modern SOC Teams</h4>
              <p className="text-[11px] text-slate-400">Enterprise Operations &amp; Defense</p>
            </div>
          </div>
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tier 1-3 SOC Triage Analysts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Proactive Threat Hunters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sigma/YARA Detection Engineers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CISOs &amp; Security Directors</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">7-Role RBAC &amp; Granular Control</span>
        </div>
      ),
    },
    {
      title: "How NetSentinel-X Empowers Teams",
      description:
        "Instantly convert fragmented packet logs and isolated alerts into structured visual attack stories, dynamic graph topologies, and automated SOAR response workflows. The RAG AI Copilot synthesizes evidence in milliseconds to reduce Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR).",
      content: (
        <div className="h-full w-full bg-slate-950 dark:bg-black p-6 flex flex-col justify-between text-white font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Automated Threat Acceleration</h4>
              <p className="text-[11px] text-slate-400">Sub-Second Incident Synthesis</p>
            </div>
          </div>
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span>Avg AI Reasoning</span>
              <span className="text-emerald-400 font-bold">18.4 ms</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span>MTTR Reduction</span>
              <span className="text-emerald-400 font-bold">-78%</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span>DPI Parser Throughput</span>
              <span className="text-emerald-400 font-bold">45k pps</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">RAG Reasoning &amp; SOAR Playbooks</span>
        </div>
      ),
    },
    {
      title: "Why NetSentinel-X is Different",
      description:
        "Unlike legacy SIEMs that clutter dashboards with raw logs, NetSentinel-X integrates Deep Packet Inspection, ATT&CK Matrix Correlation, UEBA Baseline Profiling, and Autonomous SOAR Playbooks into one cohesive architecture with 100% data privacy and 0-secret configuration.",
      content: (
        <div className="h-full w-full bg-slate-950 dark:bg-black p-6 flex flex-col justify-between text-white font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Unified Architecture</h4>
              <p className="text-[11px] text-slate-400">NDR + SOC + SOAR + AI</p>
            </div>
          </div>
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Zero-Secret In-Memory Isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Full 12-Tactic ATT&CK Radar</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Custom Sigma &amp; YARA Sandbox</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Enterprise Release Candidate v2.0</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-28 border-b border-slate-200 dark:border-zinc-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-mono mb-8 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>NetSentinel-X v2.0 Enterprise Release Candidate</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500 dark:text-zinc-400">AI-Powered NDR &amp; SOC Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              Autonomous AI-Powered <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-300">
                Network Detection &amp; Response
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed mb-10">
              Real-time eBPF Deep Packet Inspection, RAG AI Threat Copilot, ATT&CK Matrix Correlation, UEBA Analytics, and Autonomous SOAR Playbooks into a unified enterprise platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl shadow-xl shadow-emerald-500/25 transition-all duration-300 active:scale-95 font-sans"
              >
                <BarChart2 className="w-5 h-5" />
                <span>Launch SOC Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-800 rounded-xl transition-all duration-300"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Sign In / Demo Access</span>
              </Link>
            </div>

            {/* Live Metrics Counter Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl p-4 rounded-2xl bg-white/90 dark:bg-zinc-950/80 border border-emerald-500/30 dark:border-zinc-800/80 shadow-xl">
              <div className="p-3 text-left">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Packets Ingested</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {metrics.packetsProcessed.toLocaleString()}
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Active Threats</p>
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
                  {metrics.activeThreats} HIGH
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">ATT&CK Techniques</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {metrics.mitreMapped} Mapped
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">AI Reasoning Speed</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {metrics.aiReasoningTimeMs} ms
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Capabilities Dark Grid Section */}
      <section id="capabilities" className="border-b border-slate-200 dark:border-zinc-900">
        <DarkGrid />
      </section>

      {/* Workflows Sticky Scroll Reveal Section */}
      <section id="workflows" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">[ WORKFLOW INTEGRATION ]</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Modern SOC Operations
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Scroll to explore how NetSentinel-X accelerates threat detection and automated incident response across tier-1 to tier-3 operations.
          </p>
        </div>

        <StickyScroll content={stickyContent} />
      </section>

      {/* Copilot RAG CTA Banner */}
      <section id="copilot" className="py-16 bg-slate-100/80 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-900 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
            <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Experience RAG AI Security Reasoning
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Ask natural language questions about active network alerts, suspicious IP lookups, MITRE ATT&CK techniques, and recommended containment steps.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl shadow-xl shadow-emerald-500/20 font-sans"
          >
            <Bot className="w-5 h-5" />
            <span>Launch AI Copilot Workspace</span>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <FlickeringFooter />
    </div>
  );
}
