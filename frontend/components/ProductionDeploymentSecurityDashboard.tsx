"use client";

import React, { useState } from "react";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Activity,
  RotateCcw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadinessCheck {
  id: string;
  category: string;
  check_name: string;
  status: "PASS" | "FAIL" | "WARN";
  details: string;
  recommendation: string;
}

interface ServiceHealthItem {
  service_name: string;
  status: "Healthy" | "Degraded" | "Unhealthy";
  latency_ms: number;
  details: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CHECKS: ReadinessCheck[] = [
  { id: "CHK-1001", category: "Environment", check_name: "Debug Mode Disabled", status: "PASS", details: "ENV=production, DEBUG=false verified in runtime environment", recommendation: "Keep debug mode disabled in production builds" },
  { id: "CHK-1002", category: "Transport", check_name: "TLS 1.3 & HSTS Enforcement", status: "PASS", details: "HTTPS enforced with TLS 1.3 and HSTS header max-age=31536000", recommendation: "Enforce TLS 1.3 minimum cipher suites" },
  { id: "CHK-1003", category: "BrowserCookie", check_name: "Secure Session Cookies", status: "PASS", details: "HttpOnly=true, Secure=true, SameSite=Strict configured on all auth tokens", recommendation: "Maintain strict cookie attributes for session protection" },
  { id: "CHK-1004", category: "Container", check_name: "Non-Root Container Execution", status: "PASS", details: "Docker container runs under unprivileged UID 10001 (USER netsentinel)", recommendation: "Ensure containers maintain read-only root filesystems" },
  { id: "CHK-1005", category: "Database", check_name: "Encrypted DB Transport & Least-Privilege Users", status: "PASS", details: "PostgreSQL SSLMode=verify-full with dedicated unprivileged App DB User", recommendation: "Rotate database passwords periodically via HashiCorp Vault" },
];

const MOCK_SERVICES: ServiceHealthItem[] = [
  { service_name: "Go DPI Backend Engine", status: "Healthy", latency_ms: 2, details: "HTTP 200 OK - All routes active" },
  { service_name: "Next.js 16 Frontend App", status: "Healthy", latency_ms: 4, details: "HTTP 200 OK - React Server Components active" },
  { service_name: "PostgreSQL Primary Database", status: "Healthy", latency_ms: 3, details: "SSL Connection active, SSLMode=verify-full" },
  { service_name: "Redis Sentinel Cache & Rate Limiter", status: "Healthy", latency_ms: 1, details: "PONG - Session Store active" },
  { service_name: "Trivy Container Vulnerability Scanner", status: "Healthy", latency_ms: 12, details: "0 Critical Container Vulnerabilities" },
  { service_name: "HashiCorp Vault Service", status: "Healthy", latency_ms: 5, details: "Key Rotation & Secret Engine active" },
];

const TABS = [
  { id: "posture", label: "Production Security Posture", icon: <Rocket className="w-4 h-4" /> },
  { id: "environment", label: "Environment Security", icon: <Lock className="w-4 h-4" /> },
  { id: "tls", label: "TLS & Browser Security", icon: <Globe className="w-4 h-4" /> },
  { id: "health", label: "Infrastructure Health", icon: <Activity className="w-4 h-4" /> },
  { id: "strategy", label: "Deployment Strategy", icon: <RotateCcw className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductionDeploymentSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("posture");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Rocket className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Production Deployment Security
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 27 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Production Readiness Scanner, TLS 1.3 / HSTS Transport, Secure Cookies &amp; Zero-Downtime Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Production Security Score:</span>
          <span className="text-lg font-mono">98/100</span>
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

      {/* Tab 1: Posture */}
      {activeTab === "posture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Deployment Status</p>
                <h3 className="text-xl font-black text-emerald-500 mt-1">READY FOR LIVE</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Score Target 96+ Met</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Passed Checks</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">5 / 5 Passed</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">100% Security Validated</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Failed Checks</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">0 Checks</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Zero Blockers</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Rollback State</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">READY</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Blue/Green Snapshot Active</p>
              </div>
              <RotateCcw className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Production Readiness Evaluation Controls</h2>
            <div className="space-y-3">
              {MOCK_CHECKS.map(chk => (
                <div key={chk.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{chk.check_name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{chk.details}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{chk.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Environment Security */}
      {activeTab === "environment" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Environment &amp; Debug Status Validation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Environment Mode</p>
                <p className="text-lg font-black text-emerald-500 mt-1">production</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Debug Mode Flag</p>
                <p className="text-lg font-black text-emerald-500 mt-1">false (Disabled)</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Development Secrets</p>
                <p className="text-lg font-black text-emerald-500 mt-1">0 (Vault Managed)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TLS & Browser Security */}
      {activeTab === "tls" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">TLS 1.3 Transport &amp; Browser Security Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">HTTPS Transport &amp; TLS 1.3</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Strict HTTPS redirect active. TLS 1.3 cipher suite enforced. HSTS header active (max-age=31536000).</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">TLS 1.3 ENFORCED</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Secure Browser Cookie Policy</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">HttpOnly=true, Secure=true, SameSite=Strict enforced across all access and refresh session tokens.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">STRICT COOKIES PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Infrastructure Health */}
      {activeTab === "health" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Infrastructure Component Health (Score: 98/100)</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Real-Time Health Probes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Service Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Health Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_SERVICES.map(svc => (
                  <tr key={svc.service_name} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{svc.service_name}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{svc.status}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{svc.latency_ms} ms</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{svc.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Deployment Strategy */}
      {activeTab === "strategy" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Zero-Downtime Deployment Strategy &amp; Rollback Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Active Deployment Version</p>
                <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">v2.27.0-era27</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Stable Rollback Version</p>
                <p className="text-lg font-black text-emerald-500 mt-1">v2.26.0-era26</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Rollback Readiness</p>
                <p className="text-lg font-black text-emerald-500 mt-1">READY</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
