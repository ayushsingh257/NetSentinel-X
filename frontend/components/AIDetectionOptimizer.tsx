"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Shield,
  Sliders,
  TrendingUp,
  ArrowUpRight,
  ThumbsUp,
  X
} from "lucide-react";

export interface RulePerformance {
  rule_id: string;
  rule_name: string;
  rule_type: string;
  executions_count: number;
  true_positives_count: number;
  false_positives_count: number;
  false_positive_rate: number;
  performance_score: number;
  severity_accuracy: number;
  mitre_coverage_score: number;
  avg_response_time_ms: number;
  last_analyzed: string;
}

export interface OptimizationRecommendation {
  id: string;
  rule_id: string;
  rule_name: string;
  category: string;
  title: string;
  description: string;
  current_state: string;
  suggested_change: string;
  expected_impact: string;
  confidence_score: number;
  status: string;
  created_at: string;
}

export interface DetectionGap {
  id: string;
  mitre_technique: string;
  mitre_tactic: string;
  gap_title: string;
  risk_severity: string;
  observed_attack_pattern: string;
  recommended_rule_logic: string;
}

export interface OptimizerOverview {
  total_rules_analyzed: number;
  avg_performance_score: number;
  overall_false_positive_rate: number;
  total_gaps_identified: number;
  recommendations_count: number;
  health_distribution: Record<string, number>;
  top_recommendations: OptimizationRecommendation[];
}

