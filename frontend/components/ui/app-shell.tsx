"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import AICopilot from "@/components/AICopilot";
import DemoScenariosModal from "@/components/DemoScenariosModal";
import { Search, Zap, Bot, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && typeof window !== "undefined") {
      // Allow local demo viewing
    }
  }, []);

  const openCopilotWith = (queryText?: string) => {
    if (queryText) setCopilotQuery(queryText);
    setCopilotOpen(true);
  };

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case "/dashboard": return "Executive SOC Overview";
      case "/dashboard/monitoring": return "Live Packet Telemetry & Monitoring";
      case "/dashboard/copilot": return "RAG AI Security Copilot Workspace";
      case "/dashboard/investigation": return "AI Threat Investigation & Visual Attack Graph";
      case "/dashboard/mitre": return "MITRE ATT&CK Intelligence Radar";
      case "/dashboard/detection-studio": return "Sigma & YARA Detection Studio";
      case "/dashboard/threat-intel": return "Multi-Provider Threat Intel Fusion Engine";
      case "/dashboard/ueba": return "User & Entity Behaviour Analytics (UEBA)";
      case "/dashboard/optimizer": return "AI Detection Optimizer & Coverage Matrix";
      case "/dashboard/soar": return "Autonomous SOAR Playbooks & Workflows";
      case "/dashboard/incidents": return "AI Incident Management Desk";
      case "/dashboard/threat-hunting": return "Historical Investigation & Threat Hunting";
      case "/dashboard/executive-reporting": return "Executive Reporting & Compliance Intelligence";
      case "/dashboard/observability": return "Platform Health & System Observability";
      case "/dashboard/security-hardening": return "Security Hardening & Session Control";
      default: return "Security Operations Center";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Sidebar Navigation */}
      <SidebarNav
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenCopilot={() => openCopilotWith()}
        onOpenSimulator={() => setDemoModalOpen(true)}
      />

      {/* Main Workspace Area with min-w-0 to prevent right-edge overlapping */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-50 dark:bg-black">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-6 flex items-center justify-between z-20 shrink-0">
          
          {/* Path Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 font-mono truncate">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Workspace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-zinc-200 truncate">
              {getBreadcrumbTitle(pathname)}
            </span>
          </div>

          {/* Quick Actions & Live Telemetry Health */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Global Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search IOC, IP, Rule..."
                className="w-full bg-slate-100 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Live System Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>DPI Active</span>
            </div>

            {/* Attack Simulator Trigger */}
            <button
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/20 dark:bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Simulator</span>
            </button>

            {/* AI Copilot Trigger */}
            <button
              onClick={() => openCopilotWith()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Scrollable Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin min-w-0">
          <div className="max-w-7xl mx-auto space-y-6 min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* RAG AI Copilot Drawer */}
      <AICopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />

      {/* Demo Attack Simulator Modal */}
      <DemoScenariosModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}

export default AppShell;
