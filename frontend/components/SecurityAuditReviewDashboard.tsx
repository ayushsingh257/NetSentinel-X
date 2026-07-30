"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Activity,
  CheckSquare,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Finding {
  id: string;
  title: string;
  component: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  security_impact: string;
  status: string;
}

const MOCK_FINDINGS: Finding[] = [
  {
    id: "SEC-31-001",
    title: "Legacy Go dependency quic-go vulnerability (GO-2026-5676)",
    component: "Backend Dependencies",
    severity: "MEDIUM",
    security_impact: "Mitigated via dependency upgrade to v0.59.1 in Go 1.26 environment.",
    status: "RESOLVED",
  },
  {
    id: "SEC-31-002",
    title: "Frontend JSX clean linting check",
    component: "Frontend Components",
    severity: "INFORMATIONAL",
    security_impact: "Cleaned up unused UI imports and ensured full TypeScript compliance.",
    status: "RESOLVED",
  },
  {
    id: "SEC-31-003",
    title: "Zero Trust micro-segmentation audit",
    component: "Docker Container Gateway",
    severity: "LOW",
    security_impact: "Non-root container user context (UID 10001) enforced.",
    status: "RESOLVED",
  },
];

const TABS = [
  { id: "threat_model", label: "Threat Model (STRIDE)", icon: <Layers className="w-4 h-4" /> },
  { id: "risk_dist", label: "Risk Distribution", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "zero_trust", label: "Zero Trust Architecture", icon: <Lock className="w-4 h-4" /> },
  { id: "findings", label: "Audit Findings", icon: <CheckSquare className="w-4 h-4" /> },
  { id: "recommendations", label: "Recommendations", icon: <FileText className="w-4 h-4" /> },
];

export default function SecurityAuditReviewDashboard() {
  const [activeTab, setActiveTab] = useState("threat_model");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Enterprise DevSecOps &amp; Zero Trust Security Audit
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 31 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              STRIDE Threat Modeling, Data at Rest/Transit Audits, SAST/SCA &amp; NIST SP 800-207 Zero Trust Review
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl font-bold text-sm border border-purple-500/20">
          <span>Zero Trust Rating:</span>
          <span className="text-lg font-mono">100% COMPLIANT</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Threat Model */}
      {activeTab === "threat_model" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">STRIDE Threat Vectors</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">14 Identified</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">100% Mitigated</p>
              </div>
              <Layers className="w-10 h-10 text-purple-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Trust Boundaries</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">4 Isolated Zones</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">Micro-Segmented</p>
              </div>
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">DevSecOps Audit Score</p>
                <h3 className="text-2xl font-black text-emerald-500 mt-1">98 / 100</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">ENTERPRISE AUDITED</p>
              </div>
              <Activity className="w-10 h-10 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">STRIDE Threat Category Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">S — Spoofing</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">RS256 JWT Rotation, Device Fingerprinting, TOTP MFA.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">3 / 3 Mitigated</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">T — Tampering</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">SHA-256 Tamper-Evident SIEM Audit Chain, TLS 1.3 Strict.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">3 / 3 Mitigated</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">R — Repudiation</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Immutable Audit Trails, Full State Transition History.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">2 / 2 Mitigated</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">I — Info Disclosure</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">AES-256-GCM at rest, Automated PII Masking Engine.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">3 / 3 Mitigated</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">D — Denial of Service</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Adaptive Token-Bucket Rate Limiter (100 req/min).</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">2 / 2 Mitigated</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1 border border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-purple-500">E — Elevation of Privilege</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">10-Role RBAC Isolation, Non-Root UID 10001 Containers.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">2 / 2 Mitigated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Risk Distribution */}
      {activeTab === "risk_dist" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">CRITICAL</span>
              <p className="text-2xl font-black text-slate-400 mt-1">0 Findings</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">HIGH</span>
              <p className="text-2xl font-black text-slate-400 mt-1">0 Findings</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">MEDIUM</span>
              <p className="text-2xl font-black text-amber-500 mt-1">1 Mitigated</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">LOW</span>
              <p className="text-2xl font-black text-blue-500 mt-1">2 Verified</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">INFORMATIONAL</span>
              <p className="text-2xl font-black text-purple-500 mt-1">2 Clean</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Zero Trust Architecture */}
      {activeTab === "zero_trust" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">NIST SP 800-207 Zero Trust Principles Checklist</h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Principle 1: Never Trust, Always Verify</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">RS256 JWT Token &amp; Device context verification on every request.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">VERIFIED</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Principle 2: Least Privilege Access</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">10-Role RBAC permission isolation guards on all endpoints.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">VERIFIED</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Principle 3: Assume Breach</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Micro-segmented containers &amp; SHA-256 tamper-evident SIEM chain.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Findings */}
      {activeTab === "findings" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">DevSecOps Audit Findings &amp; Mitigations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Finding Title</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Security Impact / Mitigation</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_FINDINGS.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{f.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{f.title}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{f.component}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-500 rounded">{f.severity}</span></td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{f.security_impact}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Recommendations */}
      {activeTab === "recommendations" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise DevSecOps Recommendations</h2>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-zinc-400">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Maintain continuous SAST/SCA automated scanning on all GitHub pull requests.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enforce mandatory RS256 key rotation every 90 days via Vault KMS.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Perform periodic sandbox restore verification of database backups.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keep all Next.js and Go dependencies updated to latest security patches.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
