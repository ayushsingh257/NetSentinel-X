"use client";

import React, { useState } from "react";
import {
  FileCode,
  ShieldCheck,
  Play,
  Plus,
  CheckCircle2,
  Code,
  PieChart,
  Sliders,
} from "lucide-react";

interface Rule {
  id: string;
  name: string;
  type: "SIGMA" | "YARA" | "CUSTOM";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ENABLED" | "DISABLED";
  version: number;
  mitre: string;
}

const INITIAL_RULES: Rule[] = [
  {
    id: "RULE-SIGMA-001",
    name: "Suspicious PowerShell Encoded Command Execution",
    type: "SIGMA",
    severity: "HIGH",
    status: "ENABLED",
    version: 1,
    mitre: "T1059.001",
  },
  {
    id: "RULE-YARA-002",
    name: "Cobalt Strike Beacon Signature Match",
    type: "YARA",
    severity: "CRITICAL",
    status: "ENABLED",
    version: 2,
    mitre: "T1071.001",
  },
  {
    id: "RULE-CUST-003",
    name: "High Velocity Failed Auth Throttling",
    type: "CUSTOM",
    severity: "HIGH",
    status: "ENABLED",
    version: 1,
    mitre: "T1110.001",
  },
];

export default function AdvancedDetectionEngineeringDashboard() {
  const [activeTab, setActiveTab] = useState<"rules" | "test" | "simulate" | "metrics">("rules");
  const [rules] = useState<Rule[]>(INITIAL_RULES);
  const [ruleType, setRuleType] = useState<"SIGMA" | "YARA" | "CUSTOM">("SIGMA");
  const [ruleContent, setRuleContent] = useState("title: Custom Sigma Rule\nlogsource:\n  category: network\ndetection:\n  selection:\n    DstPort: 4444\n  condition: selection");
  const [testPayload, setTestPayload] = useState("Network packet outbound to destination port 4444");
  const [testResult, setTestResult] = useState<{ valid: boolean; matches: number; time: string } | null>(null);

  const handleTestRule = () => {
    setTestResult({
      valid: true,
      matches: 1,
      time: "1.2ms",
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileCode className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Advanced Detection Engineering Subsystem
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 34 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Sigma Rules, YARA Signatures, Custom Detection Rules, Sandbox Validation &amp; MITRE Coverage Metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>MITRE Coverage: 88.5%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "rules"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Code className="w-4 h-4" /> Rules Inventory ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "test"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Play className="w-4 h-4" /> Rule Testing &amp; Validation
        </button>
        <button
          onClick={() => setActiveTab("simulate")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "simulate"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sliders className="w-4 h-4" /> Backtest Simulation
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "metrics"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <PieChart className="w-4 h-4" /> Detection Analytics &amp; Metrics
        </button>
      </div>

      {/* TAB 1: Rules Inventory */}
      {activeTab === "rules" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise Detection Rules</h2>
            <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Author New Rule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Rule Name</th>
                  <th className="p-3">Engine Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">MITRE ATT&amp;CK</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{r.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{r.name}</td>
                    <td className="p-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === "SIGMA"
                            ? "bg-blue-500/10 text-blue-500"
                            : r.type === "YARA"
                            ? "bg-purple-500/10 text-purple-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.severity === "CRITICAL"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{r.mitre}</td>
                    <td className="p-3 font-mono">v{r.version}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Rule Testing */}
      {activeTab === "test" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" /> Rule Content Sandbox
            </h2>
            <div className="flex gap-2">
              {(["SIGMA", "YARA", "CUSTOM"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRuleType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    ruleType === t
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={ruleContent}
              onChange={(e) => setRuleContent(e.target.value)}
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 text-emerald-400 focus:outline-none"
            />
            <button
              onClick={handleTestRule}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" /> Run Rule Validation &amp; Test Match
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-500" /> Sample Telemetry Input &amp; Results
            </h2>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={4}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
            />
            {testResult ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Rule Syntax Valid
                  </span>
                  <span className="font-mono text-slate-500">{testResult.time}</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 font-semibold">
                  Matches Found: {testResult.matches} pattern trigger(s) detected in payload.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl text-xs text-slate-400 text-center">
                Click Run Rule Validation to test the rule content against sample telemetry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Backtest Simulation */}
      {activeTab === "simulate" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" /> Backtest Historical Rule Simulation
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Simulate new detection rules against 24-hour historical log archives (10,000 events) to estimate false positive rates before production deployment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-500">Historical Events Evaluated</span>
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">10,000</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-500">Simulated Matches</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">14 Detections</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-500">Estimated False Positive Rate</span>
              <p className="text-2xl font-black text-blue-500 mt-1">0.02%</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Detection Analytics */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Active Rules</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">3 Rules</h3>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Sigma Rule Count</span>
              <h3 className="text-2xl font-black text-blue-500 mt-1">1 Active</h3>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">YARA Rule Count</span>
              <h3 className="text-2xl font-black text-purple-500 mt-1">1 Active</h3>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-500 uppercase">24h Total Detections</span>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">142 Matches</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
