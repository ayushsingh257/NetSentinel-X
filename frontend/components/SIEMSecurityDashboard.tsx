"use client";

import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SIEMEvent {
  id: string;
  event_type: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  user: string;
  ip: string;
  device: string;
  location: string;
  action: string;
  resource: string;
  time: string;
}

interface SIEMAlert {
  alert_id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  user: string;
  resource: string;
  time: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: SIEMEvent[] = [
  { id: "AUD-1001", event_type: "LOGIN_SUCCESS", severity: "INFO", user: "Ayush", ip: "103.21.124.50", device: "Windows PC", location: "Delhi", action: "AUTHENTICATE", resource: "Dashboard", time: "10 mins ago" },
  { id: "AUD-1002", event_type: "API_KEY_CREATED", severity: "INFO", user: "Ayush", ip: "103.21.124.50", device: "Windows PC", location: "Delhi", action: "CREATE", resource: "api_keys/nsx_live_9012", time: "25 mins ago" },
  { id: "AUD-1003", event_type: "DATA_READ", severity: "INFO", user: "Sarah_SOC", ip: "49.207.180.12", device: "MacBook Pro", location: "Mumbai", action: "SELECT", resource: "incidents", time: "40 mins ago" },
  { id: "AUD-1004", event_type: "PRIVILEGE_ESCALATION", severity: "CRITICAL", user: "Analyst_Bob", ip: "185.220.101.5", device: "Linux Workstation", location: "Frankfurt", action: "UNAUTHORIZED_EXEC", resource: "/api/v2/admin/system", time: "1 hour ago" },
  { id: "AUD-1005", event_type: "BRUTE_FORCE_ATTACK", severity: "HIGH", user: "Unknown", ip: "198.51.100.99", device: "Automated Botnet", location: "Moscow", action: "LOGIN_RETRY_10X", resource: "/api/auth/login", time: "2 hours ago" },
];

const MOCK_ALERTS: SIEMAlert[] = [
  { alert_id: "SIEM-ALT-1001", severity: "CRITICAL", title: "PRIVILEGE_ESCALATION", description: "User Analyst_Bob (SECURITY_ANALYST) attempted unauthorized execution on /api/v2/admin/system", user: "Analyst_Bob", resource: "/api/v2/admin/system", time: "15 mins ago", status: "OPEN" },
  { alert_id: "SIEM-ALT-1002", severity: "HIGH", title: "BRUTE_FORCE_ATTACK", description: "Brute force login attack detected: 10 failed login attempts from IP 185.220.101.5 in 3 minutes", user: "Unknown", resource: "Auth API", time: "40 mins ago", status: "INVESTIGATING" },
  { alert_id: "SIEM-ALT-1003", severity: "HIGH", title: "IMPOSSIBLE_TRAVEL_BLOCKED", description: "Impossible travel velocity anomaly: Delhi to Frankfurt in 5 minutes", user: "Analyst_Bob", resource: "Session Security Engine", time: "1 hour ago", status: "RESOLVED" },
];

const TABS = [
  { id: "overview", label: "Security Overview", icon: <Activity className="w-4 h-4" /> },
  { id: "events", label: "Security Events", icon: <FileText className="w-4 h-4" /> },
  { id: "threats", label: "Threat Detection", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "alerts", label: "Alert Management", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "integrity", label: "Log Integrity", icon: <Lock className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SIEMSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState<SIEMAlert[]>(MOCK_ALERTS);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.alert_id === id ? { ...a, status: "RESOLVED" } : a))
    );
  };

  const severityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "px-2 py-0.5 text-xs font-bold rounded bg-red-500/10 text-red-500 border border-red-500/20";
      case "HIGH":
        return "px-2 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "MEDIUM":
        return "px-2 py-0.5 text-xs font-bold rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "LOW":
        return "px-2 py-0.5 text-xs font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "px-2 py-0.5 text-xs font-bold rounded bg-slate-500/10 text-slate-400";
    }
  };

  const alertStatusBadge = (st: string) => {
    switch (st) {
      case "OPEN":
        return "px-2.5 py-0.5 text-xs font-bold rounded bg-red-500/10 text-red-500 border border-red-500/20";
      case "INVESTIGATING":
        return "px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "RESOLVED":
        return "px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "px-2.5 py-0.5 text-xs font-bold rounded bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              SIEM-Grade Security Monitoring &amp; Audit
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 25 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              SHA-256 Cryptographic Hash Chain Audit Trail, Threat Correlation Engine &amp; Attack Timelines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>SIEM Monitoring Score:</span>
          <span className="text-lg font-mono">99/100</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Security Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Log Integrity</p>
                <h3 className="text-xl font-black text-emerald-500 mt-1">CHAIN VALID</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">SHA-256 Linked</p>
              </div>
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Events Collected</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">1,250 Events</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">All Eras Monitored</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Threats Today</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">3 Detections</h3>
                <p className="text-xs text-amber-500 font-medium mt-1">Correlation Engine</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Critical Alerts</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">1 Open</h3>
                <p className="text-xs text-red-500 font-medium mt-1">Requires SOC Review</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">SIEM Monitoring Controls</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Immutable SHA-256 Cryptographic Hash Chain Audit Logs</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Every event includes PreviousHash linking to predecessor. Modifications break chain and trigger alert.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASS</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Real-Time Threat Correlation Engine</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Correlates Brute Force (10 failed logins), Privilege Escalation, API Abuse, and Data Exfiltration.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security Events */}
      {activeTab === "events" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Normalized Security Event Stream</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">All Eras Monitored</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">User</th>
                  <th className="p-3">IP / Location</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_EVENTS.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono text-slate-900 dark:text-zinc-100">{evt.id}</td>
                    <td className="p-3 font-mono font-semibold">{evt.event_type}</td>
                    <td className="p-3"><span className={severityBadge(evt.severity)}>{evt.severity}</span></td>
                    <td className="p-3 font-mono">{evt.user}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.ip} ({evt.location})</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.resource}</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{evt.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Threat Detection */}
      {activeTab === "threats" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Threat Correlation Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Brute Force Detection Engine</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-500 rounded">HIGH SEVERITY</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Fires when an IP address accumulates 10+ failed logins in a 5-minute window.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Privilege Escalation Detector</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500/10 text-red-500 rounded">CRITICAL SEVERITY</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Fires when non-admin users attempt execution on restricted admin API routes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Alert Management */}
      {activeTab === "alerts" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Active SIEM Threat Alerts</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Incident Response Queue</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Alert ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Affected User</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {alerts.map(alt => (
                  <tr key={alt.alert_id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{alt.alert_id}</td>
                    <td className="p-3 font-mono">{alt.title}</td>
                    <td className="p-3"><span className={severityBadge(alt.severity)}>{alt.severity}</span></td>
                    <td className="p-3 font-mono">{alt.user}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{alt.resource}</td>
                    <td className="p-3"><span className={alertStatusBadge(alt.status)}>{alt.status}</span></td>
                    <td className="p-3">
                      {alt.status !== "RESOLVED" ? (
                        <button
                          onClick={() => handleResolveAlert(alt.alert_id)}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Log Integrity */}
      {activeTab === "integrity" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cryptographic Hash Chain Integrity Verification</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">SHA-256 Tamper Detection Engine (Genesis Root Linked)</p>
                </div>
              </div>
              <span className="px-3 py-1 text-sm font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                Hash Chain: VALID
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Total Verified Logs</p>
                <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">1,250 Entries</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Tampered Log Index</p>
                <p className="text-lg font-black text-emerald-500 mt-1">None (-1)</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Last Verified</p>
                <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
