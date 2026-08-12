"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck,
  Zap,
  Activity,
  Layers,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export interface SOARPlaybookItem {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_event: string;
  severity_threshold: string;
  risk_threshold: number;
  enabled: boolean;
  created_at: string;
}

export interface SOARExecutionItem {
  execution_id: string;
  playbook_id: string;
  playbook_name: string;
  event_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  result: string;
  logs: string[];
}

export interface SOARApprovalItem {
  id: string;
  execution_id: string;
  playbook_name: string;
  action_type: string;
  target: string;
  risk_level: string;
  requested_at: string;
  status: string;
}

export interface SOARAuditItem {
  log_id: string;
  execution_id: string;
  playbook_name: string;
  action_type: string;
  target: string;
  triggered_by: string;
  ai_reasoning: string;
  approval_status: string;
  executed_by: string;
  timestamp: string;
  hmac_signature: string;
}

export default function SOARDashboard() {
  const [playbooks, setPlaybooks] = useState<SOARPlaybookItem[]>([]);
  const [executions, setExecutions] = useState<SOARExecutionItem[]>([]);
  const [approvals, setApprovals] = useState<SOARApprovalItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SOARAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingPbId, setExecutingPbId] = useState<string | null>(null);

  const fetchSOARData = useCallback(async () => {
    try {
      const [pbRes, execRes, appRes, auditRes] = await Promise.all([
        fetchWithAuth("/api/v2/soar/playbooks"),
        fetchWithAuth("/api/v2/soar/executions"),
        fetchWithAuth("/api/v2/soar/approvals"),
        fetchWithAuth("/api/v2/soar/audit"),
      ]);

      if (pbRes.ok) {
        const json = await pbRes.json();
        if (Array.isArray(json.playbooks)) setPlaybooks(json.playbooks);
      }
      if (execRes.ok) {
        const json = await execRes.json();
        if (Array.isArray(json.executions)) setExecutions(json.executions);
      }
      if (appRes.ok) {
        const json = await appRes.json();
        if (Array.isArray(json.approvals)) setApprovals(json.approvals);
      }
      if (auditRes.ok) {
        const json = await auditRes.json();
        if (Array.isArray(json.audit_logs)) setAuditLogs(json.audit_logs);
      }

      setError(null);
    } catch (err) {
      console.error("SOAR Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load SOAR automation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchSOARData();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchSOARData]);

  const handleManualExecute = async (id: string) => {
    setExecutingPbId(id);
    try {
      const res = await fetchWithAuth(`/api/v2/soar/playbooks/${id}/execute`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchSOARData();
      }
    } catch (err) {
      console.error("Execute Playbook Error:", err);
    } finally {
      setExecutingPbId(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/v2/soar/actions/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) await fetchSOARData();
    } catch (err) {
      console.error("Approve Action Error:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/v2/soar/actions/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) await fetchSOARData();
    } catch (err) {
      console.error("Reject Action Error:", err);
    }
  };

  if (loading && playbooks.length === 0) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-white rounded-2xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400" /> SOAR Automation &amp; Response Orchestrator
        </h2>
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary fallbackTitle="SOAR Automation Module Error">
      <div className="space-y-6 font-sans text-slate-100">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Autonomous Security Orchestration &amp; Response (SOAR)
                <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Phase 5 Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated containment playbooks, provider-agnostic response adapters &amp; human approval gates
              </p>
            </div>
          </div>

          <button
            onClick={fetchSOARData}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Orchestration</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>⚠ SOAR Engine Error: {error} — Operating in safe fallback mode.</span>
          </div>
        )}

        {/* Human Approval Queue Banner */}
        {approvals.length > 0 && (
          <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" /> Human Approval Queue ({approvals.length} Pending Action)
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                HIGH RISK REMEDIATION GATE
              </span>
            </div>

            <div className="space-y-3">
              {approvals.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold">{req.playbook_name}</span>
                    <p className="text-slate-200">
                      Action: <strong className="text-amber-400">{req.action_type}</strong> | Target: <strong className="text-cyan-400">{req.target}</strong>
                    </p>
                    <span className="text-[11px] text-slate-500">Requested At: {new Date(req.requested_at).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Execution
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
                    >
                      <XCircle className="w-4 h-4" /> Reject Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playbook Management & Active Executions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Predefined SOAR Playbooks Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Registered Response Playbooks
              </h2>
              <span className="text-xs font-mono text-cyan-400">{playbooks.length} Active</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {playbooks.map((pb) => (
                <div key={pb.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{pb.name}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                      {pb.category}
                    </span>
                  </div>

                  <p className="text-slate-400 font-sans text-xs">{pb.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-500">Min Risk Threshold: <strong className="text-amber-400">{pb.risk_threshold}</strong></span>
                    <button
                      onClick={() => handleManualExecute(pb.id)}
                      disabled={executingPbId === pb.id}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className={`w-3 h-3 ${executingPbId === pb.id ? "animate-spin" : ""}`} />
                      <span>{executingPbId === pb.id ? "Executing..." : "Manual Run"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Executions Timeline Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" /> Playbook Execution History
              </h2>
              <span className="text-xs font-mono text-purple-400">{executions.length} Executed</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {executions.map((exec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{exec.playbook_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      exec.status === "COMPLETED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : exec.status === "AWAITING_APPROVAL"
                        ? "bg-amber-950 text-amber-400 border-amber-800"
                        : "bg-purple-950 text-purple-400 border-purple-800"
                    }`}>
                      {exec.status}
                    </span>
                  </div>

                  <p className="text-slate-300 font-sans text-xs">{exec.result}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 text-[11px]">
                    <span className="text-slate-400 font-bold block">Execution Step Logs:</span>
                    {exec.logs.map((log, i) => (
                      <div key={i} className="text-cyan-300">• {log}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Forensics & Audit Trail Table */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" /> Forensically Signed SOAR Response Audit Trail
            </h2>
            <span className="text-xs font-mono text-emerald-400">HMAC-SHA256 Validated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Playbook</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Executed By</th>
                  <th className="py-3 px-4">HMAC Signature</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      No SOAR response audit logs recorded...
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{log.log_id}</td>
                      <td className="py-3.5 px-4 text-cyan-300">{log.playbook_name}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{log.action_type}</td>
                      <td className="py-3.5 px-4 text-slate-200">{log.target}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {log.approval_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{log.executed_by}</td>
                      <td className="py-3.5 px-4 text-[10px] text-purple-400">{log.hmac_signature.substring(0, 12)}...</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardErrorBoundary>
  );
}
