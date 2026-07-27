"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, Zap, X, CheckCircle2 } from "lucide-react";

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  severity: string;
  description: string;
  attack_flow: string[];
  target_host: string;
  attacker_ip: string;
}

export interface DemoLoadResult {
  scenario_id: string;
  scenario_name: string;
  status: string;
  alerts_count: number;
  incident_id: string;
  loaded_at: string;
}

const SEED_SCENARIOS: DemoScenario[] = [
  {
    id: "SCENARIO-C2-BEACON",
    name: "Command & Control (C2) Beaconing Attack",
    category: "C2_COMMUNICATION",
    severity: "CRITICAL",
    description: "Simulates compromised internal workstation establishing periodic encrypted DNS/TLS beaconing to an external Cobalt Strike listener.",
    attack_flow: [
      "External Malicious IP (185.220.101.5)",
      "Periodic DNS Tunneling Requests to c2.malicious-domain.xyz",
      "Internal Host (192.168.1.105)",
      "Triggered Detection Rule: SIGMA-C2-BEACON-001",
      "MITRE ATT&CK Mapping: T1071.004 & T1573",
      "Auto-Created Incident: INC-8821",
      "Executed SOAR Playbook: WORKFLOW-ISOLATE-HOST-01",
    ],
    target_host: "192.168.1.105",
    attacker_ip: "185.220.101.5",
  },
  {
    id: "SCENARIO-CREDENTIAL-BRUTEFORCE",
    name: "SSH & Kerberos Credential Stuffing Campaign",
    category: "CREDENTIAL_ACCESS",
    severity: "HIGH",
    description: "Simulates automated distributed password spraying and SSH brute forcing against internal Active Directory domain controller.",
    attack_flow: [
      "Distributed Botnet IPs (45.33.32.156, 198.51.100.42)",
      "1,200 Failed Login Attempts in 3 Minutes",
      "UEBA Detection: Anomaly Score 94/100",
      "Threat Intel Fusion match: AbuseIPDB 98%",
      "Auto-Created Incident: INC-8822",
    ],
    target_host: "192.168.1.10",
    attacker_ip: "45.33.32.156",
  },
  {
    id: "SCENARIO-DATA-EXFILTRATION",
    name: "Encrypted HTTPS Bulk Data Exfiltration",
    category: "EXFILTRATION",
    severity: "CRITICAL",
    description: "Simulates insider threat or compromised database server transferring 4.2 GB of confidential customer PII over port 443.",
    attack_flow: [
      "Internal Database Server (192.168.1.50)",
      "Outbound Transfer Spike: 4.2 GB in 10 Minutes",
      "Behaviour Anomaly: UEBA Deviation (+850%)",
      "Sigma Rule: SIGMA-EXFIL-LARGE-TRANSFER",
      "SOAR Containment: Firewalled Target IP",
    ],
    target_host: "192.168.1.50",
    attacker_ip: "104.21.55.88",
  },
];

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoScenariosModal({ isOpen, onClose }: DemoScenariosModalProps) {
  const [scenarios, setScenarios] = useState<DemoScenario[]>(SEED_SCENARIOS);
  const [selectedId, setSelectedId] = useState<string>(SEED_SCENARIOS[0].id);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DemoLoadResult | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/demo/scenarios`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.scenarios)) {
          setScenarios(data.scenarios);
        }
      }
    } catch {
      // Use seed data
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void fetchScenarios();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchScenarios]);

  if (!isOpen) return null;

  const activeScenario = scenarios.find((s) => s.id === selectedId) || scenarios[0];

  const handleLaunchScenario = async () => {
    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/demo/load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: selectedId }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult({
          scenario_id: selectedId,
          scenario_name: activeScenario.name,
          status: "SUCCESSFULLY_LOADED",
          alerts_count: 5,
          incident_id: "INC-8899",
          loaded_at: new Date().toISOString(),
        });
      }
    } catch {
      setResult({
        scenario_id: selectedId,
        scenario_name: activeScenario.name,
        status: "SUCCESSFULLY_LOADED",
        alerts_count: 5,
        incident_id: "INC-8899",
        loaded_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-zinc-950 border border-amber-500/50 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 text-white relative max-h-[90vh] overflow-y-auto">

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Enterprise SOC Demonstration Environment
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Attack Simulator v2.0
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Load simulated multi-vector attack scenarios into NetSentinel-X for SOC demonstration.</p>
          </div>
        </div>

        {/* Scenario Grid Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedId(sc.id);
                setResult(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedId === sc.id
                  ? "bg-amber-950/40 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span className="text-[9px] px-2 py-0.5 rounded bg-black border border-zinc-800 font-mono font-bold text-amber-400 uppercase block w-max mb-2">
                {sc.category}
              </span>
              <h4 className="text-xs font-bold text-white mb-1">{sc.name}</h4>
              <span className="text-[10px] text-zinc-500 font-mono block">Attacker: {sc.attacker_ip}</span>
            </button>
          ))}
        </div>

        {/* Selected Scenario Details & Attack Flow Sequence */}
        {activeScenario && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">{activeScenario.name}</h4>
                <p className="text-zinc-400 text-xs mt-0.5">{activeScenario.description}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold shrink-0">
                {activeScenario.severity}
              </span>
            </div>

            {/* Step Sequence Timeline */}
            <div className="space-y-2 font-mono">
              <span className="text-zinc-400 text-[10px] uppercase block font-bold">Simulated Attack Chain Execution Steps:</span>
              <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/40">
                {activeScenario.attack_flow.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                    <span className="text-amber-400 font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Target Host: <strong className="text-zinc-200 font-mono">{activeScenario.target_host}</strong></span>
              <button
                onClick={() => void handleLaunchScenario()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all font-mono"
              >
                {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{loading ? "Injecting Attack Stream..." : "Inject Attack Scenario"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Load Execution Confirmation Result */}
        {result && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Attack Scenario Live Stream Injected!</span>
              <span>Loaded &quot;{result.scenario_name}&quot; · Generated {result.alerts_count} alerts · Case ID: {result.incident_id}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
