"use client";

import React, { useState } from "react";
import {
  Bot,
  ShieldAlert,
  Zap,
  Clock,
  Search,
  Sparkles,
  Layers,
  Terminal,
  Activity,
} from "lucide-react";

interface AnalysisResult {
  title: string;
  summary?: string;
  strategy?: string;
  rootCause?: string;
  generatedQuery?: string;
  action?: string;
  confidence: string;
}

export default function AISecurityAnalystDashboard() {
  const [activeTab, setActiveTab] = useState<"alert" | "threat" | "timeline" | "mitre" | "hunting">("alert");
  const [loading, setLoading] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleRunAnalysis = (type: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (type === "alert") {
        setAnalysisResult({
          title: "Brute Force & Privilege Escalation Attempt",
          summary: "Automated analysis indicates suspicious login velocity from external IP 185.220.101.5, followed by attempted privilege escalation on staging API gateway.",
          rootCause: "High-frequency failed auth calls triggering adaptive rate-limit throttling.",
          action: "Enforce IP drop rule on edge proxy, revoke active JWT tokens, and force password reset for analyst user accounts.",
          confidence: "97%",
        });
      } else if (type === "hunting") {
        setAnalysisResult({
          title: "Generated Sigma Threat Hunt Query",
          generatedQuery: `title: Suspicious PowerShell Encoded Payload\nlogsource:\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith: '\\powershell.exe'\n    CommandLine|contains: '-EncodedCommand'\n  condition: selection`,
          strategy: "Search endpoint event logs for encoded script execution originating from non-admin accounts.",
          confidence: "95%",
        });
      } else {
        setAnalysisResult({
          title: "Threat & IOC Deep Analysis",
          summary: "Indicator 185.220.101.5 identified as an active Tor Exit Node associated with Cobalt Strike C2 infrastructure.",
          action: "Deploy perimeter firewall block rule and check internal DNS query logs for domain matches.",
          confidence: "98%",
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              AI Security Analyst Subsystem
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                Era 33 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Autonomous Threat Reasoning, Alert Explanation, Timeline Analysis &amp; Threat Hunting Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-xl font-bold text-sm border border-cyan-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Engine: NetSentinel-AI-v2</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("alert")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "alert"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Alert Explainer
        </button>
        <button
          onClick={() => setActiveTab("threat")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "threat"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Zap className="w-4 h-4" /> Threat &amp; Incident Summarizer
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "timeline"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Clock className="w-4 h-4" /> Attack Timeline &amp; IOCs
        </button>
        <button
          onClick={() => setActiveTab("mitre")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "mitre"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="w-4 h-4" /> MITRE ATT&amp;CK Explainer
        </button>
        <button
          onClick={() => setActiveTab("hunting")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "hunting"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Terminal className="w-4 h-4" /> Threat Hunting Assistant
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-500" /> AI Analyst Query Prompt
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Submit security alerts, threat IDs, or hunting queries to trigger real-time AI reasoning.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {activeTab === "alert"
                ? "Select Alert ID or Payload"
                : activeTab === "hunting"
                ? "Describe Threat Hunting Goal"
                : "Target Indicator / Incident ID"}
            </label>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                activeTab === "alert"
                  ? "ALT-101 (Brute Force Auth Attempt from 185.220.101.5)"
                  : activeTab === "hunting"
                  ? "Find powershell execution with base64 encoded parameters"
                  : "TRT-202 / 185.220.101.5"
              }
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleRunAnalysis(activeTab)}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Reasoning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Security Analysis
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-slate-400">Supported LLM Providers</span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">Gemini Pro</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">OpenAI GPT-4</span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">Anthropic Claude</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">Ollama Local</span>
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning Output */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-500" /> AI Analyst Findings &amp; Guidance
            </h2>
            {analysisResult && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                Confidence: {analysisResult.confidence}
              </span>
            )}
          </div>

          {analysisResult ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{analysisResult.title}</h3>
                <p className="text-slate-600 dark:text-zinc-400">{analysisResult.summary || analysisResult.strategy}</p>
              </div>

              {analysisResult.rootCause && (
                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">Root Cause Analysis</span>
                  <p className="text-slate-700 dark:text-zinc-300">{analysisResult.rootCause}</p>
                </div>
              )}

              {analysisResult.generatedQuery && (
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2 font-mono text-[11px] text-emerald-400">
                  <span className="text-zinc-500 text-[10px] uppercase font-sans font-bold">Generated Detection Query</span>
                  <pre className="whitespace-pre-wrap">{analysisResult.generatedQuery}</pre>
                </div>
              )}

              {analysisResult.action && (
                <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20 space-y-1">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-[10px]">Recommended Action</span>
                  <p className="text-slate-700 dark:text-zinc-300">{analysisResult.action}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
              <Bot className="w-12 h-12 text-slate-300 dark:text-zinc-700" />
              <p className="text-xs">No active analysis loaded. Enter a prompt or select a pre-loaded alert to run the AI Security Analyst.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
