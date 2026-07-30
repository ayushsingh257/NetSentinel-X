"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  Eye,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassificationItem {
  id: string;
  resource_id: string;
  resource_type: string;
  classification_level: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  classified_by: string;
  reason: string;
}

interface PIIFindingItem {
  id: string;
  type: string;
  value: string;
  masked_value: string;
  location: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
}

interface RetentionItem {
  id: string;
  data_type: string;
  retention_days: number;
  action: string;
  status: string;
}

interface PrivacyAuditEventItem {
  id: string;
  event_type: string;
  user: string;
  resource: string;
  ip: string;
  timestamp: string;
  result: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLASSIFICATIONS: ClassificationItem[] = [
  { id: "CLS-1001", resource_id: "docs/public_api.md", resource_type: "DOCUMENTATION", classification_level: "PUBLIC", classified_by: "AUTOMATIC_ENGINE", reason: "Public developer API reference document" },
  { id: "CLS-1002", resource_id: "reports/monthly_metrics.json", resource_type: "LOG_FILE", classification_level: "INTERNAL", classified_by: "AUTOMATIC_ENGINE", reason: "Internal operational performance summary" },
  { id: "CLS-1003", resource_id: "db.security_findings", resource_type: "DATABASE_TABLE", classification_level: "CONFIDENTIAL", classified_by: "SECURITY_ADMIN", reason: "Vulnerability analysis and internal investigation reports" },
  { id: "CLS-1004", resource_id: "db.user_credentials", resource_type: "DATABASE_TABLE", classification_level: "RESTRICTED", classified_by: "SECURITY_ADMIN", reason: "Authentication tokens, password hashes, and PII records" },
];

const MOCK_PII: PIIFindingItem[] = [
  { id: "PII-2026-001", type: "EMAIL", value: "analyst@netsentinel.internal", masked_value: "a*****@netsentinel.internal", location: "audit_logs.payload", severity: "MEDIUM", status: "PII_FOUND" },
  { id: "PII-2026-002", type: "PHONE", value: "9876543210", masked_value: "******3210", location: "users.contact_number", severity: "HIGH", status: "PII_FOUND" },
  { id: "PII-2026-003", type: "IP", value: "192.168.1.10", masked_value: "192.168.xxx.xxx", location: "auth_events.client_ip", severity: "LOW", status: "PII_FOUND" },
];

const MOCK_RETENTION: RetentionItem[] = [
  { id: "POL-RET-001", data_type: "SECURITY_LOGS", retention_days: 365, action: "PURGE", status: "ACTIVE" },
  { id: "POL-RET-002", data_type: "AUDIT_LOGS", retention_days: 730, action: "ARCHIVE", status: "ACTIVE" },
  { id: "POL-RET-003", data_type: "TEMP_DATA", retention_days: 30, action: "PURGE", status: "ACTIVE" },
];

const MOCK_AUDIT_EVENTS: PrivacyAuditEventItem[] = [
  { id: "PRV-901", event_type: "PRIVACY_DATA_ACCESSED", user: "sec_admin", resource: "db.user_credentials", ip: "10.0.4.15", timestamp: "2026-07-30T08:20:00Z", result: "SUCCESS" },
  { id: "PRV-902", event_type: "PII_DETECTED", user: "system_scanner", resource: "audit_logs.payload", ip: "127.0.0.1", timestamp: "2026-07-30T08:15:00Z", result: "PII_FOUND" },
  { id: "PRV-903", event_type: "DATA_MASKED", user: "masking_engine", resource: "users.contact_number", ip: "127.0.0.1", timestamp: "2026-07-30T08:10:00Z", result: "MASK_SUCCESS" },
  { id: "PRV-904", event_type: "CLASSIFICATION_CHANGED", user: "sec_admin", resource: "db.security_findings", ip: "10.0.4.15", timestamp: "2026-07-30T07:45:00Z", result: "RESTRICTED" },
];

const TABS = [
  { id: "overview", label: "Compliance Overview", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "classification", label: "Data Classification", icon: <Layers className="w-4 h-4" /> },
  { id: "pii", label: "PII Protection", icon: <Eye className="w-4 h-4" /> },
  { id: "retention", label: "Retention Management", icon: <Clock className="w-4 h-4" /> },
  { id: "audit", label: "Audit Compliance", icon: <FileText className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Privacy, Data Governance &amp; Compliance Framework
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 29 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              SOC 2 Type II, ISO 27001:2022 &amp; GDPR Privacy Readiness Engine with Automated PII Masking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Overall Compliance Index:</span>
          <span className="text-lg font-mono">96/100</span>
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

      {/* Tab 1: Compliance Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Overall Score</p>
                <h3 className="text-xl font-black text-emerald-500 mt-1">96 / 100</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">COMPLIANT</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">SOC 2 Type II</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">96% Ready</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">CC6/CC7/CC8 Verified</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">ISO 27001:2022</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">98% Ready</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Annex A Controls Met</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">EU GDPR</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">95% Ready</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Articles 5/25/32/33 Met</p>
              </div>
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise Privacy &amp; Compliance Frameworks Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">SOC 2 Trust Services</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">CC6 Logical Access, CC7 Monitoring, CC8 Change Management controls fully implemented.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">SOC2 PASS</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">ISO 27001 Controls</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">A.5 Security Policies, A.8 Asset &amp; Masking, A.9 Access Control, A.12 Operations Security.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">ISO27001 PASS</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">EU GDPR Governance</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Article 5 Transparency, Article 25 Privacy by Default, Article 32 Security of Processing.</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">GDPR PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Classification */}
      {activeTab === "classification" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">PUBLIC</span>
              <p className="text-2xl font-black text-blue-500 mt-1">1 Resource</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">INTERNAL</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">1 Resource</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">CONFIDENTIAL</span>
              <p className="text-2xl font-black text-amber-500 mt-1">1 Resource</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">RESTRICTED</span>
              <p className="text-2xl font-black text-red-500 mt-1">1 Resource</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise Data Classification Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Classified By</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                  {MOCK_CLASSIFICATIONS.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{cls.id}</td>
                      <td className="p-3 font-mono text-slate-900 dark:text-zinc-100">{cls.resource_id}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-slate-100 dark:bg-zinc-800 rounded">{cls.resource_type}</span></td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          cls.classification_level === "RESTRICTED"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : cls.classification_level === "CONFIDENTIAL"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : cls.classification_level === "INTERNAL"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}>
                          {cls.classification_level}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{cls.classified_by}</td>
                      <td className="p-3 text-slate-500 dark:text-zinc-400">{cls.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PII Protection */}
      {activeTab === "pii" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Personally Identifiable Information (PII) Findings &amp; Masking</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Automatic Pattern Masking Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">PII Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Raw Value</th>
                  <th className="p-3">Masked Output</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_PII.map((pii) => (
                  <tr key={pii.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{pii.id}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-500 rounded">{pii.type}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{pii.location}</td>
                    <td className="p-3 font-mono text-slate-400 dark:text-zinc-500 line-through">{pii.value}</td>
                    <td className="p-3 font-mono font-bold text-emerald-500">{pii.masked_value}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-500 rounded">{pii.severity}</span></td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{pii.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Retention Management */}
      {activeTab === "retention" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Data Retention Policies &amp; Secure Expiration Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Policy ID</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Retention Window</th>
                  <th className="p-3">Action After Expiry</th>
                  <th className="p-3">Policy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_RETENTION.map((pol) => (
                  <tr key={pol.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{pol.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{pol.data_type}</td>
                    <td className="p-3 font-mono text-emerald-500 font-bold">{pol.retention_days} Days</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-purple-500/10 text-purple-500 rounded">{pol.action}</span></td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{pol.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Compliance */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Privacy Audit Trail &amp; Access Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Privacy Event</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_AUDIT_EVENTS.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{evt.id}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">{evt.event_type}</span></td>
                    <td className="p-3 font-mono text-slate-900 dark:text-zinc-100">{evt.user}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.resource}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.ip}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.timestamp}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{evt.result}</span></td>
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
