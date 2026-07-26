"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Shield,
  Sliders,
  Play,
  Plus,
  Sparkles,
  Cpu,
  Power,
  Trash2,
  X,
  FileCode,
  RefreshCw
} from "lucide-react";

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  author: string;
  severity: string;
  type: string;
  mitre_technique: string;
  mitre_tactic: string;
  logic: string;
  status: string;
  version: string;
  detection_count: number;
  false_positive_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SimulationResult {
  matched: boolean;
  rule_name: string;
  severity: string;
  mitre_technique: string;
  affected_asset: string;
  evidence: string;
  confidence_score: number;
  execution_time_ms: number;
}

export interface DetectionAnalytics {
  total_rules: number;
  active_rules: number;
  total_detections: number;
  avg_false_positive: number;
  mitre_coverage: number;
  most_triggered_rules: string[];
}

export default function DetectionStudio() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [analytics, setAnalytics] = useState<DetectionAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "sandbox">("rules");
  
  // Rule Form State
  const [showForm, setShowForm] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleType, setRuleType] = useState("SIGMA");
  const [ruleSev, setRuleSev] = useState("HIGH");
  const [ruleMitre, setRuleMitre] = useState("T1048.003 - DNS Tunneling");
  const [ruleLogic, setRuleLogic] = useState(`title: Custom Detection Rule
detection:
    selection:
        dst_port: 53
        query_type: TXT
    condition: selection`);

  // Simulation Sandbox State
  const [simLogic, setSimLogic] = useState(`title: DNS Tunneling Detection
detection:
    selection:
        dst_port: 53
        query_type: TXT
    condition: selection`);
  const [simPayload, setSimPayload] = useState(`Captured UDP packet on port 53: query_type=TXT payload=malicious-c2-beacon.example-tunnel.org`);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchDetectionData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const [rulesRes, statRes] = await Promise.all([
        fetch(`${apiUrl}/api/v2/detections/rules`),
        fetch(`${apiUrl}/api/v2/detections/analytics`),
      ]);

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.rules || []);
      }
      if (statRes.ok) {
        const data = await statRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch detection rules:", err);
      const mockRules: DetectionRule[] = [
        {
          id: "RULE-SIGMA-001",
          name: "High Entropy DNS Tunneling Detection",
          description: "Detects rapid DNS TXT queries containing high-entropy subdomains.",
          author: "SOC Team",
          severity: "CRITICAL",
          type: "SIGMA",
          mitre_technique: "T1048.003 - Exfiltration Over Alternative Protocol",
          mitre_tactic: "Exfiltration",
          logic: "selection: dst_port: 53 query_type: TXT",
          status: "ENABLED",
          version: "1.2.0",
          detection_count: 29,
          false_positive_rate: 0.02,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "RULE-YARA-002",
          name: "SSH Port Brute Force Sequence",
          description: "Identifies high-velocity TCP SYN requests targeting SSH port 22.",
          author: "Threat Intel",
          severity: "HIGH",
          type: "YARA",
          mitre_technique: "T1110 - Brute Force",
          mitre_tactic: "Credential Access",
          logic: "rule SSH_Brute_Force { strings: $syn_header = { 45 00 } condition: $syn_header }",
          status: "ENABLED",
          version: "2.0.1",
          detection_count: 45,
          false_positive_rate: 0.01,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setRules(mockRules);
      setAnalytics({
        total_rules: 2,
        active_rules: 2,
        total_detections: 74,
        avg_false_positive: 0.015,
        mitre_coverage: 92.5,
        most_triggered_rules: ["RULE-SIGMA-001 (29)", "RULE-YARA-002 (45)"],
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDetectionData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDetectionData]);

  const handleToggleRule = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/detections/rules/${id}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        void fetchDetectionData();
      }
    } catch (err) {
      console.error("Toggle rule failed:", err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/detections/rules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete rule failed:", err);
    }
  };

  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/detections/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ruleName,
          description: ruleDesc,
          type: ruleType,
          severity: ruleSev,
          mitre_technique: ruleMitre,
          logic: ruleLogic,
          status: "ENABLED",
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setRuleName("");
        setRuleDesc("");
        void fetchDetectionData();
      }
    } catch (err) {
      console.error("Create rule failed:", err);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/detections/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_type: ruleType,
          rule_logic: simLogic,
          sample_payload: simPayload,
        }),
      });

      if (res.ok) {
        const data: SimulationResult = await res.json();
        setSimResult(data);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleAIAssistant = async () => {
    setAiGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/detections/ai-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Create rule for DNS Tunneling" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recommendation) {
          setRuleLogic(data.recommendation);
        }
      }
    } catch (err) {
      console.error("AI Assistant query failed:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Detection Engineering Studio
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Sigma &amp; YARA v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Custom Rule Authoring, Simulation Sandbox &amp; AI Optimizer</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border ${
              activeTab === "rules"
                ? "bg-emerald-950 text-emerald-300 border-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rule Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border ${
              activeTab === "sandbox"
                ? "bg-emerald-950 text-emerald-300 border-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulation Sandbox</span>
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Detection Analytics Banner */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Total Custom Rules</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.total_rules} Rules</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Active Execution Engine</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.active_rules} Enabled</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">False Positive Rate</span>
            <span className="text-lg font-bold text-amber-400">{(analytics.avg_false_positive * 100).toFixed(1)}% Low</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">MITRE Coverage Score</span>
            <span className="text-lg font-bold text-purple-400">{analytics.mitre_coverage}% Mapped</span>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === "rules" ? (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between font-mono text-zinc-400">
              <span>ACTIVE DETECTION RULES</span>
              <span>SIGMA / YARA CORE</span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800 font-bold text-[10px]">
                        {rule.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                        {rule.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rule.severity === "CRITICAL"
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                    <p className="text-zinc-400 text-xs">{rule.description}</p>
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-3 pt-1">
                      <span>MITRE: {rule.mitre_technique}</span>
                      <span>•</span>
                      <span>Triggers: {rule.detection_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      onClick={() => void handleToggleRule(rule.id)}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 ${
                        rule.status === "ENABLED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{rule.status}</span>
                    </button>

                    <button
                      onClick={() => void handleDeleteRule(rule.id)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 transition-colors"
                      aria-label="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Simulation Sandbox View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans text-xs">
          
          {/* Rule Logic Editor Panel */}
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Detection Rule Logic Editor</span>
              </span>
              <button
                onClick={handleAIAssistant}
                disabled={aiGenerating}
                className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Rule Helper</span>
              </button>
            </div>

            <textarea
              value={simLogic}
              onChange={(e) => setSimLogic(e.target.value)}
              rows={8}
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
            />

            <span className="font-bold text-white flex items-center gap-2 pt-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Sample Network Event / Telemetry Stream</span>
            </span>

            <textarea
              value={simPayload}
              onChange={(e) => setSimPayload(e.target.value)}
              rows={4}
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Execute Rule Simulation</span>
            </button>
          </div>

          {/* Simulation Output Card */}
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Simulation Evaluation Output</span>
              </span>
              {simResult && (
                <span className="text-mono text-[11px] text-zinc-400">
                  Latency: {simResult.execution_time_ms.toFixed(2)} ms
                </span>
              )}
            </div>

            {simResult ? (
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-zinc-800">
                  <span className="text-zinc-400">DETECTION STATUS:</span>
                  <span
                    className={`font-bold px-2.5 py-1 rounded text-xs ${
                      simResult.matched
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-red-950 text-red-300 border border-red-800"
                    }`}
                  >
                    {simResult.matched ? "RULE MATCHED" : "NO MATCH"}
                  </span>
                </div>

                <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1 text-xs">
                  <span className="text-cyan-400 font-bold block">MITRE Mapping:</span>
                  <p className="text-zinc-300">{simResult.mitre_technique}</p>
                </div>

                <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1 text-xs">
                  <span className="text-emerald-400 font-bold block">Telemetry Evidence:</span>
                  <p className="text-zinc-300 font-sans text-xs">{simResult.evidence}</p>
                </div>

                <div className="p-3 bg-black rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">AI Confidence Rating:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {Math.round(simResult.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                <Play className="w-8 h-8 opacity-40 text-emerald-400" />
                <p>Run simulation sandbox to evaluate rule matching accuracy.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Create Rule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative text-white text-xs">
            
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Custom Detection Rule</span>
            </h3>

            <form onSubmit={handleCreateRuleSubmit} className="space-y-3 font-sans">
              <div>
                <label className="block text-zinc-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. High Entropy DNS Query Burst"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Detailed description of detection behavior..."
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1 font-sans">Rule Format</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SIGMA">SIGMA</option>
                    <option value="YARA">YARA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-sans">Severity</label>
                  <select
                    value={ruleSev}
                    onChange={(e) => setRuleSev(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">MITRE ATT&amp;CK Mapping</label>
                <input
                  type="text"
                  value={ruleMitre}
                  onChange={(e) => setRuleMitre(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Rule Logic (YAML / YARA Syntax)</label>
                <textarea
                  rows={5}
                  value={ruleLogic}
                  onChange={(e) => setRuleLogic(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-md"
                >
                  Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
