"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Server,
  ShieldCheck,
  Search,
  Download,
  BarChart3,
  Layers,
  Cpu,
  Zap,
  BrainCircuit
} from "lucide-react";
import SystemHealthObservabilityDashboard from "@/components/SystemHealthObservabilityDashboard";
import EventStreamDashboard from "@/components/EventStreamDashboard";
import AISecurityAnalystDashboard from "@/components/AISecurityAnalystDashboard";
import SOARDashboard from "@/components/SOARDashboard";

export interface ServiceHealth {
  name: string;
  status: string;
  uptime: number;
  latency_ms: number;
  last_check: string;
  error_count: number;
  version: string;
}

export interface PlatformHealth {
  overall_score: number;
  overall_status: string;
  services: ServiceHealth[];
  checked_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  role: string;
  action: string;
  category: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  severity: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface APIMetrics {
  total_requests: number;
  avg_latency_ms: number;
  failed_requests: number;
  error_percentage: number;
}

export interface PlatformSecurityMetrics {
  alerts_processed: number;
  incidents_created: number;
  threat_hunts_executed: number;
  rules_triggered: number;
  workflows_executed: number;
  reports_generated: number;
  active_iocs_monitored: number;
  ueba_anomalies_flagged: number;
  timestamp: string;
}

export interface ObservabilityMetricsOverview {
  api: APIMetrics;
  security: PlatformSecurityMetrics;
}

const SEED_SERVICES: ServiceHealth[] = [
  { name: "Backend API", status: "HEALTHY", uptime: 99.9, latency_ms: 12, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "2.0.0-Enterprise" },
  { name: "Frontend Application", status: "HEALTHY", uptime: 99.8, latency_ms: 18, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "2.0.0-Enterprise" },
  { name: "Database", status: "HEALTHY", uptime: 100.0, latency_ms: 4, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "PostgreSQL 16" },
  { name: "WebSocket Engine", status: "HEALTHY", uptime: 98.9, latency_ms: 5, last_check: "2026-07-27T00:00:00.000Z", error_count: 1, version: "2.0.0-Realtime" },
  { name: "AI Engine", status: "HEALTHY", uptime: 97.8, latency_ms: 45, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "RAG Copilot v2" },
  { name: "Threat Intelligence Engine", status: "HEALTHY", uptime: 99.5, latency_ms: 28, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "Fusion v2.0" },
  { name: "Workflow Engine", status: "HEALTHY", uptime: 100.0, latency_ms: 8, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "SOAR Engine v2" },
  { name: "Detection Engine", status: "HEALTHY", uptime: 99.7, latency_ms: 15, last_check: "2026-07-27T00:00:00.000Z", error_count: 0, version: "Sigma/YARA v2" },
];

const SEED_AUDITS: AuditLog[] = [
  { id: "AUD-1001", timestamp: "2026-07-26T23:15:00.000Z", user_id: "USR-001", username: "Ayush (Lead Analyst)", role: "SOC_ADMIN", action: "THREAT_HUNT_EXECUTED", category: "THREAT_HUNT", resource: "ThreatHuntingWorkspace", resource_id: "HUNT-9901", ip_address: "192.168.1.10", user_agent: "Browser", severity: "MEDIUM", status: "SUCCESS" },
  { id: "AUD-1002", timestamp: "2026-07-26T23:30:00.000Z", user_id: "USR-002", username: "SOC Analyst", role: "ANALYST", action: "WORKFLOW_APPROVED", category: "WORKFLOW", resource: "WorkflowAutomation", resource_id: "APP-101", ip_address: "192.168.1.15", user_agent: "Browser", severity: "HIGH", status: "SUCCESS" },
  { id: "AUD-1003", timestamp: "2026-07-26T23:40:00.000Z", user_id: "SYSTEM", username: "Automated Correlation Engine", role: "SYSTEM_ENGINE", action: "INCIDENT_CREATED", category: "INCIDENT", resource: "AIIncidentDesk", resource_id: "INC-2026-8001", ip_address: "127.0.0.1", user_agent: "NetSentinel-Engine/2.0", severity: "CRITICAL", status: "SUCCESS" },
  { id: "AUD-1004", timestamp: "2026-07-26T23:50:00.000Z", user_id: "USR-001", username: "Ayush (Lead Analyst)", role: "SOC_ADMIN", action: "REPORT_GENERATED", category: "REPORT", resource: "ExecutiveReporting", resource_id: "REP-2026-001", ip_address: "192.168.1.10", user_agent: "Browser", severity: "LOW", status: "SUCCESS" },
];

export default function ObservabilityDashboard() {
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth>({
    overall_score: 98,
    overall_status: "OPTIMAL",
    services: SEED_SERVICES,
    checked_at: "2026-07-27T00:00:00.000Z",
  });
  const [audits, setAudits] = useState<AuditLog[]>(SEED_AUDITS);
  const [metrics, setMetrics] = useState<ObservabilityMetricsOverview>({
    api: { total_requests: 142850, avg_latency_ms: 18.4, failed_requests: 120, error_percentage: 0.08 },
    security: { alerts_processed: 89240, incidents_created: 14, threat_hunts_executed: 42, rules_triggered: 156, workflows_executed: 28, reports_generated: 8, active_iocs_monitored: 1250, ueba_anomalies_flagged: 19, timestamp: "2026-07-27T00:00:00.000Z" },
  });

  const [activeTab, setActiveTab] = useState<"health" | "eventstream" | "aianalyst" | "soar" | "audit" | "metrics">("health");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const fetchHealth = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/health`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.services)) {
          setPlatformHealth(data);
        }
      }
    } catch {
      // Use fallback seed data
    }
  }, []);

  const fetchAudits = useCallback(async (q = "", cat = "", sev = "") => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      let url = `${apiUrl}/api/v2/audit/logs`;
      if (q || cat || sev) {
        url = `${apiUrl}/api/v2/audit/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}&severity=${encodeURIComponent(sev)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.logs)) {
          setAudits(data.logs);
        }
      }
    } catch {
      setAudits(SEED_AUDITS);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/metrics`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.api && data.security) {
          setMetrics(data);
        }
      }
    } catch {
      // Use fallback seed data
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchHealth();
      void fetchAudits();
      void fetchMetrics();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHealth, fetchAudits, fetchMetrics]);

  const handleSearchAudit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchAudits(searchQuery, categoryFilter, severityFilter);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold">CRITICAL</span>;
      case "HIGH": return <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono font-bold">HIGH</span>;
      case "MEDIUM": return <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold">MEDIUM</span>;
      default: return <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">LOW</span>;
    }
  };

  const servicesList = platformHealth?.services || SEED_SERVICES;
  const auditLogs = audits || SEED_AUDITS;

  return (
    <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">

      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Enterprise Observability &amp; Platform Health Studio
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Observability Engine v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">System Health Monitoring, Audit Trail Explorer &amp; Platform Metrics</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          {(["health", "eventstream", "aianalyst", "soar", "audit", "metrics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors capitalize flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "health" && <Server className="w-3.5 h-3.5 text-emerald-400" />}
              {tab === "eventstream" && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
              {tab === "aianalyst" && <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />}
              {tab === "soar" && <Zap className="w-3.5 h-3.5 text-amber-400" />}
              {tab === "audit" && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
              {tab === "metrics" && <BarChart3 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{tab === "health" ? "System Health" : tab === "eventstream" ? "Event Bus Stream" : tab === "aianalyst" ? "AI Security Analyst" : tab === "soar" ? "SOAR Automation" : tab === "audit" ? "Audit Explorer" : "Platform Metrics"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health Score Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Platform Health Score</span>
          <span className="text-lg font-bold text-emerald-400">{platformHealth?.overall_score ?? 98}/100</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Monitored Services</span>
          <span className="text-lg font-bold text-cyan-400">{servicesList.length} Active</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">API Avg Latency</span>
          <span className="text-lg font-bold text-purple-400">{metrics?.api?.avg_latency_ms ?? 18.4} ms</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">API Error Rate</span>
          <span className="text-lg font-bold text-emerald-400">{metrics?.api?.error_percentage ?? 0.08}%</span>
        </div>
      </div>

      {/* Tab 1: System Health */}
      {activeTab === "health" && (
        <SystemHealthObservabilityDashboard />
      )}

      {/* Tab 2: Event Bus Stream */}
      {activeTab === "eventstream" && (
        <EventStreamDashboard />
      )}

      {/* Tab 3: AI Security Analyst */}
      {activeTab === "aianalyst" && (
        <AISecurityAnalystDashboard />
      )}

      {/* Tab 4: SOAR Automation */}
      {activeTab === "soar" && (
        <SOARDashboard />
      )}

      {/* Tab 2: Audit Explorer */}
      {activeTab === "audit" && (
        <div className="space-y-4 font-sans text-xs">
          <form onSubmit={handleSearchAudit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, action, resource..."
              className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Categories</option>
              <option value="THREAT_HUNT">THREAT_HUNT</option>
              <option value="WORKFLOW">WORKFLOW</option>
              <option value="INCIDENT">INCIDENT</option>
              <option value="REPORT">REPORT</option>
              <option value="DETECTION">DETECTION</option>
              <option value="AUTHENTICATION">AUTHENTICATION</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Search Audit</span>
            </button>
          </form>

          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden font-mono">
            <div className="p-3 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase flex items-center justify-between">
              <span>Enterprise Audit Trail Logs ({auditLogs.length})</span>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v2/audit/export`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {auditLogs.map((a) => (
                <div key={a.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-cyan-400 font-bold">{a.id}</span>
                      <span className="text-xs font-bold text-white font-sans">{a.action}</span>
                      {getSeverityBadge(a.severity)}
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      By <strong className="text-zinc-200">{a.username}</strong> ({a.role}) on <span className="text-zinc-300">{a.resource}</span> ({a.resource_id})
                    </p>
                    <span className="text-[9px] text-zinc-600 block">{new Date(a.timestamp).toLocaleString()} · IP: {a.ip_address}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black text-emerald-400 border border-zinc-800 font-bold shrink-0 self-start sm:self-center">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Metrics */}
      {activeTab === "metrics" && (
        <div className="space-y-6 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Alerts Processed</span>
              <span className="text-xl font-bold text-cyan-400">{(metrics?.security?.alerts_processed ?? 89240).toLocaleString()}</span>
              <span className="text-[9px] text-zinc-500 block">DPI &amp; Rule Engine Telemetry</span>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase">Active Incidents Created</span>
              <span className="text-xl font-bold text-rose-400">{metrics?.security?.incidents_created ?? 14} Cases</span>
              <span className="text-[9px] text-zinc-500 block">P1 - P4 SLA Managed</span>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase">AI Threat Hunts Executed</span>
              <span className="text-xl font-bold text-purple-400">{metrics?.security?.threat_hunts_executed ?? 42} Hunts</span>
              <span className="text-[9px] text-zinc-500 block">Hypothesis &amp; Correlation</span>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase">SOAR Workflows Executed</span>
              <span className="text-xl font-bold text-emerald-400">{metrics?.security?.workflows_executed ?? 28} Executions</span>
              <span className="text-[9px] text-zinc-500 block">Autonomous Response Playbooks</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 block flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>API Operation Metrics</span>
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Total API Requests:</span>
                  <span className="text-white font-bold">{(metrics?.api?.total_requests ?? 142850).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Average Response Latency:</span>
                  <span className="text-purple-400 font-bold">{metrics?.api?.avg_latency_ms ?? 18.4} ms</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Failed HTTP Requests:</span>
                  <span className="text-rose-400 font-bold">{metrics?.api?.failed_requests ?? 120}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Error Percentage:</span>
                  <span className="text-emerald-400 font-bold">{metrics?.api?.error_percentage ?? 0.08}%</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Security Engine Metrics</span>
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Detection Rules Triggered:</span>
                  <span className="text-white font-bold">{metrics?.security?.rules_triggered ?? 156}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Reports Generated:</span>
                  <span className="text-cyan-400 font-bold">{metrics?.security?.reports_generated ?? 8}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Active IOCs Monitored:</span>
                  <span className="text-amber-400 font-bold">{metrics?.security?.active_iocs_monitored ?? 1250}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">UEBA Anomalies Flagged:</span>
                  <span className="text-purple-400 font-bold">{metrics?.security?.ueba_anomalies_flagged ?? 19}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
