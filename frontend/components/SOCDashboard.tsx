"use client";

import TrafficDashboard from "./TrafficDashboard";
import AlertDashboard from "./AlertDashboard";
import AnalyticsPanel from "./AnalyticsPanel";
import Navbar from "./Navbar";
import ThreatFeed from "./ThreatFeed";
import IncidentTimeline from "./IncidentTimeline";
import ThreatIntelPanel from "./ThreatIntelPanel";
import AICopilot from "./AICopilot";
import ThreatInvestigation from "./ThreatInvestigation";
import MITREIntelligence from "./MITREIntelligence";
import DetectionStudio from "./DetectionStudio";
import ThreatIntelFusion from "./ThreatIntelFusion";
import UEBAAnalytics from "./UEBAAnalytics";
import AIDetectionOptimizer from "./AIDetectionOptimizer";
import AIIncidentDesk from "./AIIncidentDesk";
import ExecutiveReporting from "./ExecutiveReporting";
import AttackGraph from "./AttackGraph";
import ThreatHuntingWorkspace from "./ThreatHuntingWorkspace";
import WorkflowAutomation from "./WorkflowAutomation";
import ObservabilityDashboard from "./ObservabilityDashboard";
import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";

export default function SOCDashboard() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");

  const [analytics, setAnalytics] = useState({
    total_packets: 0,
    total_alerts: 0,
    high_alerts: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }

    async function fetchAnalytics() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics`
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

  const openCopilotWith = (queryText: string) => {
    setCopilotQuery(queryText);
    setCopilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />

      <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            Security Operations Center
          </h1>

          <p className="text-zinc-400 mt-2">
            Enterprise Realtime Threat Monitoring &amp; AI Security Platform
          </p>
        </div>

        {/* AI Copilot Action CTA Header Button */}
        <button
          onClick={() => setCopilotOpen(true)}
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 active:scale-95"
        >
          <Bot className="w-5 h-5" />
          <span>Launch AI Copilot</span>
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-cyan-500 rounded-xl p-5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:-translate-y-1 transition-all duration-300">
          <p className="text-zinc-400 text-sm">Total Packets</p>

          <h2 className="text-4xl font-bold text-cyan-400 mt-2">
            {analytics.total_packets}
          </h2>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-sm border border-red-500 rounded-xl p-5 shadow-lg shadow-red-500/10 hover:shadow-red-500/30 hover:-translate-y-1 transition-all duration-300">
          <p className="text-zinc-400 text-sm">Threat Alerts</p>

          <h2 className="text-4xl font-bold text-red-400 mt-2">
            {analytics.total_alerts}
          </h2>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-sm border border-green-500 rounded-xl p-5 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300">
          <p className="text-zinc-400 text-sm">System Status</p>

          <h2 className="text-2xl font-bold text-green-400 mt-2">
            {analytics.high_alerts} HIGH
          </h2>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-sm border border-yellow-500 rounded-xl p-5 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300">
          <p className="text-zinc-400 text-sm">Monitoring</p>

          <h2 className="text-2xl font-bold text-yellow-400 mt-2">LIVE</h2>
        </div>
      </div>

      {/* Enterprise Observability & System Health Studio Section */}
      <div className="p-6">
        <ObservabilityDashboard />
      </div>

      {/* AI Workflow Automation & Autonomous SOAR Playbook Engine Section */}
      <div className="p-6">
        <WorkflowAutomation />
      </div>

      {/* Historical Investigation & AI Threat Hunting Workspace Section */}
      <div className="p-6">
        <ThreatHuntingWorkspace />
      </div>

      {/* Interactive Attack Graph & Threat Path Visualization Section */}
      <div className="p-6">
        <AttackGraph />
      </div>

      {/* AI Threat Investigation Section */}
      <div className="p-6">
        <ThreatInvestigation />
      </div>

      {/* Enterprise MITRE ATT&CK Intelligence Matrix & Heatmap */}
      <div className="p-6">
        <MITREIntelligence />
      </div>

      {/* Detection Engineering Studio Section */}
      <div className="p-6">
        <DetectionStudio />
      </div>

      {/* Enterprise Threat Intelligence Fusion Engine Section */}
      <div className="p-6">
        <ThreatIntelFusion />
      </div>

      {/* Enterprise User & Entity Behaviour Analytics (UEBA) Section */}
      <div className="p-6">
        <UEBAAnalytics />
      </div>

      {/* Enterprise AI Detection Optimizer & Coverage Studio Section */}
      <div className="p-6">
        <AIDetectionOptimizer />
      </div>

      {/* Enterprise AI Incident Management Desk Section */}
      <div className="p-6">
        <AIIncidentDesk />
      </div>

      {/* Enterprise Executive Reporting & Compliance Engine Section */}
      <div className="p-6">
        <ExecutiveReporting />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
        <div className="xl:col-span-2 border border-cyan-500 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] transition-all duration-300">
          <TrafficDashboard />
        </div>

        <div className="border border-red-500 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_30px_rgba(255,0,0,0.25)] transition-all duration-300">
          <AlertDashboard />
        </div>
      </div>

      <div className="p-6">
        <AnalyticsPanel />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
        <ThreatFeed />

        <IncidentTimeline />

        <ThreatIntelPanel />
      </div>

      {/* Floating AI Copilot Toggle Button */}
      <button
        onClick={() => openCopilotWith("Summarize recent threats in the last 24 hours")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span>Ask AI Copilot</span>
      </button>

      {/* AI Copilot Drawer Component */}
      <AICopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />
    </div>
  );
}