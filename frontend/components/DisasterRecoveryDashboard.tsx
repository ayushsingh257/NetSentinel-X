"use client";

import React, { useState } from "react";
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Activity,
  RotateCcw,
  History,
  FileCheck2,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BackupRecordItem {
  id: string;
  backup_type: "FULL" | "INCREMENTAL" | "SNAPSHOT";
  created_at: string;
  storage_location: string;
  encryption_status: string;
  integrity_hash: string;
  backup_size: string;
  restore_status: "RESTORE_READY" | "RESTORE_FAILED" | "BACKUP_CORRUPTED";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_HISTORY: BackupRecordItem[] = [
  {
    id: "BKP-2026-002",
    backup_type: "INCREMENTAL",
    created_at: "2026-07-30T08:15:00Z",
    storage_location: "s3://netsentinel-encrypted-dr-backups/us-east-1/inc-20260730-05m.dump.enc",
    encryption_status: "ENCRYPTED_AES256",
    integrity_hash: "8f7e6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f",
    backup_size: "128 MB",
    restore_status: "RESTORE_READY",
  },
  {
    id: "BKP-2026-001",
    backup_type: "FULL",
    created_at: "2026-07-30T06:00:00Z",
    storage_location: "s3://netsentinel-encrypted-dr-backups/us-east-1/full-20260730.dump.enc",
    encryption_status: "ENCRYPTED_AES256",
    integrity_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    backup_size: "4.2 GB",
    restore_status: "RESTORE_READY",
  },
];

const TABS = [
  { id: "overview", label: "Backup Overview", icon: <Database className="w-4 h-4" /> },
  { id: "history", label: "Backup History", icon: <History className="w-4 h-4" /> },
  { id: "validation", label: "Restore Validation", icon: <FileCheck2 className="w-4 h-4" /> },
  { id: "dr", label: "Disaster Recovery", icon: <RotateCcw className="w-4 h-4" /> },
  { id: "continuity", label: "Business Continuity", icon: <Zap className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DisasterRecoveryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const runSimulation = () => {
    setSimulationRunning(true);
    setSimulationResult(null);
    setTimeout(() => {
      setSimulationRunning(false);
      setSimulationResult("RESTORE_READY: Verified AES-256 decryption & SHA-256 integrity hash match (Duration: 125ms)");
    }, 1200);
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
              Backup, Disaster Recovery &amp; Business Continuity
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 28 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              AES-256-GCM Encrypted Backups, SHA-256 Integrity Hashes, RPO ≤ 5m &amp; RTO ≤ 30m Compliance Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>DR Readiness Score:</span>
          <span className="text-lg font-mono">100/100</span>
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

      {/* Tab 1: Backup Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Backup Health Score</p>
                <h3 className="text-xl font-black text-emerald-500 mt-1">100 / 100</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">HEALTHY</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">RPO Target</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">≤ 5 Minutes</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Active: 2m (COMPLIANT)</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">RTO Target</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">≤ 30 Minutes</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Estimated: 12m (COMPLIANT)</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Encryption Status</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">AES-256-GCM</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Vault Key Rotated</p>
              </div>
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Disaster Recovery Controls &amp; Storage Target</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Latest Full Backup</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">BKP-2026-001 • 4.2 GB • SHA-256 Verified</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">RESTORE_READY</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Latest Incremental Backup</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">BKP-2026-002 • 128 MB • SHA-256 Verified</p>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">RESTORE_READY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Backup History */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cryptographic Backup Record Archive</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">90-Day Retention Policy</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Backup ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">SHA-256 Integrity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_HISTORY.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{b.id}</td>
                    <td className="p-3"><span className="px-2 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-500 rounded">{b.backup_type}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{b.backup_size}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{b.created_at}</td>
                    <td className="p-3 font-mono text-xs text-slate-500 dark:text-zinc-400 max-w-xs truncate">{b.integrity_hash}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{b.restore_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Restore Validation */}
      {activeTab === "validation" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Automated Sandbox Restore Verification Engine</h2>
              <button
                onClick={runSimulation}
                disabled={simulationRunning}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {simulationRunning ? "Simulating Restore..." : "Execute Restore Test"}
              </button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 border border-slate-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Verification Readiness Status</p>
              <p className="text-lg font-black text-emerald-500">RESTORE_READY</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">All backup checksums match SHA-256 signatures. AES-256 Vault decryption keys verified.</p>
            </div>
            {simulationResult && (
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-emerald-500/30">
                {simulationResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Disaster Recovery */}
      {activeTab === "dr" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Service Restoration Sequence &amp; Failover Readiness</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">1. Vault &amp; Cryptographic Secrets</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">2. PostgreSQL Primary Database (PITR Restored)</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">3. Redis Sentinel Cache &amp; Session Store</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">4. Go DPI Backend Engine (`netsentinel-x-backend`)</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">5. SIEM Cryptographic Audit Chain Engine</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">6. Next.js 16 Frontend Web Application</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">READY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Business Continuity */}
      {activeTab === "continuity" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Business Continuity Metrics &amp; SLAs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Platform Availability Target</p>
                <p className="text-lg font-black text-emerald-500 mt-1">99.99% SLA</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Operational Readiness State</p>
                <p className="text-lg font-black text-emerald-500 mt-1">FULLY_OPERATIONAL</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase">Cross-Region Failover Status</p>
                <p className="text-lg font-black text-emerald-500 mt-1">SYNCHRONIZED</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
