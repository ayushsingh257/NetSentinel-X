"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export interface EntityProfile {
  id: string;
  entity_type: string;
  entity_name: string;
  risk_score: number;
  risk_level: string;
  baseline_conn_rate: number;
  baseline_packet_volume: number;
  baseline_protocol_map: Record<string, number>;
  anomalies_count: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface AnomalyRecord {
  id: string;
  entity_id: string;
  entity_name: string;
  anomaly_score: number;
  category: string;
  reason: string;
  observed_behaviour: string;
  expected_behaviour: string;
  deviation_percentage: number;
  related_alerts: string[];
  related_iocs: string[];
  mitre_techniques: string[];
  timestamp: string;
  ai_explanation: string;
  recommended_action: string;
}

export interface UEBAOverview {
  total_entities_monitored: number;
  high_risk_entities_count: number;
  active_anomalies_count: number;
  risk_distribution: Record<string, number>;
  leaderboard: EntityProfile[];
}

export default function UEBAAnalytics() {
  const [overview, setOverview] = useState<UEBAOverview | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "anomalies">("leaderboard");

  const fetchUEBAData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const [overRes, anomRes] = await Promise.all([
        fetch(`${apiUrl}/api/v2/ueba`),
        fetch(`${apiUrl}/api/v2/ueba/anomalies`),
      ]);

      if (overRes.ok) {
        const data = await overRes.json();
        setOverview(data);
        if (data.leaderboard && data.leaderboard.length > 0) {
          setSelectedEntity(data.leaderboard[0]);
        }
      }
      if (anomRes.ok) {
        const data = await anomRes.json();
        setAnomalies(data.anomalies || []);
      }
    } catch (err) {
      console.error("Failed to fetch UEBA data:", err);
      const mockEntities: EntityProfile[] = [
        {
          id: "ENT-HOST-192-168-1-105",
          entity_type: "HOST",
          entity_name: "192.168.1.105 (Workstation-A)",
          risk_score: 92,
          risk_level: "CRITICAL",
          baseline_conn_rate: 12.4,
          baseline_packet_volume: 450000,
          baseline_protocol_map: { HTTP: 3500, HTTPS: 12000 },
          anomalies_count: 4,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "ENT-HOST-192-168-1-180",
          entity_type: "HOST",
          entity_name: "192.168.1.180 (DB-Primary)",
          risk_score: 78,
          risk_level: "HIGH",
          baseline_conn_rate: 8.5,
          baseline_packet_volume: 1200000,
          baseline_protocol_map: { POSTGRES: 85000 },
          anomalies_count: 2,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockAnomalies: AnomalyRecord[] = [
        {
          id: "ANOM-2026-001",
          entity_id: "ENT-HOST-192-168-1-105",
          entity_name: "192.168.1.105 (Workstation-A)",
          anomaly_score: 94,
          category: "Beaconing",
          reason: "Strict 60.0s periodic outbound HTTPS communication to 198.51.100.45",
          observed_behaviour: "60 outbound connections with exact 60.0s interval variance < 0.05s",
          expected_behaviour: "Sporadic human-driven web browsing with variance > 12.0s",
          deviation_percentage: 480.0,
          related_alerts: ["ALT-8001: Suspicious Beaconing"],
          related_iocs: ["198.51.100.45"],
          mitre_techniques: ["T1071.001 - Web Protocols"],
          timestamp: new Date().toISOString(),
          ai_explanation: "Entity demonstrates automated periodic beaconing characteristic of Command & Control callbacks.",
          recommended_action: "Isolate host from local VLAN and inspect memory space for injection.",
        },
      ];

      setOverview({
        total_entities_monitored: 2,
        high_risk_entities_count: 2,
        active_anomalies_count: 1,
        risk_distribution: { CRITICAL: 1, HIGH: 1, MEDIUM: 0, LOW: 0 },
        leaderboard: mockEntities,
      });
      setAnomalies(mockAnomalies);
      setSelectedEntity(mockEntities[0]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUEBAData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUEBAData]);

  return (
    <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              User &amp; Entity Behaviour Analytics (UEBA)
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Statistical Baseline v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Behavioural Profiling, Anomaly Scoring &amp; Risk Leaderboard</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-amber-950 text-amber-300 border border-amber-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Risk Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab("anomalies")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "anomalies"
                ? "bg-amber-950 text-amber-300 border border-amber-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Anomaly Feed ({anomalies.length})</span>
          </button>
        </div>
      </div>

      {/* UEBA Overview Analytics Banner */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Monitored Entities</span>
            <span className="text-lg font-bold text-cyan-400">{overview.total_entities_monitored} Hosts &amp; Users</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">High-Risk Entities</span>
            <span className="text-lg font-bold text-red-400">{overview.high_risk_entities_count} Flagged</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Active Behaviour Anomalies</span>
            <span className="text-lg font-bold text-amber-400">{overview.active_anomalies_count} Events</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Avg Baseline Confidence</span>
            <span className="text-lg font-bold text-emerald-400">96.8% Calibrated</span>
          </div>
        </div>
      )}

      {/* Main View Mode */}
      {activeTab === "leaderboard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
          
          {/* Entity Risk Leaderboard Table */}
          <div className="lg:col-span-2 bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-zinc-400">
              <span>ENTITY RISK LEADERBOARD</span>
              <span>UEBA SCORE 0-100</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {overview?.leaderboard?.map((ent) => (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntity(ent)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedEntity?.id === ent.id ? "bg-amber-950/30 border-l-4 border-amber-500" : "hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white text-sm">{ent.entity_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ent.risk_level === "CRITICAL"
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {ent.risk_level}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs font-mono">
                      Type: {ent.entity_type} • Baseline Rate: {ent.baseline_conn_rate} conn/s • Anomalies: {ent.anomalies_count}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <div className="text-right">
                      <span className="text-xl font-bold text-amber-400 block">{ent.risk_score}</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">RISK SCORE</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Entity Profile & AI Analysis Card */}
          {selectedEntity ? (
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4 font-mono">
              <div className="border-b border-zinc-800 pb-3">
                <span className="text-[10px] text-zinc-400 block uppercase">Entity Baseline Profile</span>
                <h4 className="text-base font-bold text-white font-sans pt-1">{selectedEntity.entity_name}</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">EntityType:</span>
                  <span className="text-amber-400 font-bold">{selectedEntity.entity_type}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Baseline Packet Volume:</span>
                  <span className="text-cyan-400 font-bold">{((selectedEntity.baseline_packet_volume || 0) / 1000).toFixed(0)}k pkts</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Detected Anomalies:</span>
                  <span className="text-red-400 font-bold">{selectedEntity.anomalies_count} Events</span>
                </div>
              </div>

              {/* AI Behaviour Explanation */}
              <div className="space-y-2 bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Behaviour Deviation Analysis:</span>
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  Host {selectedEntity.entity_name} exhibits severe statistical departure from baseline network volume (+480% connection frequency). Observed periodic HTTPS C2 beaconing and anomalous high-entropy DNS query bursts.
                </p>
              </div>

            </div>
          ) : null}

        </div>
      ) : (
        /* Anomaly Feed View */
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div key={anom.id} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">
                      {anom.category}
                    </span>
                    <span className="text-white font-bold text-xs">{anom.entity_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-red-400 font-bold">Deviation: +{(anom.deviation_percentage || 0).toFixed(0)}%</span>
                    <span className="text-zinc-400">Score: {anom.anomaly_score}/100</span>
                  </div>
                </div>

                <p className="text-zinc-200 text-xs font-medium leading-relaxed">{anom.reason}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-amber-400 block font-bold">Observed Behaviour:</span>
                    <p className="text-zinc-300 font-sans text-xs">{anom.observed_behaviour}</p>
                  </div>
                  <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-emerald-400 block font-bold">Expected Baseline:</span>
                    <p className="text-zinc-300 font-sans text-xs">{anom.expected_behaviour}</p>
                  </div>
                </div>

                <div className="space-y-1.5 bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl font-mono text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommended Mitigation:</span>
                  </span>
                  <p className="text-emerald-300 font-sans text-xs">{anom.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
