"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Terminal,
  RefreshCw,
  Search
} from "lucide-react";

export interface TimelineEvent {
  step: number;
  title: string;
  description: string;
  protocol: string;
  source_ip: string;
  dest_ip: string;
  timestamp: string;
  severity: string;
}

export interface EvidenceRecord {
  id: string;
  source: string;
  type: string;
  description: string;
  value: string;
  timestamp: string;
}

export interface Investigation {
  id: string;
  title: string;
  severity: string;
  threat_story: string;
  root_cause: string;
  confidence_score: number;
  confidence_level: string;
  mitre_technique: string;
  mitre_tactic: string;
  affected_assets: string[];
  timeline?: TimelineEvent[];
  evidence?: EvidenceRecord[];
  recommended_actions?: string[];
  status: string;
  created_at: string;
}

export default function ThreatInvestigation() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);
  const [generating, setGenerating] = useState(false);
  const [targetIP, setTargetIP] = useState("192.168.1.105");

  const fetchInvestigations = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/investigations`);
      if (res.ok) {
        const data = await res.json();
        if (data.investigations && data.investigations.length > 0) {
          setInvestigations(data.investigations);
          setSelectedInv(data.investigations[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch investigations:", err);
      const mockInv: Investigation = {
        id: "INV-2026-001",
        title: "DNS Tunneling & C2 Exfiltration Sequence",
        severity: "HIGH",
        confidence_score: 0.96,
        confidence_level: "CRITICAL",
        mitre_technique: "T1048.003 - Exfiltration Over Alternative Protocol (DNS)",
        mitre_tactic: "Exfiltration",
        affected_assets: ["192.168.1.105 (Workstation-A)", "10.0.0.1 (Gateway)"],
        status: "OPEN",
        created_at: new Date().toISOString(),
        threat_story: "At 14:32:05 UTC, internal host 192.168.1.105 initiated high-frequency DNS query bursts (entropy > 4.8) targeting subdomain malicious-c2-beacon.example-tunnel.org over port 53. Payload examination revealed base64-encoded file fragments embedded within TXT query parameters, indicating DNS protocol tunneling and data exfiltration.",
        root_cause: "Compromised internal workstation workstation-A executing malicious script payload via DNS port 53 bypass.",
        timeline: [
          {
            step: 1,
            title: "Initial Network Socket Connection",
            description: "Host 192.168.1.105 established UDP socket to external DNS resolver 8.8.8.8:53.",
            protocol: "UDP",
            source_ip: "192.168.1.105",
            dest_ip: "8.8.8.8",
            timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
            severity: "INFO",
          },
          {
            step: 2,
            title: "High-Entropy DNS Query Burst",
            description: "Generated 14 rapid TXT record lookups containing 64+ char random string payloads.",
            protocol: "DNS",
            source_ip: "192.168.1.105",
            dest_ip: "185.220.101.5",
            timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
            severity: "MEDIUM",
          },
          {
            step: 3,
            title: "NetSentinel-X Detection Engine Trigger",
            description: "Signature RULE_DNS_TUNNELING matched 14 requests within 500ms window.",
            protocol: "DNS",
            source_ip: "192.168.1.105",
            dest_ip: "185.220.101.5",
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            severity: "HIGH",
          },
          {
            step: 4,
            title: "Automated Isolation & Alerting",
            description: "Host flagged for isolation; SOC incident INC-8092 created automatically.",
            protocol: "SYSTEM",
            source_ip: "192.168.1.105",
            dest_ip: "10.0.0.1",
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
            severity: "HIGH",
          },
        ],
        evidence: [
          {
            id: "EV-101",
            source: "DPI Dissector",
            type: "DNS TXT Payload",
            description: "Captured sub-domain lookup with encoded payload chunk",
            value: "malicious-c2-beacon.example-tunnel.org | TXT Record Payload: ZmFzdC1leGZpbHRyYXRpb24=",
            timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
          },
          {
            id: "EV-102",
            source: "Threat Intelligence",
            type: "AbuseIPDB Score",
            description: "Destination IP 185.220.101.5 threat intelligence lookup",
            value: "Confidence Score: 88% | Category: Tor Exit Node / C2 Server",
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          },
        ],
        recommended_actions: [
          "Immediately quarantine host 192.168.1.105 from local VLAN segment",
          "Block destination domain example-tunnel.org on perimeter DNS sinkhole",
          "Flush local DNS cache on gateway 10.0.0.1",
          "Conduct endpoint forensic scan on workstation-A",
        ],
      };
      setInvestigations([mockInv]);
      setSelectedInv(mockInv);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchInvestigations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInvestigations]);

  const handleGenerateInvestigation = async () => {
    setGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/investigations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_ip: targetIP }),
      });
      if (res.ok) {
        const newInv: Investigation = await res.json();
        setInvestigations((prev) => [newInv, ...prev]);
        setSelectedInv(newInv);
      }
    } catch (err) {
      console.error("Failed to generate investigation:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Threat Investigation Engine
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                v2.0 Core
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Automated Threat Stories, Attack Timelines &amp; Multi-Event Correlation</p>
          </div>
        </div>

        {/* Target IP Input & Generate Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={targetIP}
              onChange={(e) => setTargetIP(e.target.value)}
              placeholder="Target IP (e.g. 192.168.1.105)"
              className="bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>
          <button
            onClick={handleGenerateInvestigation}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Investigation</span>
          </button>
        </div>
      </div>

      {/* Investigation Selector Tabs */}
      {investigations.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80">
          {investigations.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedInv(inv)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                selectedInv?.id === inv.id
                  ? "bg-zinc-800 text-white border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800"
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${inv.severity === "HIGH" ? "text-red-400" : "text-amber-400"}`} />
              <span>{inv.id}</span>
              <span className="text-[10px] text-zinc-400">({inv.confidence_level})</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Investigation Display */}
      {selectedInv ? (
        <div className="space-y-6">
          
          {/* Top Info Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
            <div className="lg:col-span-8 space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block">CASE RECORD ID: {selectedInv.id}</span>
              <h3 className="text-lg font-bold text-white">{selectedInv.title}</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Created: {new Date(selectedInv.created_at).toLocaleString()}</span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-semibold">MITRE: {selectedInv.mitre_technique}</span>
              </p>
            </div>

            <div className="lg:col-span-4 flex items-center justify-end gap-3">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Confidence Score</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {Math.round((selectedInv.confidence_score || 0.95) * 100)}%
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Risk Severity</span>
                <span className="text-xl font-bold text-red-400 font-mono uppercase">
                  {selectedInv.severity || "HIGH"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Threat Story Narrative */}
          <div className="bg-zinc-900/60 rounded-2xl border border-purple-950/80 p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Threat Narrative &amp; Story</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black/60 p-4 rounded-xl border border-zinc-800/80 font-sans">
              {selectedInv.threat_story}
            </p>
            <div className="pt-1">
              <span className="text-xs font-bold text-red-400 block mb-1">Root Cause Analysis:</span>
              <p className="text-xs text-zinc-300 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
                {selectedInv.root_cause}
              </p>
            </div>
          </div>

          {/* Attack Timeline Sequence */}
          {selectedInv.timeline && selectedInv.timeline.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Correlated Attack Timeline Sequence</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {selectedInv.timeline.map((ev) => (
                  <div key={ev.step} className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">STEP 0{ev.step}</span>
                      <span className="text-zinc-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{ev.title}</h5>
                    <p className="text-[11px] text-zinc-400 leading-normal">{ev.description}</p>
                    <div className="text-[10px] font-mono text-zinc-500 border-t border-zinc-800 pt-2 flex items-center justify-between">
                      <span>{ev.protocol}</span>
                      <span>{ev.source_ip} -&gt; {ev.dest_ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Collection & Recommended Actions Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Telemetry Evidence Collection */}
            <div className="space-y-3 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Collected Telemetry Evidence</span>
              </h4>
              <div className="space-y-2">
                {selectedInv.evidence && selectedInv.evidence.map((ev) => (
                  <div key={ev.id} className="p-3 bg-black rounded-xl border border-zinc-800 font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between text-cyan-400">
                      <span className="font-bold">[{ev.id}] {ev.type}</span>
                      <span className="text-[10px] text-zinc-500">{ev.source}</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">{ev.description}</p>
                    <p className="text-zinc-400 text-[11px] bg-zinc-950 p-2 rounded border border-zinc-900">{ev.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Response Actions */}
            <div className="space-y-3 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recommended Response Actions</span>
              </h4>
              <div className="space-y-2">
                {selectedInv.recommended_actions && selectedInv.recommended_actions.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-white text-[10px] font-semibold transition-colors">
                      Execute Action
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-12 text-center text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
          <p>Loading threat investigations...</p>
        </div>
      )}

    </div>
  );
}
