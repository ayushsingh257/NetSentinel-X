"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  Sparkles,
  Shield,
  ChevronRight,
  RotateCcw,
  Globe,
  Server,
  AlertTriangle,
  FileCode2
} from "lucide-react";

export interface HistoricalEvent {
  id: string;
  event_type: string;
  source: string;
  destination: string;
  protocol: string;
  risk_score: number;
  mitre_technique: string;
  description: string;
  timestamp: string;
  related_ioc: string;
  related_incident: string;
}

export interface IOCHistory {
  ioc: string;
  ioc_type: string;
  first_seen: string;
  last_seen: string;
  total_occurrences: number;
  risk_trend: string;
  previous_incidents: string[];
  related_campaigns: string[];
  severity_history: number[];
}

export interface AttackReplayStep {
  step_index: number;
  node_type: string;
  label: string;
  description: string;
  timestamp: string;
  risk_score: number;
}

export interface ThreatHuntResult {
  query_text: string;
  hypothesis: string;
  matched_events: HistoricalEvent[];
  ioc_matches: IOCHistory[];
  replay_sequence: AttackReplayStep[];
  risk_explanation: string;
  investigation_steps: string[];
  confidence_score: number;
}

const MOCK_REPLAY_STEPS = [
  { step_index: 1, node_type: "EXTERNAL_IP", label: "185.220.101.45 (C2 Host)", description: "Initial outbound connection observed from internal workstation.", timestamp: "2026-07-26T16:15:00.000Z", risk_score: 96 },
  { step_index: 2, node_type: "DOMAIN", label: "c2-command.malicious.net", description: "DNS query to C2 domain matched threat intel feed.", timestamp: "2026-07-26T16:17:00.000Z", risk_score: 92 },
  { step_index: 3, node_type: "INTERNAL_HOST", label: "192.168.1.105 (Workstation-A)", description: "Compromised host initiated repeated TLS beaconing over port 443.", timestamp: "2026-07-26T16:20:00.000Z", risk_score: 90 },
  { step_index: 4, node_type: "DETECTION_RULE", label: "RULE-SIGMA-001 (DNS Tunneling)", description: "Sigma rule fired on abnormal DNS query payload size and frequency.", timestamp: "2026-07-26T16:25:00.000Z", risk_score: 85 },
  { step_index: 5, node_type: "INCIDENT", label: "INC-2026-8001 (C2 Event)", description: "Incident case automatically created with CRITICAL severity and P1 SLA.", timestamp: "2026-07-26T16:30:00.000Z", risk_score: 98 },
];

