"use client";

import TrafficDashboard from "./TrafficDashboard";
import AlertDashboard from "./AlertDashboard";
import AnalyticsPanel from "./AnalyticsPanel";
import ThreatFeed from "./ThreatFeed";
import IncidentTimeline from "./IncidentTimeline";
import ThreatIntelPanel from "./ThreatIntelPanel";
import { useEffect, useState } from "react";
import {
  Activity,
  ShieldAlert,
  Bot,
  Cpu,
  Terminal,
  Workflow,
  Globe2,
  Brain,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SOCDashboard() {
  const [analytics, setAnalytics] = useState({
    total_packets: 0,
    total_alerts: 0,
    high_alerts: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/analytics`
        );
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Analytics fetch failed:", error);
      }
    }

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  const workspaceLinks = [
    {
      title: "Attack Investigation & Threat Path",
      desc: "Interactive visual attack topology and multi-event root cause analysis.",
      href: "/dashboard/investigation",
      icon: Activity,
    },
    {
      title: "MITRE ATT&CK Matrix",
      desc: "12-tactic threat radar with live heatmaps and mitigation guidance.",
      href: "/dashboard/mitre",
      icon: Cpu,
    },
    {
      title: "Detection Engineering Studio",
      desc: "Custom Sigma & YARA rule authoring, sandbox testing, and AI validation.",
      href: "/dashboard/detection-studio",
      icon: Terminal,
    },
    {
      title: "Threat Intel Fusion Engine",
      desc: "Async reputation scoring across 8 threat intelligence providers.",
      href: "/dashboard/threat-intel",
      icon: Globe2,
    },
    {
      title: "UEBA Anomaly Analytics",
      desc: "Statistical baseline profiling tracking 6 threat vectors.",
      href: "/dashboard/ueba",
      icon: Brain,
    },
    {
      title: "Autonomous SOAR Playbooks",
      icon: Workflow,
      desc: "Automated playbooks executing containment & analyst approval queues.",
      href: "/dashboard/soar",
    },
    {
      title: "AI Incident Management Desk",
      desc: "Incident lifecycle tracking, auto-assignment, and triage notes.",
      href: "/dashboard/incidents",
      icon: ShieldAlert,
    },
    {
      title: "Historical Threat Hunting",
      desc: "PCAP deep search, log correlation, and AI hunting hypotheses.",
      href: "/dashboard/threat-hunting",
      icon: Search,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security Operations Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Realtime Threat Monitoring &amp; AI Security Operations Platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/copilot"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all font-sans"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Copilot Desk</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-emerald-500/30 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Packets Ingested</p>
          <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {analytics.total_packets.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-rose-500/40 dark:border-rose-900/60 rounded-xl p-5 shadow-lg">
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">Threat Alerts</p>
          <h2 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {analytics.total_alerts}
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-emerald-500/30 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">Critical Status</p>
          <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {analytics.high_alerts} HIGH
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-emerald-500/30 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">eBPF Telemetry</p>
          <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </h2>
        </div>
      </div>

      {/* Realtime Telemetry Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xl min-w-0">
          <TrafficDashboard />
        </div>

        <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xl min-w-0">
          <AlertDashboard />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl min-w-0">
        <AnalyticsPanel />
      </div>

      {/* Dedicated Workspace Navigation Launcher Grid */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise SOC Workspaces
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">Click to enter module workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workspaceLinks.map((ws) => {
            const Icon = ws.icon;
            return (
              <Link
                key={ws.href}
                href={ws.href}
                className="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Threat Feeds & Incident Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
        <ThreatFeed />
        <IncidentTimeline />
        <ThreatIntelPanel />
      </div>
    </div>
  );
}