"use client";

import React, { useState } from "react";
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Package,
  Server,
  Layers,
  FileCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SASTItem {
  id: string;
  rule_id: string;
  file: string;
  line: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  snippet: string;
  status: string;
}

interface DepItem {
  id: string;
  package: string;
  version: string;
  fixed: string;
  cve: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface ContainerItem {
  id: string;
  image: string;
  scanner: string;
  package: string;
  cve: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
}

interface SBOMItem {
  name: string;
  version: string;
  license: string;
  hash: string;
  type: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SAST: SASTItem[] = [
  { id: "SAST-1001", rule_id: "go.lang.security.audit.sqli.string-formatted-query", file: "backend/legacy_db.go", line: 42, severity: "INFO", description: "Parameterized queries enforced via database/sql $1 placeholders", snippet: "db.QueryRowContext(ctx, \"SELECT * FROM users WHERE id = $1\", id)", status: "CLEAN" },
  { id: "SAST-1002", rule_id: "ts.react.security.xss.dangerously-set-inner-html", file: "frontend/components/RenderHTML.tsx", line: 18, severity: "INFO", description: "DOMPurify sanitization applied prior to rendering untrusted HTML", snippet: "DOMPurify.sanitize(rawHTML)", status: "CLEAN" },
];

const MOCK_DEPS: DepItem[] = [
  { id: "DEP-1001", package: "github.com/gin-gonic/gin", version: "v1.9.1", fixed: "v1.9.1 (Latest)", cve: "CVE-2023-29406", severity: "LOW" },
  { id: "DEP-1002", package: "github.com/golang-jwt/jwt/v5", version: "v5.2.1", fixed: "v5.2.1 (Latest)", cve: "None", severity: "INFO" },
  { id: "DEP-1003", package: "next", version: "16.2.6", fixed: "16.2.6 (Latest)", cve: "None", severity: "INFO" },
];

const MOCK_CONTAINER: ContainerItem[] = [
  { id: "CTR-1001", image: "netsentinel-backend:latest", scanner: "Trivy-v0.50.0", package: "openssl", cve: "CVE-2024-0727", severity: "LOW", status: "PASS" },
  { id: "CTR-1002", image: "netsentinel-frontend:latest", scanner: "Trivy-v0.50.0", package: "busybox", cve: "CVE-2023-42363", severity: "LOW", status: "PASS" },
];

const MOCK_SBOM: SBOMItem[] = [
  { name: "github.com/gin-gonic/gin", version: "v1.9.1", license: "MIT", hash: "a897f21b199042b10a91f5e6b72803b901a18bc00921", type: "go-module" },
  { name: "github.com/golang-jwt/jwt/v5", version: "v5.2.1", license: "MIT", hash: "f10e4a77912401bc9a92a831e50012bc09a87ffc1290", type: "go-module" },
  { name: "next", version: "16.2.6", license: "MIT", hash: "b901a1bc8274a9b9a1029410bc901a21e7801a21e490", type: "npm-package" },
  { name: "react", version: "19.0.0", license: "MIT", hash: "c92841bc90a18bc91a2741ab0294101e789a102bc091", type: "npm-package" },
  { name: "alpine-base-os", version: "3.19.1", license: "MIT", hash: "d901a1bc8274a9b9a1029410bc901a21e7801a21e490", type: "container-layer" },
];

const TABS = [
  { id: "overview", label: "Pipeline Security Overview", icon: <GitBranch className="w-4 h-4" /> },
  { id: "sast", label: "SAST Results", icon: <FileCode className="w-4 h-4" /> },
  { id: "dependencies", label: "Dependency Security", icon: <Package className="w-4 h-4" /> },
  { id: "container", label: "Container Security", icon: <Server className="w-4 h-4" /> },
  { id: "sbom", label: "Software Bill of Materials (SBOM)", icon: <Layers className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CICDSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              CI/CD Security &amp; Secure SDLC (SSDLC)
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 26 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Semgrep SAST, Gitleaks Secret Gate, Package CVE Audit, Trivy Container Scan &amp; Syft SBOM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>SSDLC Security Score:</span>
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

      {/* Tab 1: Pipeline Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Gate Outcome</p>
                <h3 className="text-xl font-black text-emerald-500 mt-1">ALLOWED</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">0 Critical Vulnerabilities</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Passed Gates</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">5 / 5 Gates</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">100% Pipeline Clean</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Failed Gates</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">0 Gates</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">No Blockers</p>
              </div>
              <FileCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">SBOM Components</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">5 Packages</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Syft SPDX Verified</p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">SSDLC Automated Security Gates</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Semgrep Static Application Security Testing (SAST)</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Scans Go &amp; TypeScript code for OWASP Top 10 SQLi, XSS, and dangerous functions.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Gitleaks Automated Secret Scanning Gate</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Scans commit history for hardcoded AWS keys, JWT secrets, private keys, and API tokens.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Trivy Container Vulnerability Gate</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Inspects Docker runtime base images for OS package CVEs prior to deployment.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASSED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SAST Results */}
      {activeTab === "sast" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Semgrep SAST Audit Results</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">OWASP Top 10 Scanned</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Finding ID</th>
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">File / Line</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_SAST.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{s.id}</td>
                    <td className="p-3 font-mono">{s.rule_id}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{s.file}:{s.line}</td>
                    <td className="p-3"><span className={severityBadge(s.severity)}>{s.severity}</span></td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{s.description}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Dependency Security */}
      {activeTab === "dependencies" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Package CVE Vulnerability Scan</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">govulncheck &amp; npm audit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Finding ID</th>
                  <th className="p-3">Package</th>
                  <th className="p-3">Installed Version</th>
                  <th className="p-3">Fixed Version</th>
                  <th className="p-3">CVE ID</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_DEPS.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{d.id}</td>
                    <td className="p-3 font-mono">{d.package}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{d.version}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{d.fixed}</td>
                    <td className="p-3 font-mono">{d.cve}</td>
                    <td className="p-3"><span className={severityBadge(d.severity)}>{d.severity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Container Security */}
      {activeTab === "container" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Trivy Container Vulnerability Scan</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Docker Base &amp; Layer Scan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Finding ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Scanner</th>
                  <th className="p-3">Package</th>
                  <th className="p-3">CVE ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_CONTAINER.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{c.id}</td>
                    <td className="p-3 font-mono">{c.image}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{c.scanner}</td>
                    <td className="p-3 font-mono">{c.package}</td>
                    <td className="p-3 font-mono">{c.cve}</td>
                    <td className="p-3"><span className={severityBadge(c.severity)}>{c.severity}</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: SBOM */}
      {activeTab === "sbom" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Software Bill of Materials (SBOM)</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Syft Generated (SPDX/CycloneDX)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Component Name</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">License</th>
                  <th className="p-3">SHA-256 Package Hash</th>
                  <th className="p-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_SBOM.map(sb => (
                  <tr key={sb.name} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{sb.name}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sb.version}</td>
                    <td className="p-3 font-mono"><span className="px-2 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-400 rounded">{sb.license}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sb.hash.slice(0, 16)}...</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sb.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