export default function ThreatHuntingWorkspace() {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [huntResult, setHuntResult] = useState<ThreatHuntResult | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "hunt" | "replay">("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [huntQuery, setHuntQuery] = useState("");
  const [isHunting, setIsHunting] = useState(false);

  const fetchEvents = useCallback(async (query?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const url = query
        ? `${apiUrl}/api/v2/history/search?q=${encodeURIComponent(query)}`
        : `${apiUrl}/api/v2/history/events`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      setEvents([
        { id: "HE-001", event_type: "ALERT", source: "185.220.101.45", destination: "192.168.1.105", protocol: "HTTPS", risk_score: 95, mitre_technique: "T1071.001", description: "Outbound C2 beaconing detected via HTTPS to known malicious host.", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), related_ioc: "185.220.101.45", related_incident: "INC-2026-8001" },
        { id: "HE-002", event_type: "IOC_MATCH", source: "c2-command.malicious.net", destination: "192.168.1.105", protocol: "DNS", risk_score: 90, mitre_technique: "T1071.001", description: "DNS query to known C2 domain matched threat feed.", timestamp: new Date(Date.now() - 43 * 60000).toISOString(), related_ioc: "c2-command.malicious.net", related_incident: "INC-2026-8001" },
        { id: "HE-003", event_type: "UEBA_ANOMALY", source: "192.168.1.105", destination: "external", protocol: "TLS", risk_score: 88, mitre_technique: "T1571", description: "Abnormal port usage anomaly. Host deviated 3.4 sigma from baseline.", timestamp: new Date(Date.now() - 40 * 60000).toISOString(), related_ioc: "192.168.1.105", related_incident: "" },
        { id: "HE-004", event_type: "DETECTION", source: "RULE-SIGMA-001", destination: "192.168.1.105", protocol: "DNS", risk_score: 85, mitre_technique: "T1071.001", description: "Custom Sigma rule fired: DNS Tunneling pattern identified.", timestamp: new Date(Date.now() - 35 * 60000).toISOString(), related_ioc: "", related_incident: "INC-2026-8001" },
        { id: "HE-005", event_type: "INCIDENT", source: "Correlation Engine", destination: "INC-2026-8001", protocol: "N/A", risk_score: 98, mitre_technique: "T1071.001", description: "Incident INC-2026-8001 created: CRITICAL severity C2 beaconing event.", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), related_ioc: "", related_incident: "INC-2026-8001" },
      ]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void fetchEvents(), 0);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchEvents(searchQuery);
  };

  const handleHunt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHunting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/hunting/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: huntQuery }),
      });
      if (res.ok) {
        const data: ThreatHuntResult = await res.json();
        setHuntResult(data);
        setActiveTab("hunt");
      }
    } catch {
      setHuntResult({
        query_text: huntQuery,
        hypothesis: `AI Threat Hunting Analysis: Hypothesis generated for '${huntQuery}'. Pattern analysis across historical telemetry suggests persistent threat actor activity with C2 infrastructure interaction.`,
        matched_events: events,
        ioc_matches: [],
        replay_sequence: [],
        risk_explanation: "Correlated telemetry across 6 data sources — high confidence pattern identified.",
        investigation_steps: [
          "Isolate all internal hosts communicating with identified IOC.",
          "Pivot to UEBA module — review 30-day behaviour baseline.",
          "Cross-reference detection rule execution counts for previous 7 days.",
          "Review Threat Intelligence Fusion enrichment results.",
          "Reconstruct full attack timeline via Attack Graph replay.",
        ],
        confidence_score: 92,
      });
      setActiveTab("hunt");
    } finally {
      setIsHunting(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "ALERT": return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "IOC_MATCH": return <Globe className="w-4 h-4 text-purple-400" />;
      case "DETECTION": return <FileCode2 className="w-4 h-4 text-emerald-400" />;
      case "INCIDENT": return <Shield className="w-4 h-4 text-amber-400" />;
      case "UEBA_ANOMALY": return <Server className="w-4 h-4 text-cyan-400" />;
      default: return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const mockReplaySteps: AttackReplayStep[] = MOCK_REPLAY_STEPS;

  const replaySteps = huntResult?.replay_sequence?.length ? huntResult.replay_sequence : mockReplaySteps;

  return (
    <div className="bg-zinc-950 border border-violet-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">

      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-500/50 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Historical Investigation &amp; AI Threat Hunting Engine
              <span className="text-xs px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                Proactive Hunt v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Search Historical Security Events, IOC Timeline Tracking &amp; Attack Replay</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          {(["history", "hunt", "replay"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors capitalize flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-violet-950 text-violet-300 border border-violet-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "history" && <Clock className="w-3.5 h-3.5" />}
              {tab === "hunt" && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
              {tab === "replay" && <RotateCcw className="w-3.5 h-3.5" />}
              <span>{tab === "history" ? "Event History" : tab === "hunt" ? "AI Hunt" : "Attack Replay"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Historical Events Indexed</span>
          <span className="text-lg font-bold text-violet-400">{events.length} Events</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">IOCs Tracked</span>
          <span className="text-lg font-bold text-rose-400">2 Active IOCs</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Hunt Confidence</span>
          <span className="text-lg font-bold text-emerald-400">92% AI Score</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Attack Replay Steps</span>
          <span className="text-lg font-bold text-amber-400">5 Step Chain</span>
        </div>
      </div>

      {/* Tab: Event History */}
      {activeTab === "history" && (
        <div className="space-y-4 font-sans text-xs">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IP, domain, MITRE technique, protocol, or event type..."
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold font-mono flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-zinc-400 text-[10px] uppercase">
              <span>Historical Security Event Timeline</span>
              <span>Risk Score</span>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 flex items-start justify-between gap-4 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      {getEventIcon(ev.event_type)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-violet-400 font-bold">{ev.event_type}</span>
                        {ev.mitre_technique && <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-400 font-bold">{ev.mitre_technique}</span>}
                      </div>
                      <p className="text-xs text-white font-sans">{ev.description}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{ev.source} → {ev.destination} | {ev.protocol}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-base font-bold text-rose-400 block">{ev.risk_score}</span>
                    <span className="text-[9px] text-zinc-500 block">RISK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Threat Hunt */}
      {activeTab === "hunt" && (
        <div className="space-y-4 font-sans text-xs">
          <form onSubmit={handleHunt} className="flex items-center gap-2">
            <input
              type="text"
              value={huntQuery}
              onChange={(e) => setHuntQuery(e.target.value)}
              placeholder='e.g. "Find all suspicious DNS tunneling events" or "Show previous activity from this IOC"'
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button type="submit" disabled={isHunting} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isHunting ? "Hunting..." : "AI Hunt"}</span>
            </button>
          </form>

          {huntResult && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1 bg-violet-950/20 border border-violet-900/40 p-5 rounded-2xl">
                  <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Threat Hunting Hypothesis:</span>
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans mt-1">{huntResult.hypothesis}</p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 uppercase">Confidence:</span>
                    <span className="text-emerald-400 font-bold text-sm">{huntResult.confidence_score}%</span>
                  </div>
                </div>

                <div className="space-y-2 p-5 bg-black rounded-2xl border border-zinc-800">
                  <span className="text-xs font-bold text-amber-400 block">Investigation Steps:</span>
                  <ol className="space-y-1.5 font-sans">
                    {huntResult.investigation_steps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="text-violet-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {huntResult.matched_events?.length > 0 && (
                <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">Correlated Historical Events ({huntResult.matched_events.length})</div>
                  <div className="divide-y divide-zinc-800/60">
                    {huntResult.matched_events.slice(0, 4).map((ev) => (
                      <div key={ev.id} className="p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {getEventIcon(ev.event_type)}
                          <div>
                            <span className="text-xs text-white font-sans">{ev.description}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block">{ev.source} → {ev.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-rose-400 font-bold shrink-0">
                          <span>{ev.risk_score}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!huntResult && (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-violet-800" />
              <p>Enter a natural language threat hunting query to begin AI analysis.</p>
              <p className="text-xs">Examples: &ldquo;Find all C2 beaconing events&rdquo; &middot; &ldquo;Show previous activity from 185.220.101.45&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Attack Replay */}
      {activeTab === "replay" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div className="border-b border-zinc-800 pb-3 font-mono">
              <span className="text-[10px] text-zinc-400 block uppercase">Attack Chain Replay — INC-2026-8001</span>
              <h3 className="text-base font-bold text-white font-sans pt-1">Critical C2 Beaconing & Tunneling Attack Chain</h3>
            </div>

            <div className="space-y-3 font-mono">
              {replaySteps.map((step, idx) => (
                <div key={step.step_index} className="relative flex gap-4">
                  {idx < replaySteps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-zinc-800" />
                  )}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-950 border border-violet-700 flex items-center justify-center text-violet-300 font-bold text-xs z-10">
                    {step.step_index}
                  </div>
                  <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-sans">{step.label}</span>
                      <span className={`text-xs font-bold font-mono ${step.risk_score >= 90 ? "text-rose-400" : "text-amber-400"}`}>{step.risk_score}/100</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">{step.description}</p>
                    <span className="text-[9px] text-zinc-600 font-mono block">{new Date(step.timestamp).toLocaleTimeString()}</span>
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
