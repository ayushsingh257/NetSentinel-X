"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Shield,
  Activity,
  Search,
  CheckCircle2,
  ExternalLink,
  Flame,
  X,
  Sparkles
} from "lucide-react";

export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  detection_count: number;
  risk_level: string;
  confidence_score: number;
  affected_hosts: string[];
  current_alerts: string[];
  related_investigations: string[];
  ai_explanation: string;
  mitigation_guidance: string;
  reference_links: string[];
}

export interface MITRETacticGroup {
  tactic_name: string;
  techniques: MITRETechnique[];
}

export interface MITREHeatMap {
  most_triggered_techniques: string[];
  most_active_tactics: string[];
  most_attacked_hosts: string[];
  severity_distribution: Record<string, number>;
}

export interface MITREStatistics {
  total_techniques_mapped: number;
  active_tactics_count: number;
  high_risk_techniques: number;
  top_attacked_host: string;
  overall_posture_score: number;
}

export default function MITREIntelligence() {
  const [matrix, setMatrix] = useState<MITRETacticGroup[]>([]);
  const [stats, setStats] = useState<MITREStatistics | null>(null);
  const [heatmap, setHeatmap] = useState<MITREHeatMap | null>(null);
  const [selectedTech, setSelectedTech] = useState<MITRETechnique | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"matrix" | "heatmap">("matrix");

  const fetchMITREData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const [matRes, statRes, heatRes] = await Promise.all([
        fetch(`${apiUrl}/api/v2/mitre/matrix`),
        fetch(`${apiUrl}/api/v2/mitre/statistics`),
        fetch(`${apiUrl}/api/v2/mitre/heatmap`),
      ]);

      if (matRes.ok) {
        const data = await matRes.json();
        setMatrix(data.matrix || []);
      }
      if (statRes.ok) {
        const data = await statRes.json();
        setStats(data);
      }
      if (heatRes.ok) {
        const data = await heatRes.json();
        setHeatmap(data);
      }
    } catch (err) {
      console.error("Failed to fetch MITRE ATT&CK data:", err);
      // Mock Fallback Matrix
      const mockMatrix: MITRETacticGroup[] = [
        {
          tactic_name: "Initial Access",
          techniques: [
            {
              id: "T1190",
              name: "Exploit Public-Facing Application",
              tactic: "Initial Access",
              description: "Adversaries attempt to exploit Internet-facing applications.",
              detection_count: 18,
              risk_level: "HIGH",
              confidence_score: 0.92,
              affected_hosts: ["192.168.1.100"],
              current_alerts: ["ALT-1002: SQLi Attempt"],
              related_investigations: ["INV-2026-003"],
              ai_explanation: "Exploitation of web vulnerabilities enables initial intrusion.",
              mitigation_guidance: "Apply WAF rules, patch public services, and enforce input validation.",
              reference_links: ["https://attack.mitre.org/techniques/T1190/"],
            },
          ],
        },
        {
          tactic_name: "Execution",
          techniques: [
            {
              id: "T1059",
              name: "Command and Scripting Interpreter",
              tactic: "Execution",
              description: "Abusing PowerShell/Bash interpreters.",
              detection_count: 34,
              risk_level: "HIGH",
              confidence_score: 0.95,
              affected_hosts: ["192.168.1.105"],
              current_alerts: ["ALT-2040: Encoded PowerShell"],
              related_investigations: ["INV-2026-001"],
              ai_explanation: "Fileless execution of malicious payloads in memory.",
              mitigation_guidance: "Constrain PowerShell language modes and enable logging.",
              reference_links: ["https://attack.mitre.org/techniques/T1059/"],
            },
          ],
        },
        {
          tactic_name: "Credential Access",
          techniques: [
            {
              id: "T1110",
              name: "Brute Force",
              tactic: "Credential Access",
              description: "High-velocity login attempts to gain account access.",
              detection_count: 45,
              risk_level: "HIGH",
              confidence_score: 0.98,
              affected_hosts: ["192.168.1.180", "10.0.0.1"],
              current_alerts: ["ALT-2041: SSH Port Brute Force"],
              related_investigations: ["INV-2026-002"],
              ai_explanation: "Brute force credential guessing targeting SSH/RDP.",
              mitigation_guidance: "Enforce MFA and lockout rate limits.",
              reference_links: ["https://attack.mitre.org/techniques/T1110/"],
            },
          ],
        },
        {
          tactic_name: "Command & Control",
          techniques: [
            {
              id: "T1071",
              name: "Application Layer Protocol",
              tactic: "Command & Control",
              description: "C2 beaconing over HTTP/TLS/DNS.",
              detection_count: 68,
              risk_level: "HIGH",
              confidence_score: 0.97,
              affected_hosts: ["192.168.1.105"],
              current_alerts: ["ALT-8001: Suspicious Beacon"],
              related_investigations: ["INV-2026-001"],
              ai_explanation: "Encrypted C2 channel using standard port 443/53.",
              mitigation_guidance: "Implement SSL inspection and domain sinkholing.",
              reference_links: ["https://attack.mitre.org/techniques/T1071/"],
            },
          ],
        },
        {
          tactic_name: "Exfiltration",
          techniques: [
            {
              id: "T1048.003",
              name: "Exfiltration Over Alternative Protocol (DNS)",
              tactic: "Exfiltration",
              description: "Encoding data fragments within DNS subdomains.",
              detection_count: 29,
              risk_level: "CRITICAL",
              confidence_score: 0.99,
              affected_hosts: ["192.168.1.105", "10.0.0.1"],
              current_alerts: ["ALT-8910: High Entropy DNS Query"],
              related_investigations: ["INV-2026-001"],
              ai_explanation: "Data exfiltration using base64 encoded TXT queries.",
              mitigation_guidance: "Restrict outbound DNS to internal resolvers and inspect entropy.",
              reference_links: ["https://attack.mitre.org/techniques/T1048/003/"],
            },
          ],
        },
      ];
      setMatrix(mockMatrix);
      setStats({
        total_techniques_mapped: 12,
        active_tactics_count: 12,
        high_risk_techniques: 8,
        top_attacked_host: "192.168.1.105 (Workstation-A)",
        overall_posture_score: 86.4,
      });
      setHeatmap({
        most_triggered_techniques: ["T1071 (68)", "T1110 (45)", "T1059 (34)", "T1048.003 (29)"],
        most_active_tactics: ["Command & Control", "Credential Access", "Exfiltration"],
        most_attacked_hosts: ["192.168.1.105", "192.168.1.180"],
        severity_distribution: { CRITICAL: 2, HIGH: 6, MEDIUM: 3, LOW: 1 },
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMITREData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMITREData]);

  const filteredMatrix = matrix.map((grp) => ({
    ...grp,
    techniques: grp.techniques.filter(
      (tech) =>
        tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tactic.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((grp) => grp.techniques.length > 0 || searchQuery === "");

  return (
    <div className="bg-zinc-950 border border-purple-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Enterprise MITRE ATT&amp;CK Intelligence Engine
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                v14 Enterprise
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Real-Time ATT&amp;CK Mapping, Threat Heat Map &amp; Automated Mitigation</p>
          </div>
        </div>

        {/* Search & Tab Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Technique ID or Name..."
              className="bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 w-56"
            />
          </div>

          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "matrix" ? "bg-purple-950 text-purple-300 border border-purple-800" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matrix Grid</span>
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "heatmap" ? "bg-purple-950 text-purple-300 border border-purple-800" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Heat Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Statistics Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Mapped Techniques</span>
            <span className="text-lg font-bold text-cyan-400">{stats.total_techniques_mapped} Techniques</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Active Tactics</span>
            <span className="text-lg font-bold text-purple-400">{stats.active_tactics_count} Tactics</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">High-Risk Detections</span>
            <span className="text-lg font-bold text-red-400">{stats.high_risk_techniques} Flagged</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">ATT&amp;CK Posture Score</span>
            <span className="text-lg font-bold text-emerald-400">{stats.overall_posture_score}% Stable</span>
          </div>
        </div>
      )}

      {/* Main View Mode */}
      {activeTab === "matrix" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <div className="flex gap-3 min-w-[1200px]">
              {filteredMatrix.map((grp, idx) => (
                <div key={idx} className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 font-mono">{grp.tactic_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      {grp.techniques.length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {grp.techniques.map((tech) => (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTech(tech)}
                        className="p-2.5 rounded-lg bg-black border border-zinc-800 hover:border-purple-500/80 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 space-y-1 group"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-purple-400 group-hover:text-purple-300">{tech.id}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              tech.risk_level === "CRITICAL"
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : tech.risk_level === "HIGH"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            }`}
                          >
                            {tech.detection_count}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 font-sans">{tech.name}</h4>
                      </div>
                    ))}

                    {grp.techniques.length === 0 && (
                      <div className="p-3 text-center text-[11px] text-zinc-500 font-mono border border-dashed border-zinc-800 rounded-lg">
                        No active detections
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Real-Time ATT&CK Heat Map View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 font-sans">
          
          <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Most Triggered Techniques</span>
            </h4>
            <div className="space-y-2">
              {heatmap?.most_triggered_techniques.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-300">{item}</span>
                  <span className="text-red-400 font-bold">TOP 0{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Most Active Tactics</span>
            </h4>
            <div className="space-y-2">
              {heatmap?.most_active_tactics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-300">{item}</span>
                  <span className="text-cyan-400 font-bold">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Most Attacked Host Assets</span>
            </h4>
            <div className="space-y-2">
              {heatmap?.most_attacked_hosts.map((host, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-300">{host}</span>
                  <span className="text-amber-400 font-bold">FLAGGED</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Selected Technique Details Modal */}
      {selectedTech && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-purple-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
            
            <button
              onClick={() => setSelectedTech(null)}
              className="absolute right-5 top-5 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  {selectedTech.id}
                </span>
                <span className="text-zinc-400">• Tactic: {selectedTech.tactic}</span>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold ml-auto">
                  {selectedTech.risk_level} (Score: {Math.round(selectedTech.confidence_score * 100)}%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white pt-1">{selectedTech.name}</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
              {selectedTech.description}
            </p>

            <div className="space-y-2 bg-purple-950/20 border border-purple-900/40 p-4 rounded-xl">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI ATT&amp;CK Reasoning Explanation:</span>
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{selectedTech.ai_explanation}</p>
            </div>

            <div className="space-y-2 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mitigation &amp; Defensive Guidance:</span>
              </span>
              <p className="text-xs text-emerald-300 leading-relaxed">{selectedTech.mitigation_guidance}</p>
            </div>

            {selectedTech.reference_links && selectedTech.reference_links.length > 0 && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>MITRE Enterprise Reference:</span>
                <a
                  href={selectedTech.reference_links[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>View attack.mitre.org</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
