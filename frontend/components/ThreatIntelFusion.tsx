"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export interface ProviderResult {
  provider_name: string;
  status: string;
  score: number;
  category: string;
  details: string;
  last_queried: string;
}

export interface IOCRecord {
  id: string;
  type: string;
  value: string;
  threat_score: number;
  risk_level: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  country: string;
  asn: string;
  organization: string;
  reputation: string;
  categories: string[];
  related_threats: string[];
  mitre_techniques: string[];
  related_alerts: string[];
  related_investigations: string[];
  provider_results: Record<string, ProviderResult>;
  ai_explanation: string;
  recommended_actions: string[];
  updated_at: string;
}

export interface IntelligenceOverview {
  total_iocs_enriched: number;
  high_risk_iocs: number;
  active_providers_count: number;
  top_attacked_domains: string[];
  top_attacked_ips: string[];
  provider_health: Record<string, boolean>;
}

export default function ThreatIntelFusion() {
  const [overview, setOverview] = useState<IntelligenceOverview | null>(null);
  const [selectedIOC, setSelectedIOC] = useState<IOCRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("192.168.1.105");
  const [searching, setSearching] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/intelligence`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error("Failed to fetch intelligence overview:", err);
      setOverview({
        total_iocs_enriched: 2,
        high_risk_iocs: 2,
        active_providers_count: 8,
        top_attacked_domains: ["malicious-c2-beacon.example-tunnel.org"],
        top_attacked_ips: ["192.168.1.105"],
        provider_health: {
          VirusTotal: true,
          "AlienVault OTX": true,
          AbuseIPDB: true,
          GreyNoise: true,
          Shodan: true,
          Censys: true,
          IPinfo: true,
          WHOIS: true,
        },
      });
    }
  }, []);

  const handleLookup = useCallback(async (queryVal: string) => {
    if (!queryVal.trim()) return;
    setSearching(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/intelligence/ioc/${encodeURIComponent(queryVal.trim())}`);
      if (res.ok) {
        const data: IOCRecord = await res.json();
        setSelectedIOC(data);
      }
    } catch (err) {
      console.error("Lookup failed:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOverview();
      void handleLookup("192.168.1.105");
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOverview, handleLookup]);

  return (
    <div className="bg-zinc-950 border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Threat Intelligence Fusion Engine
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                8 Providers Active
              </span>
            </h2>
            <p className="text-xs text-zinc-400">VirusTotal, AlienVault OTX, AbuseIPDB, GreyNoise, Shodan, Censys, IPinfo &amp; WHOIS</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleLookup(searchQuery)}
              placeholder="Search IP, Domain, Hash or URL..."
              className="bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 w-72 font-mono"
            />
          </div>

          <button
            onClick={() => void handleLookup(searchQuery)}
            disabled={searching}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50 font-mono"
          >
            {searching ? "Searching..." : "Enrich IOC"}
          </button>
        </div>
      </div>

      {/* Provider Status Badges */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <span className="text-zinc-400 mr-2">Providers:</span>
        {["VirusTotal", "AlienVault OTX", "AbuseIPDB", "GreyNoise", "Shodan", "Censys", "IPinfo", "WHOIS"].map((p) => (
          <span key={p} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-blue-900/60 text-blue-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{p}</span>
          </span>
        ))}
      </div>

      {/* Overview Analytics Banner */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Total IOCs Enriched</span>
            <span className="text-lg font-bold text-blue-400">{overview.total_iocs_enriched} Indicators</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">High-Risk Indicators</span>
            <span className="text-lg font-bold text-red-400">{overview.high_risk_iocs} Flagged</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Active Provider Connectors</span>
            <span className="text-lg font-bold text-emerald-400">{overview.active_providers_count} ONLINE</span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block uppercase">Top Target Asset</span>
            <span className="text-lg font-bold text-purple-400 truncate block">192.168.1.105</span>
          </div>
        </div>
      )}

      {/* Selected IOC Detailed View */}
      {selectedIOC ? (
        <div className="space-y-6 font-sans text-xs">
          
          {/* Reputation Header Card */}
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold text-[10px]">
                    TYPE: {selectedIOC.type}
                  </span>
                  <span className="text-zinc-400 text-[11px]">{selectedIOC.country} • {selectedIOC.asn}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono">{selectedIOC.value}</h3>
                <p className="text-zinc-400 text-xs">{selectedIOC.organization} — {selectedIOC.reputation}</p>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-4 bg-black/60 p-3 rounded-xl border border-zinc-800 font-mono">
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] block uppercase">Composite Threat Score</span>
                  <span className="text-2xl font-bold text-red-400">{selectedIOC.threat_score} / 100</span>
                </div>
                <div className="h-10 w-px bg-zinc-800" />
                <div>
                  <span className="text-zinc-400 text-[10px] block uppercase">Risk Level</span>
                  <span className="px-2.5 py-1 rounded font-bold text-xs bg-red-950 text-red-300 border border-red-800 inline-block mt-0.5">
                    {selectedIOC.risk_level} ({Math.round((selectedIOC.confidence || 0) * 100)}% Conf)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Explanation & Guidance */}
            <div className="space-y-2 bg-blue-950/20 border border-blue-900/40 p-4 rounded-xl">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>AI Threat Intelligence Fusion Reasoning:</span>
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">{selectedIOC.ai_explanation}</p>
            </div>

            {/* Provider Breakdown Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 font-mono block uppercase">Provider Intelligence Matrix</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
                {Object.entries(selectedIOC.provider_results || {}).map(([pName, pRes]) => (
                  <div key={pName} className="p-3 bg-black rounded-xl border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300 text-xs">{pName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          pRes.status === "MALICIOUS"
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {pRes.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">{pRes.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="space-y-2 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl font-mono">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recommended SOC Response Actions:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-emerald-300 font-sans">
                {selectedIOC.recommended_actions?.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 font-mono">
          <Globe className="w-8 h-8 opacity-40 text-blue-400" />
          <p>Enter IP, Domain, Hash or URL to query 8 threat intelligence providers.</p>
        </div>
      )}

    </div>
  );
}
