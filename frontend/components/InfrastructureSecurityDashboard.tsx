"use client";

import React, { useState } from "react";
import {
  Server,
  Container,
  Network,
  Lock,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
  CheckCircle2,
  Info,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InfraSecurityDomain {
  name: string;
  score: number;
  max_score: number;
  weight: number;
  status: "secure" | "warning" | "critical";
  description: string;
}

interface HardeningCheck {
  id: string;
  category: string;
  control: string;
  status: "pass" | "fail" | "warning" | "info";
  severity: string;
  description: string;
  remediation: string;
}

interface DockerSecurityCheck {
  check: string;
  status: "pass" | "fail" | "warning" | "info";
  severity: string;
  description: string;
  remediation: string;
}

interface NetworkSegmentControl {
  zone: string;
  services: string[];
  accessible_from_internet: boolean;
  protocol: string;
  description: string;
  status: "secure" | "exposed" | "warning";
}

interface TLSControl {
  control: string;
  value: string;
  compliant: boolean;
  standard: string;
  description: string;
}

// ─── Static Posture Data (matches InfrastructureSecurityService) ──────────────

const DOMAINS: InfraSecurityDomain[] = [
  { name: "Server Hardening", score: 80, max_score: 100, weight: 0.20, status: "secure", description: "SSH hardening, firewall rules, debug mode, secret key strength" },
  { name: "Container Security", score: 91, max_score: 100, weight: 0.25, status: "secure", description: "Non-root users, read-only FS, capability drops, no privileged mode" },
  { name: "Network Segmentation", score: 100, max_score: 100, weight: 0.20, status: "secure", description: "Internet DMZ isolation, DB/Redis internal-only, reverse proxy boundary" },
  { name: "TLS & Cryptography", score: 100, max_score: 100, weight: 0.20, status: "secure", description: "TLS 1.3 minimum, strong ciphers, HSTS, forward secrecy" },
  { name: "Environment Security", score: 80, max_score: 100, weight: 0.15, status: "secure", description: "No debug mode, strong secrets, no default credentials, CORS restriction" },
];

const HARDENING_CHECKS: HardeningCheck[] = [
  { id: "SRV-001", category: "Server Configuration", control: "GIN_MODE Production Setting", status: "warning", severity: "medium", description: "Set GIN_MODE=release to disable debug routes in production.", remediation: "Set GIN_MODE=release in production environment variables." },
  { id: "SRV-002", category: "Cryptographic Keys", control: "JWT_SECRET Strength", status: "pass", severity: "critical", description: "JWT_SECRET is set with adequate length and entropy.", remediation: "" },
  { id: "SRV-003", category: "Database Security", control: "DATABASE_URL Configuration", status: "info", severity: "high", description: "DATABASE_URL not configured — using defaults or secrets manager.", remediation: "" },
  { id: "SRV-004", category: "Network Security", control: "CORS Origin Configuration", status: "pass", severity: "high", description: "CORS origins are not set to wildcard. Cross-origin requests restricted.", remediation: "" },
  { id: "SRV-005", category: "Transport Security", control: "HTTPS & TLS Enforcement", status: "pass", severity: "critical", description: "HSTS enforced via SecurityHeadersMiddleware (Era 19). HTTP redirected to HTTPS.", remediation: "" },
  { id: "SRV-006", category: "HTTP Security", control: "Security Headers Active", status: "pass", severity: "medium", description: "CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Permissions-Policy active (Era 19).", remediation: "" },
  { id: "SRV-007", category: "DoS Protection", control: "Adaptive Rate Limiting", status: "pass", severity: "high", description: "AdaptiveRateLimitMiddleware active (Era 20). 100→20→0 req/min under abuse.", remediation: "" },
  { id: "SRV-008", category: "Input Security", control: "Input Validation & Sanitization", status: "pass", severity: "high", description: "InputValidationService active (Era 19). XSS, SQLi, OS command injection blocked.", remediation: "" },
  { id: "SRV-009", category: "Server Access", control: "SSH Hardening Configuration", status: "info", severity: "critical", description: "Apply SSH hardening: non-default port 2222, key-only auth, PermitRootLogin no, Fail2Ban.", remediation: "Apply docs/server_hardening_guide.md to production server before deployment." },
  { id: "SRV-010", category: "Network Security", control: "Firewall Configuration", status: "info", severity: "critical", description: "UFW firewall rules: allow 443/tcp and 2222/tcp only. All other ports denied.", remediation: "Run: ufw allow 443/tcp; ufw allow 2222/tcp; ufw default deny incoming; ufw enable" },
];

const DOCKER_CHECKS: DockerSecurityCheck[] = [
  { check: "Non-Root Container User", status: "pass", severity: "critical", description: "Hardened Dockerfiles use dedicated non-root user (netsentinel, UID 10001).", remediation: "" },
  { check: "Read-Only Root Filesystem", status: "pass", severity: "high", description: "Hardened Dockerfiles specify read-only filesystem. Malware cannot write persistent files.", remediation: "" },
  { check: "Capability Drop (ALL + NET_BIND_SERVICE)", status: "pass", severity: "high", description: "All Linux capabilities dropped. Only NET_BIND_SERVICE added for port binding.", remediation: "" },
  { check: "No Privileged Mode", status: "pass", severity: "critical", description: "Containers do not run in privileged mode. No access to host kernel or devices.", remediation: "" },
  { check: "No New Privileges Flag", status: "pass", severity: "high", description: "security_opt: no-new-privileges prevents SUID/SGID escalation.", remediation: "" },
  { check: "Resource Limits (Memory & CPU)", status: "pass", severity: "medium", description: "Backend: 512MB/1CPU. Frontend: 256MB/0.5CPU. DoS via resource exhaustion prevented.", remediation: "" },
  { check: "Minimal Base Image", status: "pass", severity: "medium", description: "Backend: gcr.io/distroless/static. Frontend: node:20-alpine.", remediation: "" },
  { check: "Image Vulnerability Scanning (Trivy)", status: "info", severity: "high", description: "Trivy scanning integrated. Run docker/scan_images.sh before every production deployment.", remediation: "Run: ./docker/scan_images.sh before deploying." },
  { check: "Secrets Not in ENV", status: "info", severity: "critical", description: "Production secrets must be injected via Docker secrets or vault, not ENV variables.", remediation: "Use HashiCorp Vault or Docker secrets to inject credentials at runtime (Era 22)." },
  { check: "Network Isolation (Custom Bridge)", status: "pass", severity: "high", description: "All containers on dedicated bridge network (172.20.0.0/24). DB/Redis not externally exposed.", remediation: "" },
];

const NETWORK_CONTROLS: NetworkSegmentControl[] = [
  { zone: "Internet DMZ", services: ["Nginx/Caddy Reverse Proxy (:443)"], accessible_from_internet: true, protocol: "HTTPS (TLS 1.3)", description: "Only HTTPS/443 exposed to internet. TLS termination at edge.", status: "secure" },
  { zone: "Application Layer", services: ["Next.js Frontend (:3000)", "Go API Backend (:8080)"], accessible_from_internet: false, protocol: "HTTP (internal bridge)", description: "Application services on internal bridge. Only accessible via reverse proxy.", status: "secure" },
  { zone: "Data Layer", services: ["PostgreSQL (:5432)", "Redis (:6379)"], accessible_from_internet: false, protocol: "TCP (internal bridge)", description: "Database and cache on isolated internal network. No external port binding.", status: "secure" },
  { zone: "Management", services: ["SSH (:2222 — non-default)", "Monitoring Agent"], accessible_from_internet: true, protocol: "SSH (key-based only)", description: "Non-default SSH port, key-based auth only, Fail2Ban active.", status: "secure" },
];

const TLS_CONTROLS: TLSControl[] = [
  { control: "TLS Version", value: "TLS 1.3 (minimum)", compliant: true, standard: "NIST SP 800-52 Rev 2", description: "TLS 1.0, 1.1 disabled. TLS 1.3 only enforced." },
  { control: "Cipher Suites", value: "TLS_AES_256_GCM_SHA384", compliant: true, standard: "NIST SP 800-52 Rev 2", description: "Only AEAD cipher suites with forward secrecy." },
  { control: "HSTS Header", value: "max-age=31536000; includeSubDomains; preload", compliant: true, standard: "RFC 6797", description: "Strict-Transport-Security enforced. Browsers redirect HTTP→HTTPS." },
  { control: "Certificate Validity", value: "Let's Encrypt (auto-renewal)", compliant: true, standard: "CA/Browser Forum", description: "Automated certificate renewal. No manual expiry risk." },
  { control: "Forward Secrecy", value: "ECDHE key exchange", compliant: true, standard: "NIST SP 800-52 Rev 2", description: "Ephemeral keys. Past sessions cannot be decrypted if key is compromised." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OVERALL_SCORE = Math.round(
  DOMAINS.reduce((acc, d) => acc + d.score * d.weight, 0)
);

function statusIcon(status: string, size = "w-5 h-5") {
  switch (status) {
    case "pass":
    case "secure":
      return <CheckCircle2 className={`${size} text-emerald-500`} />;
    case "fail":
    case "exposed":
      return <ShieldAlert className={`${size} text-red-500`} />;
    case "warning":
      return <TriangleAlert className={`${size} text-amber-500`} />;
    default:
      return <Info className={`${size} text-blue-400`} />;
  }
}

function statusBadge(status: string) {
  const base = "px-2 py-0.5 text-xs font-semibold rounded-full border";
  switch (status) {
    case "pass":
    case "secure":
      return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`;
    case "fail":
    case "exposed":
      return `${base} bg-red-500/10 text-red-500 border-red-500/20`;
    case "warning":
      return `${base} bg-amber-500/10 text-amber-500 border-amber-500/20`;
    default:
      return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
  }
}

function severityBadge(severity: string) {
  const base = "px-1.5 py-0.5 text-xs font-semibold rounded";
  switch (severity) {
    case "critical":
      return `${base} bg-red-500/10 text-red-400`;
    case "high":
      return `${base} bg-orange-500/10 text-orange-400`;
    case "medium":
      return `${base} bg-amber-500/10 text-amber-400`;
    default:
      return `${base} bg-slate-500/10 text-slate-400`;
  }
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "posture", label: "Security Posture", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "hardening", label: "Server Hardening", icon: <Server className="w-4 h-4" /> },
  { id: "docker", label: "Container Security", icon: <Container className="w-4 h-4" /> },
  { id: "network", label: "Network Segmentation", icon: <Network className="w-4 h-4" /> },
  { id: "tls", label: "TLS & Cryptography", icon: <Lock className="w-4 h-4" /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeWidth="10" />
        <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{score}</span>
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function PostureTab() {
  const passedDomains = DOMAINS.filter(d => d.status === "secure").length;
  return (
    <div className="space-y-6">
      {/* Hero score */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={OVERALL_SCORE} />
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Infrastructure Security Score</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Weighted across 5 security domains: server hardening, container security, network segmentation, TLS controls, and environment configuration.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Grade: A
            </span>
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Era 21 Active
            </span>
            <span className="text-sm text-slate-500 dark:text-zinc-400">
              {passedDomains}/5 Domains Secure
            </span>
          </div>
        </div>
      </div>

      {/* Domain scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map(domain => (
          <div key={domain.name} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{domain.name}</span>
              {statusIcon(domain.status)}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">{domain.score}</span>
              <span className="text-sm text-slate-500 dark:text-zinc-400 mb-0.5">/ {domain.max_score}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${domain.score}%`,
                  background: domain.score >= 85 ? "#10b981" : domain.score >= 60 ? "#f59e0b" : "#ef4444",
                  transition: "width 1s ease",
                }}
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">{domain.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HardeningTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const passed = HARDENING_CHECKS.filter(c => c.status === "pass").length;
  const warnings = HARDENING_CHECKS.filter(c => c.status === "warning").length;
  const info = HARDENING_CHECKS.filter(c => c.status === "info").length;

  return (
    <div className="space-y-4">
      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
          <div className="text-2xl font-black text-emerald-500">{passed}</div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Passed</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
          <div className="text-2xl font-black text-amber-500">{warnings}</div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Warnings</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
          <div className="text-2xl font-black text-blue-400">{info}</div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Action Required</div>
        </div>
      </div>

      {/* Checks list */}
      {HARDENING_CHECKS.map(check => (
        <div key={check.id} className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <button
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
            onClick={() => setExpandedId(expandedId === check.id ? null : check.id)}
          >
            {statusIcon(check.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{check.control}</span>
                <span className={statusBadge(check.status)}>{check.status.toUpperCase()}</span>
                <span className={severityBadge(check.severity)}>{check.severity}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{check.id} · {check.category}</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === check.id ? "rotate-90" : ""}`} />
          </button>
          {expandedId === check.id && (
            <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-sm text-slate-600 dark:text-zinc-300 mt-3">{check.description}</p>
              {check.remediation && (
                <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Remediation</p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-mono">{check.remediation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DockerTab() {
  const passed = DOCKER_CHECKS.filter(c => c.status === "pass").length;
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Container Security Controls</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">docker/hardened.Dockerfile.backend & docker/hardened.Dockerfile.frontend</p>
        </div>
        <span className="text-2xl font-black text-emerald-500">{passed}/{DOCKER_CHECKS.length}</span>
      </div>
      {DOCKER_CHECKS.map(check => (
        <div key={check.check} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            {statusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{check.check}</span>
                <span className={statusBadge(check.status)}>{check.status.toUpperCase()}</span>
                <span className={severityBadge(check.severity)}>{check.severity}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{check.description}</p>
              {check.remediation && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">{check.remediation}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NetworkTab() {
  const zoneColors: Record<string, string> = {
    "Internet DMZ": "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "Application Layer": "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    "Data Layer": "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "Management": "bg-amber-500/10 border-amber-500/20 text-amber-500",
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">Network Segmentation Model</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Only port 443 (HTTPS) is exposed to the internet. All internal services operate on an isolated bridge network (172.20.0.0/24).</p>
      </div>
      {NETWORK_CONTROLS.map(zone => (
        <div key={zone.zone} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${zoneColors[zone.zone] || ""}`}>{zone.zone}</span>
                {statusIcon(zone.status)}
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Internet Access: {zone.accessible_from_internet ? "✅ Yes" : "🔒 No"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {zone.services.map(svc => (
              <span key={svc} className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-mono">{svc}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{zone.description}</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Protocol: {zone.protocol}</p>
        </div>
      ))}
    </div>
  );
}

function TLSTab() {
  const compliant = TLS_CONTROLS.filter(t => t.compliant).length;
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">TLS & Cryptographic Compliance</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">NIST SP 800-52 Rev 2 + RFC 6797 + CA/Browser Forum Baseline</p>
        </div>
        <span className="text-2xl font-black text-emerald-500">{compliant}/{TLS_CONTROLS.length}</span>
      </div>
      {TLS_CONTROLS.map(ctrl => (
        <div key={ctrl.control} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{ctrl.control}</span>
                <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded font-mono">{ctrl.standard}</span>
              </div>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">{ctrl.value}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{ctrl.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function InfrastructureSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("posture");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Infrastructure & Platform Security
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 21 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Server Hardening, Docker Security, Network Segmentation & TLS Compliance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Infrastructure Score:</span>
          <span className="text-lg font-mono">{OVERALL_SCORE}/100</span>
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

      {/* Tab content */}
      <div>
        {activeTab === "posture" && <PostureTab />}
        {activeTab === "hardening" && <HardeningTab />}
        {activeTab === "docker" && <DockerTab />}
        {activeTab === "network" && <NetworkTab />}
        {activeTab === "tls" && <TLSTab />}
      </div>
    </div>
  );
}
