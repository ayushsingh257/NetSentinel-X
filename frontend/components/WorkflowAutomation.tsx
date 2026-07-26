"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Check,
  X,
  FileCode,
  CheckSquare
} from "lucide-react";

export interface WorkflowTrigger {
  id: string;
  type: string;
  source: string;
  condition: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action_type: string;
  parameters: Record<string, string>;
  status: string;
  executed_at?: string;
  error_msg?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  trigger_event: string;
  status: string;
  steps: WorkflowStep[];
  current_step: number;
  started_at: string;
  completed_at?: string;
  logs: string[];
}

export interface WorkflowApproval {
  id: string;
  execution_id: string;
  workflow_name: string;
  step_name: string;
  action: string;
  requester: string;
  status: string;
  requested_at: string;
  decided_at?: string;
}

const SEED_WORKFLOWS: Workflow[] = [
  {
    id: "WF-001",
    name: "Automated C2 Beaconing Isolation Playbook",
    description: "Autonomously detects C2 beaconing activity, enriches IOC reputation, requests approval, and isolates compromised host.",
    category: "C2_BEACONING",
    status: "ACTIVE",
    trigger: { id: "TRG-001", type: "DETECTION_RULE", source: "RULE-SIGMA-001", condition: "Risk Score >= 85" },
    steps: [
      { id: "STP-1", name: "Triage Alert & Enrich Threat Intel", action_type: "NOTIFY_TEAM", parameters: { channel: "#soc-alerts", severity: "HIGH" }, status: "COMPLETED", executed_at: "2026-07-26T16:30:00.000Z" },
      { id: "STP-2", name: "Create Automated Incident Case", action_type: "CREATE_INCIDENT", parameters: { title: "C2 Beaconing Detected", priority: "P1" }, status: "COMPLETED", executed_at: "2026-07-26T16:31:00.000Z" },
      { id: "STP-3", name: "Simulate Host Endpoint Isolation", action_type: "ISOLATE_HOST", parameters: { host_ip: "192.168.1.105", mode: "SIMULATED" }, status: "COMPLETED", executed_at: "2026-07-26T16:32:00.000Z" },
    ],
    created_by: "SOC Lead Analyst",
    created_at: "2026-07-23T10:00:00.000Z",
    updated_at: "2026-07-26T15:00:00.000Z",
  },
  {
    id: "WF-002",
    name: "Ransomware & Lateral Movement Containment",
    description: "Triggers on high-severity UEBA anomaly detection to immediately block egress traffic and notify incident responders.",
    category: "RANSOMWARE",
    status: "ACTIVE",
    trigger: { id: "TRG-002", type: "UEBA_ANOMALY", source: "Anomaly Engine", condition: "Sigma Deviation > 3.0" },
    steps: [
      { id: "STP-1", name: "Block Malicious C2 IP Address", action_type: "BLOCK_IOC", parameters: { ioc: "185.220.101.45", action: "SIMULATED_FIREWALL_BLOCK" }, status: "COMPLETED", executed_at: "2026-07-26T16:45:00.000Z" },
      { id: "STP-2", name: "Trigger AI Threat Hunting Sweep", action_type: "RUN_HUNT", parameters: { query: "dns tunneling" }, status: "COMPLETED", executed_at: "2026-07-26T16:46:00.000Z" },
    ],
    created_by: "Detection Engineer",
    created_at: "2026-07-24T10:00:00.000Z",
    updated_at: "2026-07-26T16:00:00.000Z",
  },
];

