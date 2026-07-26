"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitFork,
  ArrowRight,
  Sparkles,
  Server,
  Globe,
  Shield,
  FileCode2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export interface AttackNode {
  id: string;
  type: string;
  label: string;
  ip?: string;
  hostname?: string;
  domain?: string;
  asset?: string;
  threat_score: number;
  risk_level: string;
  mitre_techniques?: string[];
  related_incidents?: string[];
}

export interface AttackEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence: number;
  timestamp: string;
}

export interface AttackPath {
  id: string;
  path_name: string;
  node_ids: string[];
  edge_ids: string[];
  severity: string;
  path_risk_score: number;
  ai_explanation: string;
  root_cause: string;
  attacker_objective: string;
  affected_assets: string[];
  recommended_containment: string;
}

export interface AttackGraphPayload {
  nodes: AttackNode[];
  edges: AttackEdge[];
  critical_paths: AttackPath[];
  total_nodes: number;
  total_edges: number;
  global_max_risk_score: number;
}

export default function AttackGraph() {
  const [graphData, setGraphData] = useState<AttackGraphPayload | null>(null);
  const [selectedNode, setSelectedNode] = useState<AttackNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<AttackPath | null>(null);
  const [activeTab, setActiveTab] = useState<"topology" | "paths">("topology");

  const fetchGraphData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/attack-graph`);

      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
        if (data.critical_paths && data.critical_paths.length > 0) {
          setSelectedPath(data.critical_paths[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch attack graph data:", err);
      const mockNodes: AttackNode[] = [
        { id: "NODE-EXT-IP-01", type: "EXTERNAL_IP", label: "185.220.101.45 (C2 Host)", ip: "185.220.101.45", threat_score: 96, risk_level: "CRITICAL" },
        { id: "NODE-DOM-01", type: "DOMAIN", label: "c2-command.malicious.net", domain: "c2-command.malicious.net", threat_score: 92, risk_level: "CRITICAL" },
        { id: "NODE-HOST-01", type: "INTERNAL_HOST", label: "192.168.1.105 (Workstation-A)", ip: "192.168.1.105", hostname: "Workstation-A", asset: "Finance VLAN-10", threat_score: 90, risk_level: "CRITICAL" },
        { id: "NODE-RULE-01", type: "DETECTION_RULE", label: "RULE-SIGMA-001 (DNS Tunneling)", threat_score: 85, risk_level: "HIGH" },
        { id: "NODE-INC-01", type: "INCIDENT", label: "INC-2026-8001 (C2 Event)", threat_score: 98, risk_level: "CRITICAL" },
      ];

      const mockEdges: AttackEdge[] = [
        { id: "EDGE-01", source: "NODE-EXT-IP-01", target: "NODE-DOM-01", relationship: "Connected To", confidence: 0.98, timestamp: new Date().toISOString() },
        { id: "EDGE-02", source: "NODE-DOM-01", target: "NODE-HOST-01", relationship: "Communicated With", confidence: 0.95, timestamp: new Date().toISOString() },
        { id: "EDGE-03", source: "NODE-HOST-01", target: "NODE-RULE-01", relationship: "Triggered", confidence: 0.92, timestamp: new Date().toISOString() },
        { id: "EDGE-04", source: "NODE-RULE-01", target: "NODE-INC-01", relationship: "Caused", confidence: 0.99, timestamp: new Date().toISOString() },
      ];

      const mockPath: AttackPath = {
        id: "PATH-2026-001",
        path_name: "Critical C2 Beaconing & Tunneling Attack Chain",
        node_ids: ["NODE-EXT-IP-01", "NODE-DOM-01", "NODE-HOST-01", "NODE-RULE-01", "NODE-INC-01"],
        edge_ids: ["EDGE-01", "EDGE-02", "EDGE-03", "EDGE-04"],
        severity: "CRITICAL",
        path_risk_score: 96,
        ai_explanation: "Attack originated from malicious IP 185.220.101.45 via c2-command.malicious.net targeting internal Host 192.168.1.105 (Workstation-A).",
        root_cause: "Compromised browser extension initiating periodic outbound HTTPS C2 callbacks.",
        attacker_objective: "Establish persistent C2 channel for staging internal data exfiltration.",
        affected_assets: ["192.168.1.105 (Workstation-A)", "Finance VLAN-10"],
        recommended_containment: "Isolate Workstation-A from local VLAN and block IP 185.220.101.45.",
      };

      setGraphData({
        nodes: mockNodes,
        edges: mockEdges,
        critical_paths: [mockPath],
        total_nodes: 5,
        total_edges: 4,
        global_max_risk_score: 96,
      });
      setSelectedNode(mockNodes[0]);
      setSelectedPath(mockPath);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchGraphData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGraphData]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "EXTERNAL_IP":
        return <Globe className="w-5 h-5 text-red-400" />;
      case "INTERNAL_HOST":
        return <Server className="w-5 h-5 text-cyan-400" />;
      case "DOMAIN":
        return <Globe className="w-5 h-5 text-purple-400" />;
      case "DETECTION_RULE":
        return <FileCode2 className="w-5 h-5 text-emerald-400" />;
      case "INCIDENT":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <Shield className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Interactive Attack Graph &amp; Threat Path Engine
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Visual Graph Correlator v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Visual Topology Canvas, Threat Path Analysis &amp; Attack Chain Reasoning</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab("topology")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "topology"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Topology Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab("paths")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "paths"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Attack Paths ({graphData?.critical_paths?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Graph Overview Analytics Banner */}
      {graphData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Correlated Graph Nodes</span>
            <span className="text-lg font-bold text-cyan-400">{graphData.total_nodes} Entities</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Threat Relationships</span>
            <span className="text-lg font-bold text-violet-400">{graphData.total_edges} Edges</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Max Path Risk Score</span>
            <span className="text-lg font-bold text-rose-400">{graphData.global_max_risk_score} / 100 CRITICAL</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Identified Attack Chains</span>
            <span className="text-lg font-bold text-amber-400">{graphData.critical_paths?.length || 0} Chains</span>
          </div>
        </div>
      )}

      {/* Main Tab View */}
      {activeTab === "topology" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
          
          {/* Topology Canvas Stream */}
          <div className="lg:col-span-2 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-lg">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between font-mono text-zinc-400">
              <span>VISUAL GRAPH TOPOLOGY CANVAS</span>
              <span>CLICK NODE TO INSPECT</span>
            </div>

            {/* Interactive Attack Nodes Visual Stream */}
            <div className="space-y-3 font-mono">
              {graphData?.nodes?.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedNode?.id === node.id
                      ? "bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "bg-black border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {getNodeIcon(node.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{node.label}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            node.risk_level === "CRITICAL"
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {node.risk_level}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">Type: {node.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <div className="text-right">
                      <span className="text-base font-bold text-rose-400 block">{node.threat_score}</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">THREAT SCORE</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Details Drawer */}
          {selectedNode ? (
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4 font-mono">
              <div className="border-b border-zinc-800 pb-3">
                <span className="text-[10px] text-zinc-400 block uppercase">Graph Node Inspector</span>
                <h4 className="text-base font-bold text-white font-sans pt-1">{selectedNode.label}</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Node Type:</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.type}</span>
                </div>
                {selectedNode.ip && (
                  <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                    <span className="text-zinc-400">IP Address:</span>
                    <span className="text-white font-bold">{selectedNode.ip}</span>
                  </div>
                )}
                {selectedNode.asset && (
                  <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                    <span className="text-zinc-400">Asset Subnet:</span>
                    <span className="text-amber-400 font-bold">{selectedNode.asset}</span>
                  </div>
                )}
                <div className="flex justify-between p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Threat Score:</span>
                  <span className="text-rose-400 font-bold">{selectedNode.threat_score} / 100</span>
                </div>
              </div>

              <div className="space-y-2 bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Graph Node Reasoning:</span>
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  Entity {selectedNode.label} is actively correlated within critical attack path PATH-2026-001. Directly linked to automated C2 beaconing alerts and MITRE technique T1071.001.
                </p>
              </div>
            </div>
          ) : null}

        </div>
      ) : (
        /* Critical Attack Paths View */
        selectedPath && (
          <div className="space-y-6 font-sans text-xs">
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3 font-mono">
                <div>
                  <span className="text-xs text-rose-400 font-bold block">{selectedPath.id} — {selectedPath.severity} RISK</span>
                  <h3 className="text-lg font-bold text-white font-sans">{selectedPath.path_name}</h3>
                </div>
                <span className="text-rose-400 font-bold text-lg font-mono">Risk Score: {selectedPath.path_risk_score}/100</span>
              </div>

              {/* Step-by-Step Attack Flow Sequence */}
              <div className="space-y-3 font-mono">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Step-by-Step Attack Sequence</h4>
                <div className="flex flex-wrap items-center gap-2 p-4 bg-black rounded-xl border border-zinc-800 text-xs">
                  {selectedPath.node_ids?.map((nodeId, idx) => (
                    <React.Fragment key={nodeId}>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-cyan-300 font-bold">
                        {nodeId}
                      </span>
                      {idx < selectedPath.node_ids.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* AI Attack Path Reasoning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-black rounded-xl border border-zinc-800 space-y-2">
                  <span className="text-rose-400 font-bold block">Root Cause Analysis:</span>
                  <p className="text-zinc-300 font-sans text-xs">{selectedPath.root_cause}</p>
                </div>
                <div className="p-4 bg-black rounded-xl border border-zinc-800 space-y-2">
                  <span className="text-amber-400 font-bold block">Likely Attacker Objective:</span>
                  <p className="text-zinc-300 font-sans text-xs">{selectedPath.attacker_objective}</p>
                </div>
              </div>

              <div className="space-y-1.5 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl font-mono text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Recommended Attack Path Containment:</span>
                </span>
                <p className="text-emerald-300 font-sans text-xs">{selectedPath.recommended_containment}</p>
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
}
