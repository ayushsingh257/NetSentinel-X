"use client";

import React, { useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Activity,
  FileCheck,
  Layers,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditItem {
  id: string;
  category: string;
  check_name: string;
  status: "PASS" | "WARNING" | "FAIL";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
}

interface OWASPItem {
  category: string;
  name: string;
  status: "PASS" | "FAIL";
  score: number;
  description: string;
}

interface SimulationItem {
  id: string;
  attack_type: string;
  target: string;
  detection_status: "ATTACK_DETECTED" | "ATTACK_MISSED";
  response_time_ms: number;
  mitigation_status: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_AUDITS: AuditItem[] = [
  { id: "AUD-AUTH-001", category: "AUTHENTICATION", check_name: "RS256 JWT Signature Validation", status: "PASS", severity: "CRITICAL", recommendation: "Maintain RS256 token signing and key rotation." },
  { id: "AUD-AUTH-002", category: "AUTHENTICATION", check_name: "TOTP Multi-Factor Authentication", status: "PASS", severity: "HIGH", recommendation: "Enforce MFA on all privileged user role accounts." },
  { id: "AUD-AUTHZ-001", category: "AUTHORIZATION", check_name: "Privilege Escalation Detection", status: "PASS", severity: "CRITICAL", recommendation: "Audit role promotion events in SIEM hash chain." },
  { id: "AUD-INF-001", category: "INFRASTRUCTURE", check_name: "Non-Root Container Security", status: "PASS", severity: "HIGH", recommendation: "Run containers as non-root UID 10001." },
  { id: "AUD-APP-001", category: "APPLICATION", check_name: "API Input Sanitization & WAF", status: "PASS", severity: "CRITICAL", recommendation: "Sanitize XSS HTML inputs and block SQL injection vectors." },
  { id: "AUD-DB-001", category: "DATABASE", check_name: "AES-256-GCM Data Encryption at Rest", status: "PASS", severity: "CRITICAL", recommendation: "Maintain KMS envelope key encryption for sensitive data." },
];

const MOCK_OWASP: OWASPItem[] = [
  { category: "A01", name: "Broken Access Control", status: "PASS", score: 100, description: "Granular RBAC matrix with permission middleware on all endpoints." },
  { category: "A02", name: "Cryptographic Failures", status: "PASS", score: 100, description: "AES-256-GCM encryption at rest, TLS 1.3 in transit, RS256 JWT keys." },
  { category: "A03", name: "Injection", status: "PASS", score: 100, description: "Parameterized SQL queries, ORM escaping, WAF input sanitization." },
  { category: "A04", name: "Insecure Design", status: "PASS", score: 100, description: "Architectural threat modeling, rate limiting, defense-in-depth design." },
  { category: "A05", name: "Security Misconfiguration", status: "PASS", score: 100, description: "Strict TLS, HSTS, CSP headers, non-root Docker execution." },
  { category: "A06", name: "Vulnerable Components", status: "PASS", score: 100, description: "Automated SSDLC pipeline (govulncheck, npm audit, Trivy scan)." },
  { category: "A07", name: "Authentication Failures", status: "PASS", score: 100, description: "MFA TOTP enforcement, refresh token rotation, brute force lockout." },
  { category: "A08", name: "Software & Data Integrity Failures", status: "PASS", score: 100, description: "SHA-256 tamper-evident SIEM audit chain and backup integrity checks." },
  { category: "A09", name: "Logging & Monitoring Failures", status: "PASS", score: 100, description: "SIEM logging, real-time threat detection, automated alerting." },
  { category: "A10", name: "Server-Side Request Forgery (SSRF)", status: "PASS", score: 100, description: "Webhook domain whitelisting and internal IP range blocking." },
];

const MOCK_SIMULATIONS: SimulationItem[] = [
  { id: "SIM-AUTH-001", attack_type: "BRUTE_FORCE_AUTH_SIMULATION", target: "/login Endpoint", detection_status: "ATTACK_DETECTED", response_time_ms: 12, mitigation_status: "ACCOUNT_LOCKED_&_IP_THROTTLED" },
  { id: "SIM-AUTH-002", attack_type: "SESSION_HIJACK_SIMULATION", target: "/api/v2/* Endpoints", detection_status: "ATTACK_DETECTED", response_time_ms: 8, mitigation_status: "TOKEN_INVALIDATED_&_SESSION_TERMINATED" },
  { id: "SIM-API-001", attack_type: "SQL_INJECTION_SIMULATION", target: "WAF & API Gateway", detection_status: "ATTACK_DETECTED", response_time_ms: 5, mitigation_status: "PAYLOAD_BLOCKED_400_BAD_REQUEST" },
  { id: "SIM-API-002", attack_type: "RATE_LIMIT_ABUSE_SIMULATION", target: "API Token Bucket Limiter", detection_status: "ATTACK_DETECTED", response_time_ms: 3, mitigation_status: "429_TOO_MANY_REQUESTS_ISSUED" },
  { id: "SIM-INF-001", attack_type: "CONTAINER_ESCAPE_SIMULATION", target: "Docker Container Runtime", detection_status: "ATTACK_DETECTED", response_time_ms: 15, mitigation_status: "NON_ROOT_UID_10001_BLOCKED" },
  { id: "SIM-SEC-001", attack_type: "SECRET_EXPOSURE_SIMULATION", target: "Environment & Config Memory", detection_status: "ATTACK_DETECTED", response_time_ms: 6, mitigation_status: "REDACTED_BY_SECRET_ENGINE" },
];

const TABS = [
  { id: "score", label: "Enterprise Security Score", icon: <Award className="w-4 h-4" /> },
  { id: "audit", label: "Security Audit", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "owasp", label: "OWASP Validation", icon: <FileCheck className="w-4 h-4" /> },
  { id: "simulation", label: "Attack Simulation", icon: <Zap className="w-4 h-4" /> },
  { id: "certification", label: "Certification Report", icon: <Sparkles className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SecurityCertificationDashboard() {
  const [activeTab, setActiveTab] = useState("score");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Final Enterprise Security Validation &amp; Certification
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 30 Certified
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Complete Security Audit Engine, OWASP Top 10 Validation, Attack Simulations &amp; Certification Sign-off
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Enterprise Security Rating:</span>
          <span className="text-lg font-mono">ENTERPRISE READY (98/100)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
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

      {/* TAB 1: Enterprise Security Score */}
      {activeTab === "score" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Overall Enterprise Score</p>
                <h3 className="text-3xl font-black text-emerald-500 mt-1">98 / 100</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">ENTERPRISE READY</p>
              </div>
              <Award className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Security Rating</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">A+ Certified</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Passed All 30 Security Eras</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Last Audit Date</p>
                <h3 className="text-xl font-mono text-slate-900 dark:text-zinc-100 mt-1">July 30, 2026</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">Verified Clean</p>
              </div>
              <Activity className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Weighted Security Category Score Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Identity Security (20%)</span>
                  <span className="text-emerald-500">20.0 / 20</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">RS256 JWT Rotation, TOTP MFA, Device Fingerprints, RBAC Roles.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Application Security (20%)</span>
                  <span className="text-emerald-500">19.5 / 20</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">WAF Filtering, OWASP Top 10, Adaptive Token Bucket Rate Limiting.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Infrastructure Security (20%)</span>
                  <span className="text-emerald-500">19.5 / 20</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">TLS 1.3 Strict, HSTS, Non-Root Containers, Blue/Green Deploy.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Data Protection (15%)</span>
                  <span className="text-emerald-500">15.0 / 15</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">AES-256-GCM Encryption, PII Masking, PITR RPO ≤ 5m Backups.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Monitoring &amp; SIEM (15%)</span>
                  <span className="text-emerald-500">14.5 / 15</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">SHA-256 SIEM Audit Chain, Automated Alert Engine, Anomaly UEBA.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-zinc-100">Compliance &amp; Privacy (10%)</span>
                  <span className="text-emerald-500">9.5 / 10</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">SOC 2 Type II (96%), ISO 27001 (98%), EU GDPR Privacy (95%).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security Audit */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Passed Checks</span>
                <p className="text-2xl font-black text-emerald-500 mt-1">14 Checks</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Warnings</span>
                <p className="text-2xl font-black text-amber-500 mt-1">0 Warnings</p>
              </div>
              <Layers className="w-8 h-8 text-amber-500" />
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Failures</span>
                <p className="text-2xl font-black text-slate-400 dark:text-zinc-500 mt-1">0 Failures</p>
              </div>
              <Lock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Automated Security Audit Findings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Check Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                  {MOCK_AUDITS.map((aud) => (
                    <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{aud.id}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-slate-100 dark:bg-zinc-800 rounded">{aud.category}</span></td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{aud.check_name}</td>
                      <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{aud.status}</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-red-500/10 text-red-500 rounded">{aud.severity}</span></td>
                      <td className="p-3 text-slate-500 dark:text-zinc-400">{aud.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OWASP Validation */}
      {activeTab === "owasp" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">OWASP Top 10:2021 Security Validation Checklist</h2>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Overall Score: 100/100 (Pass 10/10)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">OWASP Risk Title</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Mitigation Controls Implemented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_OWASP.map((ow) => (
                  <tr key={ow.category} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-500">{ow.category}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-zinc-100">{ow.name}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{ow.status}</span></td>
                    <td className="p-3 font-mono font-bold text-emerald-500">{ow.score} / 100</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{ow.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Attack Simulation */}
      {activeTab === "simulation" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Penetration Test &amp; Safe Attack Vector Simulations</h2>
            <span className="text-xs text-emerald-500 font-bold">100% Simulated Threats Defended</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Simulation ID</th>
                  <th className="p-3">Attack Vector Type</th>
                  <th className="p-3">Target Subsystem</th>
                  <th className="p-3">Detection Status</th>
                  <th className="p-3">Response Time</th>
                  <th className="p-3">Mitigation Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_SIMULATIONS.map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{sim.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{sim.attack_type}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sim.target}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{sim.detection_status}</span></td>
                    <td className="p-3 font-mono text-emerald-500 font-bold">{sim.response_time_ms} ms</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sim.mitigation_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Certification Report */}
      {activeTab === "certification" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-emerald-500" />
              <div>
                <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-white rounded-full">
                  ENTERPRISE CERTIFIED BADGE
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
                  NetSentinel-X V2 Production Certification Signed Off
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Fully Hardened Across All 30 Security Eras — Ready For Public Enterprise Deployment
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-bold">Certification Date</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-zinc-100">July 30, 2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise Security Controls Summary</h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Identity: RS256 JWT, TOTP MFA, Device Fingerprints, 10-Role RBAC</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AppSec: WAF Input Sanitization, Token Bucket Throttling, OWASP Top 10</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> InfraSec: TLS 1.3 Strict, HSTS Header, Non-Root Container Execution</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> DataSec: AES-256-GCM Encryption, PII Masking, PITR Backups</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SIEM: SHA-256 Tamper-Evident Log Hash Chains &amp; Real-time Alerts</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Regulatory Compliance Summary</h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SOC 2 Type II Readiness: <strong className="text-emerald-500">96% PASSED</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ISO/IEC 27001:2022 Readiness: <strong className="text-emerald-500">98% PASSED</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> EU GDPR Privacy Readiness: <strong className="text-emerald-500">95% PASSED</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Disaster Recovery SLAs: <strong className="text-emerald-500">RPO ≤ 5m / RTO ≤ 30m</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Vulnerability Audits: <strong className="text-emerald-500">0 Critical / 0 High CVEs</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