export default function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [history, setHistory] = useState<WorkflowExecution[]>([]);
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([]);
  const [activeTab, setActiveTab] = useState<"workflows" | "history" | "approvals">("workflows");
  const [executingID, setExecutingID] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [aiGeneratedPlaybook, setAiGeneratedPlaybook] = useState<Workflow | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/workflows`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || SEED_WORKFLOWS);
        if (data.workflows?.length > 0) {
          setSelectedWorkflow(data.workflows[0]);
        }
      } else {
        setWorkflows(SEED_WORKFLOWS);
        setSelectedWorkflow(SEED_WORKFLOWS[0]);
      }
    } catch {
      setWorkflows(SEED_WORKFLOWS);
      setSelectedWorkflow(SEED_WORKFLOWS[0]);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/workflows/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.executions || []);
      }
    } catch {
      setHistory([
        {
          id: "EXEC-2026-001",
          workflow_id: "WF-001",
          workflow_name: "Automated C2 Beaconing Isolation Playbook",
          trigger_event: "Sigma Rule RULE-SIGMA-001 Triggered on 192.168.1.105",
          status: "COMPLETED",
          steps: SEED_WORKFLOWS[0].steps,
          current_step: 3,
          started_at: "2026-07-26T16:30:00.000Z",
          completed_at: "2026-07-26T16:32:00.000Z",
          logs: [
            "[16:30:00] Workflow EXEC-2026-001 triggered by RULE-SIGMA-001",
            "[16:30:30] Step 1: Team notified via #soc-alerts",
            "[16:31:00] Step 2: Incident INC-2026-8001 created",
            "[16:32:00] Step 3: Host 192.168.1.105 isolation simulated successfully",
          ],
        },
      ]);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/workflows/approvals`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch {
      setApprovals([
        {
          id: "APP-101",
          execution_id: "EXEC-2026-002",
          workflow_name: "Ransomware & Lateral Movement Containment",
          step_name: "Isolate Production DB Host",
          action: "SIMULATED_HOST_ISOLATION",
          requester: "Autonomous Playbook Engine",
          status: "PENDING",
          requested_at: "2026-07-26T16:40:00.000Z",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchWorkflows();
      void fetchHistory();
      void fetchApprovals();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchWorkflows, fetchHistory, fetchApprovals]);

  const handleExecute = async (id: string) => {
    setExecutingID(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/workflows/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_id: id }),
      });
      if (res.ok) {
        await fetchHistory();
        setActiveTab("history");
      }
    } catch {
      // Graceful fallback UI execution state
      setActiveTab("history");
    } finally {
      setExecutingID(null);
    }
  };

  const handleDecideApproval = async (approvalId: string, approved: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/api/v2/workflows/approvals/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_id: approvalId, approved }),
      });
      await fetchApprovals();
    } catch {
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === approvalId ? { ...a, status: approved ? "APPROVED" : "REJECTED" } : a
        )
      );
    }
  };

  const handleGenerateAIPlaybook = async (category: string) => {
    setIsGeneratingAI(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/workflows/playbooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiGeneratedPlaybook(data);
      }
    } catch {
      setAiGeneratedPlaybook({
        id: "AI-PLAYBOOK-999",
        name: `Autonomous AI Playbook — ${category} Response`,
        description: `AI-generated response playbook tailored for ${category} threat scenarios based on NetSentinel-X intelligence correlation.`,
        category,
        status: "DRAFT",
        trigger: { id: "AI-TRG", type: "DETECTION_RULE", source: "AI Investigation Engine", condition: "Risk Score >= 80" },
        steps: [
          { id: "S1", name: "Triage Alert & Enrich Threat Intel", action_type: "NOTIFY_TEAM", parameters: { channel: "#soc-alerts" }, status: "PENDING" },
          { id: "S2", name: "Create Automated Incident Case", action_type: "CREATE_INCIDENT", parameters: { priority: "P1" }, status: "PENDING" },
          { id: "S3", name: "Simulate Host Endpoint Isolation", action_type: "ISOLATE_HOST", parameters: { mode: "SIMULATED" }, status: "PENDING" },
        ],
        created_by: "AI Autonomous Playbook Generator",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Workflow Automation &amp; Autonomous SOC Playbooks
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                SOAR Engine v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Autonomous Playbook Execution, Action Orchestration &amp; Approval Workflows</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          {(["workflows", "history", "approvals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors capitalize flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "workflows" && <GitBranch className="w-3.5 h-3.5" />}
              {tab === "history" && <Clock className="w-3.5 h-3.5" />}
              {tab === "approvals" && <CheckSquare className="w-3.5 h-3.5 text-amber-400" />}
              <span>{tab === "workflows" ? "Playbook Library" : tab === "history" ? "Execution History" : `Approvals (${approvals.filter(a => a.status === "PENDING").length})`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Active Playbooks</span>
          <span className="text-lg font-bold text-emerald-400">{workflows.length} Active</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Total Executions</span>
          <span className="text-lg font-bold text-cyan-400">{history.length} Executed</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Pending Approvals</span>
          <span className="text-lg font-bold text-amber-400">{approvals.filter(a => a.status === "PENDING").length} Pending</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Orchestration Mode</span>
          <span className="text-lg font-bold text-purple-400">Autonomous SOAR</span>
        </div>
      </div>

      {/* Tab: Workflows Library & Builder */}
      {activeTab === "workflows" && (
        <div className="space-y-6 font-sans text-xs">

          {/* AI Generator Banner */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Generate Autonomous AI Playbook</h4>
                <p className="text-xs text-zinc-400">Autonomously design response steps based on threat category correlation.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              {(["MALWARE", "RANSOMWARE", "C2_BEACONING"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => void handleGenerateAIPlaybook(cat)}
                  disabled={isGeneratingAI}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 font-bold text-[10px] transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* AI Playbook Output Modal/Box */}
          {aiGeneratedPlaybook && (
            <div className="p-4 bg-zinc-900 rounded-2xl border border-emerald-500/50 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generated Playbook Output:</span>
                </span>
                <span className="text-[10px] text-zinc-500">{aiGeneratedPlaybook.id}</span>
              </div>
              <h4 className="text-sm font-bold text-white font-sans">{aiGeneratedPlaybook.name}</h4>
              <p className="text-xs text-zinc-300 font-sans">{aiGeneratedPlaybook.description}</p>
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-zinc-400 block uppercase">Configured Steps:</span>
                {aiGeneratedPlaybook.steps.map((st, i) => (
                  <div key={st.id} className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                    <span>{st.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-cyan-400 border border-zinc-800">{st.action_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Playbook List */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Configured Playbooks ({workflows.length})</span>
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedWorkflow?.id === wf.id
                        ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{wf.id}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300">{wf.category}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white font-sans mt-1">{wf.name}</h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 font-sans">{wf.description}</p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/60 font-mono text-[10px]">
                      <span className="text-zinc-500">{wf.steps.length} Steps</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleExecute(wf.id);
                        }}
                        disabled={executingID === wf.id}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>{executingID === wf.id ? "Running..." : "Run"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Detail / Step Pipeline Inspector */}
            {selectedWorkflow && (
              <div className="lg:col-span-2 bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-4">
                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase">Selected Playbook Detail</span>
                    <h3 className="text-base font-bold text-white font-sans pt-0.5">{selectedWorkflow.name}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">{selectedWorkflow.status}</span>
                </div>

                <p className="text-xs text-zinc-300 font-sans">{selectedWorkflow.description}</p>

                <div className="bg-black/60 p-3 rounded-xl border border-zinc-800 font-mono space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Trigger Condition</span>
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{selectedWorkflow.trigger.type}: {selectedWorkflow.trigger.condition}</span>
                  </div>
                </div>

                <div className="space-y-3 font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase block">Orchestrated Playbook Steps</span>
                  {selectedWorkflow.steps.map((st, idx) => (
                    <div key={st.id} className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 text-xs font-bold">{idx + 1}</span>
                          <span className="text-xs font-bold text-white font-sans">{st.name}</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800">{st.action_type}</span>
                      </div>
                      {Object.keys(st.parameters || {}).length > 0 && (
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-900 text-[10px] text-zinc-400 flex flex-wrap gap-2">
                          {Object.entries(st.parameters).map(([k, v]) => (
                            <span key={k}><strong className="text-zinc-300">{k}:</strong> {v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={() => void handleExecute(selectedWorkflow.id)}
                    disabled={executingID === selectedWorkflow.id}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Play className="w-4 h-4" />
                    <span>{executingID === selectedWorkflow.id ? "Executing SOAR Playbook..." : "Execute Playbook Now"}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Tab: Execution History */}
      {activeTab === "history" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-zinc-400 text-[10px] uppercase">
              <span>Workflow Execution Logs &amp; Audit History</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-zinc-800/60 font-mono">
              {history.map((ex) => (
                <div key={ex.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white font-sans">{ex.workflow_name}</span>
                      <span className="text-[10px] text-zinc-500">({ex.id})</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">{ex.status}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">{ex.trigger_event}</p>
                  <div className="bg-black p-3 rounded-xl border border-zinc-900 space-y-1 text-[10px] text-zinc-400">
                    {ex.logs?.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <FileCode className="w-3 h-3 text-zinc-600 shrink-0" />
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Approval Queue */}
      {activeTab === "approvals" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 font-mono text-zinc-400 text-[10px] uppercase">
              Analyst Manual Approval Queue
            </div>
            <div className="divide-y divide-zinc-800/60 font-mono">
              {approvals.map((app) => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-sans">
                      <span className="text-xs font-bold text-white">{app.step_name}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">{app.action}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">{app.workflow_name} · Requested by {app.requester}</p>
                    <span className="text-[9px] text-zinc-600">{new Date(app.requested_at).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => void handleDecideApproval(app.id, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => void handleDecideApproval(app.id, false)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded ${app.status === "APPROVED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"}`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
