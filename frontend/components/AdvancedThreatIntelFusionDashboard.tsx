"use client";

import React, { useState } from "react";
import {
  Globe,
  Radio,
  Search,
  Activity,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  Database,
} from "lucide-react";

interface Feed {
  id: string;
  name: string;
  provider: "MISP" | "ALIENVAULT_OTX" | "CUSTOM_STIX";
  itemCount: number;
  reliability: string;
  status: "ACTIVE" | "SYNCING";
}

const FEEDS: Feed[] = [
  {
    id: "FEED-MISP-01",
    name: "MISP Cyber Threat Exchange",
    provider: "MISP",
    itemCount: 14500,
    reliability: "98%",
    status: "ACTIVE",
  },
  {
    id: "FEED-OTX-02",
    name: "AlienVault OTX Pulse Stream",
    provider: "ALIENVAULT_OTX",
    itemCount: 28900,
    reliability: "95%",
    status: "ACTIVE",
  },
  {
    id: "FEED-CUSTOM-03",
    name: "STIX/TAXII Custom Enterprise Feed",
    provider: "CUSTOM_STIX",
    itemCount: 5200,
    reliability: "99%",
    status: "ACTIVE",
  },
];

export default function AdvancedThreatIntelFusionDashboard() {
  const [activeTab, setActiveTab] = useState<"feeds" | "iocs" | "enrich" | "health">("feeds");
  const [feeds, setFeeds] = useState<Feed[]>(FEEDS);
  const [enrichInput, setEnrichInput] = useState("185.220.101.5");
  const [enrichResult, setEnrichResult] = useState<{
    value: string;
    reputation: string;
    score: number;
    geo: string;
    asn: string;
  } | null>(null);

  const handleSyncFeed = (id: string) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, itemCount: f.itemCount + 120 } : f))
    );
  };

  const handleEnrich = () => {
    setEnrichResult({
      value: enrichInput,
      reputation: enrichInput.includes("185.220") ? "MALICIOUS" : "SUSPICIOUS",
      score: enrichInput.includes("185.220") ? 95 : 75,
      geo: "DE (Germany)",
      asn: "AS24940 (Hetzner Online GmbH)",
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Threat Intelligence Fusion Subsystem
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                Era 35 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              External Threat Feed Aggregation (MISP, AlienVault OTX, STIX/TAXII), IOC Normalization &amp; Automated Enrichment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl font-bold text-sm border border-purple-500/20">
          <Globe className="w-4 h-4" />
          <span>Active Feeds: 3 | Ingested: 48,600 IOCs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("feeds")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "feeds"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Database className="w-4 h-4" /> Intel Feeds ({feeds.length})
        </button>
        <button
          onClick={() => setActiveTab("iocs")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "iocs"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="w-4 h-4" /> Normalized IOC Explorer
        </button>
        <button
          onClick={() => setActiveTab("enrich")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "enrich"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Zap className="w-4 h-4" /> On-Demand IOC Enrichment
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "health"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Activity className="w-4 h-4" /> Feed Health &amp; Metrics
        </button>
      </div>

      {/* TAB 1: Intel Feeds */}
      {activeTab === "feeds" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Configured External Threat Feeds</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Feed Name</th>
                  <th className="p-3">Provider Standard</th>
                  <th className="p-3">IOC Item Count</th>
                  <th className="p-3">Reliability Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {feeds.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{f.name}</td>
                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500">
                        {f.provider}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{f.itemCount.toLocaleString()} IOCs</td>
                    <td className="p-3 font-mono text-emerald-500 font-bold">{f.reliability}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSyncFeed(f.id)}
                        className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Sync Feed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Normalized IOCs */}
      {activeTab === "iocs" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Normalized Indicators of Compromise</h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-red-500 text-sm">185.220.101.5 (IP)</span>
                <p className="text-xs text-slate-500 mt-0.5">Attributed to APT29 (Cozy Bear) · Source: MISP Cyber Threat Exchange</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                Threat Score: 95/100
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-red-500 text-sm">malicious-update-server.org (DOMAIN)</span>
                <p className="text-xs text-slate-500 mt-0.5">Attributed to Lazarus Group · Source: AlienVault OTX Pulse Stream</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                Threat Score: 92/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: On-Demand Enrichment */}
      {activeTab === "enrich" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-500" /> Query Indicator Enrichment
            </h2>
            <input
              type="text"
              value={enrichInput}
              onChange={(e) => setEnrichInput(e.target.value)}
              placeholder="Enter IP, Domain, or File Hash"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
            />
            <button
              onClick={handleEnrich}
              className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" /> Enrich Indicator Context
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enrichment Results</h2>
            {enrichResult ? (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{enrichResult.value}</span>
                  <span className="px-2.5 py-0.5 font-bold bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                    {enrichResult.reputation} ({enrichResult.score}/100)
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400">GeoLocation: {enrichResult.geo} | ASN: {enrichResult.asn}</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl text-xs text-slate-400 text-center">
                Submit an indicator to view threat intelligence reputation and context.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Health Metrics */}
      {activeTab === "health" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Threat Feeds</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">3 Feeds</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">24h Ingested IOCs</span>
            <h3 className="text-2xl font-black text-purple-500 mt-1">48,600 Items</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Sync Duration</span>
            <h3 className="text-2xl font-black text-emerald-500 mt-1">340.5 ms</h3>
          </div>
        </div>
      )}
    </div>
  );
}
