"use client";

import React, { useState } from "react";
import {
  Database,
  ShieldCheck,
  Lock,
  Key,
  FileText,
  HardDrive,
  CheckCircle2,
  Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBRole {
  role_name: string;
  permissions: string[];
  superuser: boolean;
  description: string;
}

interface ClassifiedField {
  table: string;
  column: string;
  level: string;
  masked: boolean;
  encrypted: boolean;
  description: string;
}

interface DBAuditLog {
  id: string;
  user: string;
  action: string;
  table: string;
  timestamp: string;
  ip: string;
  result: string;
  query: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROLES: DBRole[] = [
  { role_name: "postgres_admin", permissions: ["ALL PRIVILEGES", "SUPERUSER", "CREATE DB"], superuser: true, description: "Emergency administrator role only." },
  { role_name: "migration_user", permissions: ["CREATE TABLE", "ALTER TABLE", "DROP TABLE"], superuser: false, description: "CI/CD automated DDL migration role." },
  { role_name: "application_user", permissions: ["SELECT", "INSERT", "UPDATE", "DELETE"], superuser: false, description: "Main runtime DML service account." },
  { role_name: "readonly_audit_user", permissions: ["SELECT (Read-Only)"], superuser: false, description: "Compliance read-only access for security team." },
];

const CLASSIFIED_FIELDS: ClassifiedField[] = [
  { table: "users", column: "password_hash", level: "RESTRICTED", masked: true, encrypted: true, description: "Bcrypt password hash" },
  { table: "api_keys", column: "key_hash", level: "RESTRICTED", masked: true, encrypted: true, description: "SHA-256 API Key signature" },
  { table: "users", column: "email", level: "CONFIDENTIAL", masked: true, encrypted: false, description: "Analyst email address" },
  { table: "incidents", column: "attacker_ip", level: "CONFIDENTIAL", masked: true, encrypted: false, description: "Threat actor IP address" },
  { table: "users", column: "username", level: "PUBLIC", masked: false, encrypted: false, description: "Public handle" },
];

const AUDIT_LOGS: DBAuditLog[] = [
  { id: "DBAUD-1001", user: "application_user", action: "UPDATE", table: "incidents", timestamp: "10 mins ago", ip: "172.20.0.5", result: "SUCCESS", query: "UPDATE incidents SET status='RESOLVED' WHERE id='INC-9012'" },
  { id: "DBAUD-1002", user: "application_user", action: "INSERT", table: "threat_events", timestamp: "25 mins ago", ip: "172.20.0.5", result: "SUCCESS", query: "INSERT INTO threat_events (event_id, severity) VALUES ($1, $2)" },
  { id: "DBAUD-1003", user: "readonly_audit_user", action: "SELECT", table: "audit_logs", timestamp: "40 mins ago", ip: "172.20.0.12", result: "SUCCESS", query: "SELECT * FROM audit_logs WHERE timestamp >= $1 LIMIT 100" },
  { id: "DBAUD-1004", user: "application_user", action: "DROP", table: "users", timestamp: "2 hours ago", ip: "192.168.1.100", result: "BLOCKED", query: "DROP TABLE users; -- Privilege Denial Check" },
  { id: "DBAUD-1005", user: "migration_user", action: "ALTER", table: "api_keys", timestamp: "1 day ago", ip: "172.20.0.2", result: "SUCCESS", query: "ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS status VARCHAR(32)" },
];

const TABS = [
  { id: "posture", label: "Database Posture", icon: <Database className="w-4 h-4" /> },
  { id: "access", label: "Access Control", icon: <Key className="w-4 h-4" /> },
  { id: "encryption", label: "Encryption Status", icon: <Lock className="w-4 h-4" /> },
  { id: "audit", label: "Query Audit", icon: <FileText className="w-4 h-4" /> },
  { id: "backup", label: "Backup Security", icon: <HardDrive className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DatabaseSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("posture");

  const actionBadge = (action: string, result: string) => {
    if (result === "BLOCKED") {
      return "px-2 py-0.5 text-xs font-bold rounded bg-red-500/10 text-red-500 border border-red-500/20";
    }
    switch (action) {
      case "SELECT":
        return "px-2 py-0.5 text-xs font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "INSERT":
      case "UPDATE":
        return "px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "DELETE":
      case "DROP":
      case "ALTER":
        return "px-2 py-0.5 text-xs font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20";
      default:
        return "px-2 py-0.5 text-xs font-bold rounded bg-slate-500/10 text-slate-400";
    }
  };

  const classificationBadge = (level: string) => {
    switch (level) {
      case "RESTRICTED":
        return "px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20";
      case "CONFIDENTIAL":
        return "px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "INTERNAL":
        return "px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "px-2 py-0.5 text-xs font-bold rounded-full bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Database Security &amp; Data Protection
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 23 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              PostgreSQL Hardening, Least Privilege Roles, AES-256 Encryption &amp; Query Auditing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Database Security Score:</span>
          <span className="text-lg font-mono">97/100</span>
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

      {/* Tab 1: Database Posture */}
      {activeTab === "posture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">PostgreSQL Engine</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">PostgreSQL 16</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Hardened Base</p>
              </div>
              <Database className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">TLS Connection</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">TLS 1.3 Active</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">sslmode=require</p>
              </div>
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Public Exposure</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">Internal Only</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Port 5432 Isolated</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">At-Rest Encryption</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">AES-256-GCM</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Vault Key Managed</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Database Hardening Checks</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Port 5432 Network Isolation</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">PostgreSQL bound to internal Docker bridge (172.20.0.0/24) only. Public access blocked.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASS</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">TLS 1.3 Transport Encryption Enforcement</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">sslmode=require enforced via pg_hba.conf SCRAM-SHA-256 authentication.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASS</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">High-Entropy SCRAM-SHA-256 Credentials</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Default passwords disabled. Credentials generated dynamically via HashiCorp Vault.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Access Control */}
      {activeTab === "access" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Database Role Separation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map(role => (
                <div key={role.role_name} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">{role.role_name}</span>
                    {role.superuser ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500/10 text-red-500 rounded">SUPERUSER</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">RESTRICTED ROLE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{role.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {role.permissions.map(perm => (
                      <span key={perm} className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Classified Data Fields</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Table</th>
                    <th className="p-3">Column</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Masking</th>
                    <th className="p-3">Encryption</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                  {CLASSIFIED_FIELDS.map(field => (
                    <tr key={`${field.table}-${field.column}`} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="p-3 font-mono text-slate-900 dark:text-zinc-100">{field.table}</td>
                      <td className="p-3 font-mono">{field.column}</td>
                      <td className="p-3"><span className={classificationBadge(field.level)}>{field.level}</span></td>
                      <td className="p-3">{field.masked ? "🔒 Masked" : "👁️ Visible"}</td>
                      <td className="p-3">{field.encrypted ? "🔑 AES-256" : "Plaintext"}</td>
                      <td className="p-3 text-slate-500 dark:text-zinc-400">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Encryption Status */}
      {activeTab === "encryption" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Data At Rest Encryption</h3>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Algorithm: <strong className="font-mono text-slate-900 dark:text-zinc-200">AES-256-GCM</strong> (Authenticated Encryption with Associated Data)
              </p>
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <p className="font-semibold text-slate-700 dark:text-zinc-300">Protected Storage Columns:</p>
                <ul className="list-disc list-inside text-slate-500 dark:text-zinc-400 font-mono space-y-0.5">
                  <li>users.password_hash</li>
                  <li>api_keys.key_hash</li>
                  <li>auth_tokens.session_token</li>
                  <li>webhook_subscriptions.secret</li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Data In Transit Encryption</h3>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Protocol: <strong className="font-mono text-slate-900 dark:text-zinc-200">TLS 1.3 (ECDHE-RSA-AES256-GCM-SHA384)</strong>
              </p>
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <p className="font-semibold text-slate-700 dark:text-zinc-300">PostgreSQL Connection Controls:</p>
                <ul className="list-disc list-inside text-slate-500 dark:text-zinc-400 font-mono space-y-0.5">
                  <li>sslmode=require</li>
                  <li>SCRAM-SHA-256 Authentication</li>
                  <li>Internal Docker Bridge Isolation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Query Audit */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Recent Database Action Logs</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Real-time DML/DDL Monitor</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Table</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Query Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-zinc-100">{log.user}</td>
                    <td className="p-3"><span className={actionBadge(log.action, log.result)}>{log.action}</span></td>
                    <td className="p-3 font-mono">{log.table}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{log.ip}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${log.result === "SUCCESS" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px] truncate max-w-xs">{log.query}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Backup Security */}
      {activeTab === "backup" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Database Backup Security Posture</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Encrypted pg_dump snapshots + Containerized restore verification</p>
                </div>
              </div>
              <span className="px-3 py-1 text-sm font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                Score: 95/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Encrypted Backup</p>
                <p className="text-lg font-black text-emerald-500 mt-1">YES (AES-256)</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Frequency</p>
                <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">Daily (24h)</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Last Backup</p>
                <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">2 hours ago</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Restore Test</p>
                <p className="text-lg font-black text-emerald-500 mt-1">PASSED</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