export default function AIDetectionOptimizer() {
  const [overview, setOverview] = useState<OptimizerOverview | null>(null);
  const [performances, setPerformances] = useState<RulePerformance[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [gaps, setGaps] = useState<DetectionGap[]>([]);
  const [activeTab, setActiveTab] = useState<"performance" | "recommendations" | "gaps">("performance");
  
  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [fbRuleId, setFbRuleId] = useState("RULE-SIGMA-001");
  const [fbVerdict, setFbVerdict] = useState("TRUE_POSITIVE");
  const [fbNotes, setFbNotes] = useState("");

  const fetchOptimizerData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const [overRes, perfRes, recRes, gapRes] = await Promise.all([
        fetch(`${apiUrl}/api/v2/optimizer`),
        fetch(`${apiUrl}/api/v2/optimizer/rules`),
        fetch(`${apiUrl}/api/v2/optimizer/recommendations`),
        fetch(`${apiUrl}/api/v2/optimizer/gaps`),
      ]);

      if (overRes.ok) {
        const data = await overRes.json();
        setOverview(data);
      }
      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerformances(data.performances || []);
      }
      if (recRes.ok) {
        const data = await recRes.json();
        setRecommendations(data.recommendations || []);
      }
      if (gapRes.ok) {
        const data = await gapRes.json();
        setGaps(data.gaps || []);
      }
    } catch (err) {
      console.error("Failed to fetch optimizer data:", err);
      const mockPerfs: RulePerformance[] = [
        {
          rule_id: "RULE-SIGMA-001",
          rule_name: "High Entropy DNS Tunneling Detection",
          rule_type: "SIGMA",
          executions_count: 1420,
          true_positives_count: 28,
          false_positives_count: 1,
          false_positive_rate: 0.034,
          performance_score: 94,
          severity_accuracy: 0.96,
          mitre_coverage_score: 0.95,
          avg_response_time_ms: 0.12,
          last_analyzed: new Date().toISOString(),
        },
        {
          rule_id: "RULE-SIGMA-003",
          rule_name: "Powershell Encoded Payload Execution",
          rule_type: "SIGMA",
          executions_count: 850,
          true_positives_count: 10,
          false_positives_count: 4,
          false_positive_rate: 0.285,
          performance_score: 72,
          severity_accuracy: 0.78,
          mitre_coverage_score: 0.85,
          avg_response_time_ms: 0.15,
          last_analyzed: new Date().toISOString(),
        },
      ];

      const mockRecs: OptimizationRecommendation[] = [
        {
          id: "REC-2026-001",
          rule_id: "RULE-SIGMA-003",
          rule_name: "Powershell Encoded Payload Execution",
          category: "Asset Exclusion",
          title: "Exclude Trusted Administrative Subnet / Host 10.0.0.5",
          description: "Internal IT management server 10.0.0.5 executes encoded PowerShell scripts causing 4 false positive triggers daily.",
          current_state: "Rule evaluates all hosts without ip exclusion filter.",
          suggested_change: "Add condition: not (src_ip == '10.0.0.5' and user == 'SYSTEM_ADMIN')",
          expected_impact: "Reduces rule false positive rate by 85% and improves performance score from 72 to 94.",
          confidence_score: 0.95,
          status: "PENDING",
          created_at: new Date().toISOString(),
        },
      ];

      const mockGaps: DetectionGap[] = [
        {
          id: "GAP-MITRE-T1003",
          mitre_technique: "T1003 - OS Credential Dumping",
          mitre_tactic: "Credential Access",
          gap_title: "Uncovered LSASS Memory Read Attempt",
          risk_severity: "CRITICAL",
          observed_attack_pattern: "Host 192.168.1.105 demonstrated abnormal process memory access targeting lsass.exe process.",
          recommended_rule_logic: `title: LSASS Process Memory Dump Access
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess: '0x1010'
    condition: selection`,
        },
      ];

      setOverview({
        total_rules_analyzed: 2,
        avg_performance_score: 83,
        overall_false_positive_rate: 0.032,
        total_gaps_identified: 1,
        recommendations_count: 1,
        health_distribution: { OPTIMAL: 1, NEEDS_TUNING: 1, POOR: 0 },
        top_recommendations: mockRecs,
      });
      setPerformances(mockPerfs);
      setRecommendations(mockRecs);
      setGaps(mockGaps);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOptimizerData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOptimizerData]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/optimizer/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_id: fbRuleId,
          analyst_verdict: fbVerdict,
          notes: fbNotes,
          submitted_by: "SOC Lead Analyst",
        }),
      });

      if (res.ok) {
        setShowFeedbackModal(false);
        setFbNotes("");
        void fetchOptimizerData();
      }
    } catch (err) {
      console.error("Submit feedback failed:", err);
    }
  };

  return (
    <div className="bg-zinc-950 border border-violet-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-500/50 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Detection Optimizer &amp; Coverage Studio
              <span className="text-xs px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                Continuous AI Tuning
              </span>
            </h2>
            <p className="text-xs text-zinc-400">False Positive Reduction, Rule Quality Scoring &amp; ATT&amp;CK Gap Analysis</p>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "performance"
                  ? "bg-violet-950 text-violet-300 border border-violet-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Rule Health</span>
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "recommendations"
                  ? "bg-violet-950 text-violet-300 border border-violet-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Tuning Recs ({recommendations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("gaps")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "gaps"
                  ? "bg-violet-950 text-violet-300 border border-violet-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>ATT&amp;CK Gaps ({gaps.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>

      {/* Optimizer Overview Analytics Banner */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Analyzed Detection Rules</span>
            <span className="text-lg font-bold text-violet-400">{overview.total_rules_analyzed} Rules</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Avg Rule Performance</span>
            <span className="text-lg font-bold text-emerald-400">{overview.avg_performance_score} / 100</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Overall False Positive Rate</span>
            <span className="text-lg font-bold text-cyan-400">{(overview.overall_false_positive_rate * 100).toFixed(1)}% Low</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">ATT&amp;CK Coverage Gaps</span>
            <span className="text-lg font-bold text-amber-400">{overview.total_gaps_identified} Identified</span>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === "performance" ? (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-zinc-400">
              <span>DETECTION RULE HEALTH LEADERBOARD</span>
              <span>QUALITY SCORE 0-100</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {performances.map((perf) => (
                <div key={perf.rule_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-violet-400 border border-zinc-800 font-bold text-[10px]">
                        {perf.rule_id}
                      </span>
                      <span className="font-bold text-white text-sm">{perf.rule_name}</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-mono">
                      Executions: {perf.executions_count} • True Positives: {perf.true_positives_count} • False Positives: {perf.false_positives_count} ({(perf.false_positive_rate * 100).toFixed(1)}%)
                    </p>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-lg font-bold text-emerald-400 block">{perf.performance_score} / 100</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">PERFORMANCE</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-cyan-400 block">{(perf.severity_accuracy * 100).toFixed(0)}%</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">ACCURACY</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "recommendations" ? (
        /* Recommendations View */
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-bold text-[10px]">
                      {rec.category}
                    </span>
                    <span className="text-white font-bold text-xs">{rec.title}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px]">
                    Confidence: {Math.round(rec.confidence_score * 100)}%
                  </span>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed">{rec.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-zinc-400 block font-bold">Current Logic Condition:</span>
                    <p className="text-zinc-300 font-sans text-xs">{rec.current_state}</p>
                  </div>
                  <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-emerald-400 block font-bold">Suggested AI Change:</span>
                    <p className="text-emerald-300 font-mono text-xs">{rec.suggested_change}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 font-mono text-xs">
                  <span className="text-violet-400 font-bold">Impact: {rec.expected_impact}</span>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1">
                    <span>Apply Optimization</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detection Gaps View */
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-3">
            {gaps.map((gap) => (
              <div key={gap.id} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold text-[10px]">
                      {gap.risk_severity} GAP
                    </span>
                    <span className="text-white font-bold text-xs">{gap.gap_title}</span>
                  </div>
                  <span className="text-purple-400 font-bold text-[11px]">{gap.mitre_technique}</span>
                </div>

                <p className="text-zinc-300 text-xs">{gap.observed_attack_pattern}</p>

                <div className="space-y-1 bg-black p-3 rounded-xl border border-zinc-800 font-mono text-xs">
                  <span className="text-cyan-400 font-bold block">Recommended Rule Template:</span>
                  <pre className="text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">{gap.recommended_rule_logic}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyst Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-violet-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white text-xs">
            
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <ThumbsUp className="w-4 h-4 text-violet-400" />
              <span>Submit Analyst Learning Feedback</span>
            </h3>

            <form onSubmit={handleSubmitFeedback} className="space-y-3 font-sans">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Select Target Rule</label>
                <select
                  value={fbRuleId}
                  onChange={(e) => setFbRuleId(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                >
                  {performances.map((p) => (
                    <option key={p.rule_id} value={p.rule_id}>
                      {p.rule_id} — {p.rule_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Analyst Accuracy Verdict</label>
                <select
                  value={fbVerdict}
                  onChange={(e) => setFbVerdict(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                >
                  <option value="TRUE_POSITIVE">TRUE POSITIVE (Accurate Alert)</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE (Noise / Trusted)</option>
                  <option value="BENIGN">BENIGN ANOMALY (Benign Behaviour)</option>
                  <option value="NEEDS_REVIEW">NEEDS REVIEW (Requires Investigation)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Analyst Notes &amp; Context</label>
                <textarea
                  rows={3}
                  value={fbNotes}
                  onChange={(e) => setFbNotes(e.target.value)}
                  placeholder="Notes explaining why this detection was accurate or false positive..."
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md"
                >
                  Record Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
