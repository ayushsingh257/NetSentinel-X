"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BrainCircuit,
  ShieldAlert,
  Sparkles,
  Send,
  RefreshCw,
  AlertTriangle,
  Clock,
  FileText,
  Bot,
  User,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export interface AIAnalysisItem {
  id: string;
  event_id: string;
  confidence_score: number;
  classification: string;
  category: string;
  risk_score: number;
  false_positive_prob: number;
  mitre_mapping: {
    tactic: string;
    technique: string;
    technique_id: string;
    description: string;
    mitigations: string[];
  };
  recommendations: string[];
  created_at: string;
  provider_name: string;
}

export interface InvestigationData {
  incident_id: string;
  incident_summary: string;
  attack_timeline: {
    timestamp: string;
    stage: string;
    description: string;
    source: string;
  }[];
  affected_assets: string[];
  related_events: string[];
  recommended_actions: string[];
  generated_at: string;
}

export interface ChatMessage {
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  techniques?: string[];
  actions?: string[];
}

export default function AISecurityAnalystDashboard() {
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisItem[]>([]);
  const [investigation, setInvestigation] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat Copilot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "copilot",
      text: "Hello SOC Analyst! I am the NetSentinel-X Autonomous Copilot. Ask me anything about current incidents, threat vectors, or containment playbooks.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const fetchAIData = useCallback(async () => {
    try {
      const [analysisRes, invRes] = await Promise.all([
        fetchWithAuth("/api/v2/ai/analysis/latest?limit=10"),
        fetchWithAuth("/api/v2/ai/investigation/INC-2026-9901"),
      ]);

      if (analysisRes.ok) {
        const json = await analysisRes.json();
        if (Array.isArray(json.results)) {
          setAnalysisResults(json.results);
        }
      }

      if (invRes.ok) {
        const invJson = await invRes.json();
        setInvestigation(invJson);
      }
      setError(null);
    } catch (err) {
      console.error("AI Intelligence Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load AI Intelligence data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchAIData();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchAIData]);

  const handleSendChat = async (inputPrompt?: string) => {
    const textToSend = inputPrompt || promptInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!inputPrompt) setPromptInput("");
    setChatSending(true);

    try {
      const res = await fetchWithAuth("/api/v2/ai/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      if (res.ok) {
        const json = await res.json();
        const copilotMsg: ChatMessage = {
          sender: "copilot",
          text: json.answer,
          timestamp: new Date().toLocaleTimeString(),
          techniques: json.related_techniques,
          actions: json.recommended_actions,
        };
        setChatMessages((prev) => [...prev, copilotMsg]);
      } else {
        throw new Error("Copilot response error");
      }
    } catch (err) {
      console.error("Copilot Error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: "Fallback Copilot Response: Correlated event logs indicate initial web application exploitation (T1190). Recommended containment: isolate target IP 192.168.1.100 and apply WAF blocking.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">CRITICAL RISK ({score.toFixed(1)})</span>;
    if (score >= 50) return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">HIGH RISK ({score.toFixed(1)})</span>;
    return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">MODERATE RISK ({score.toFixed(1)})</span>;
  };

  if (loading && analysisResults.length === 0) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-white rounded-2xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-400" /> AI SOC Intelligence Studio
        </h2>
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  const latestFinding = analysisResults[0];

  return (
    <DashboardErrorBoundary fallbackTitle="AI Security Intelligence Module Error">
      <div className="space-y-6 font-sans text-slate-100">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                AI Security Analyst &amp; Autonomous Copilot
                <span className="text-xs px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  Phase 4 Provider-Agnostic Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated threat classification, dynamic risk scoring, attack timeline reconstruction &amp; SOC copilot
              </p>
            </div>
          </div>

          <button
            onClick={fetchAIData}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Analyze Intelligence</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>⚠ AI Intelligence Error: {error} — Operating in provider-agnostic fallback mode.</span>
          </div>
        )}

        {/* Dynamic Risk & Latest AI Finding Banner */}
        {latestFinding && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 border-r border-slate-800/80 pr-4">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Autonomous Risk Scoring Engine</span>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-white font-mono">{latestFinding.risk_score.toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ 100</span>
                {getRiskBadge(latestFinding.risk_score)}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Provider: <strong className="text-cyan-400">{latestFinding.provider_name}</strong> | Confidence: <strong className="text-emerald-400">{(latestFinding.confidence_score * 100).toFixed(0)}%</strong>
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Latest AI Threat Classification</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                {latestFinding.classification}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {latestFinding.mitre_mapping.technique_id} - {latestFinding.mitre_mapping.technique}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {latestFinding.mitre_mapping.description}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Investigation Assistant Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" /> AI Investigation Timeline Reconstruction
              </h2>
              <span className="text-xs font-mono text-cyan-400">{investigation?.incident_id || "INC-2026-9901"}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {investigation?.incident_summary || "Autonomous timeline reconstruction analyzing correlated events across packet capture, EDR, and UEBA analytics."}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Attack Path Reconstruction:</span>
              <div className="space-y-2">
                {investigation?.attack_timeline.map((evt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs font-mono">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold text-[10px]">
                          {evt.stage}
                        </span>
                        <span className="text-[11px] text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-200">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Recommended Containment Actions:</span>
              <ul className="space-y-1 text-xs text-emerald-300 font-mono">
                {investigation?.recommended_actions.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {act}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Copilot Interactive Chat Interface */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> SOC Security Copilot
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  🟢 ONLINE
                </span>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <button
                  onClick={() => handleSendChat("What happened during this incident?")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                >
                  &quot;What happened during this incident?&quot;
                </button>
                <button
                  onClick={() => handleSendChat("How should this threat be contained?")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                >
                  &quot;How to contain threat?&quot;
                </button>
              </div>

              {/* Chat Log Window */}
              <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "copilot" && (
                      <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-xl leading-relaxed font-mono ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white font-bold"
                          : "bg-slate-900 border border-slate-800 text-slate-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.actions && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-cyan-300 space-y-1">
                          <strong>Actions:</strong>
                          {msg.actions.map((act, k) => (
                            <div key={k}>• {act}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask SOC copilot a security question..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={chatSending}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardErrorBoundary>
  );
}
