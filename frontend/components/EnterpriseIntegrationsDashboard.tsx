"use client";

import React, { useState } from "react";
import {
  Share2,
  Send,
  CheckCircle2,
  Plus,
  Play,
  Activity,
  Layers,
  Sliders,
  Server,
} from "lucide-react";

interface Target {
  id: string;
  name: string;
  category: "SIEM" | "SOAR" | "ITSM" | "WEBHOOK";
  provider: string;
  targetUrl: string;
  status: "ENABLED" | "DISABLED";
  reliability: string;
}

const TARGETS: Target[] = [
  {
    id: "INT-SIEM-SPLUNK",
    name: "Enterprise Splunk HEC Collector",
    category: "SIEM",
    provider: "SPLUNK",
    targetUrl: "https://splunk-hec.netsentinel.io:8088/services/collector/event",
    status: "ENABLED",
    reliability: "99.99%",
  },
  {
    id: "INT-SOAR-XSOAR",
    name: "Palo Alto Cortex XSOAR Incident Desk",
    category: "SOAR",
    provider: "PALO_ALTO_XSOAR",
    targetUrl: "https://xsoar.enterprise-sec.org/api/v1/incidents",
    status: "ENABLED",
    reliability: "99.98%",
  },
  {
    id: "INT-ITSM-SERVICENOW",
    name: "ServiceNow IT Service Management Gateway",
    category: "ITSM",
    provider: "SERVICENOW",
    targetUrl: "https://servicenow.netsentinel.io/api/now/table/incident",
    status: "ENABLED",
    reliability: "99.95%",
  },
  {
    id: "INT-WEBHOOK-SLACK",
    name: "SOC Incident Notification Webhook Gateway",
    category: "WEBHOOK",
    provider: "CUSTOM_WEBHOOK",
    targetUrl: "https://hooks.slack.com/services/T00/B00/X00",
    status: "ENABLED",
    reliability: "100.0%",
  },
];

export default function EnterpriseIntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState<"targets" | "pipelines" | "test" | "metrics">("targets");
  const [targets] = useState<Target[]>(TARGETS);
  const [selectedTarget, setSelectedTarget] = useState("INT-SIEM-SPLUNK");
  const [testResult, setTestResult] = useState<{ success: boolean; code: number; latency: string } | null>(null);

  const handleTestIntegration = () => {
    setTestResult({
      success: true,
      code: 200,
      latency: "14.2ms",
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Share2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Enterprise Ecosystem Integrations Subsystem
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Era 36 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              SIEM (Splunk, Elastic, QRadar), SOAR (XSOAR), ITSM (ServiceNow, Jira), Webhooks &amp; Log Export Pipelines (CEF, Syslog, JSON)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-bold text-sm border border-blue-500/20">
          <Send className="w-4 h-4" />
          <span>Delivery Success Rate: 99.98%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("targets")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "targets"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Server className="w-4 h-4" /> Integration Targets ({targets.length})
        </button>
        <button
          onClick={() => setActiveTab("pipelines")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "pipelines"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sliders className="w-4 h-4" /> Log Export Pipelines
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "test"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Play className="w-4 h-4" /> Integration Testing Suite
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "metrics"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Activity className="w-4 h-4" /> Delivery Metrics &amp; Health
        </button>
      </div>

      {/* TAB 1: Targets */}
      {activeTab === "targets" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Connected Enterprise Integration Endpoints</h2>
            <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Integration Target
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Target Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Target Endpoint</th>
                  <th className="p-3">Reliability</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {targets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{t.name}</td>
                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{t.provider}</td>
                    <td className="p-3 font-mono text-xs text-slate-500 truncate max-w-xs">{t.targetUrl}</td>
                    <td className="p-3 font-mono text-emerald-500 font-bold">{t.reliability}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Export Pipelines */}
      {activeTab === "pipelines" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" /> Log Export Pipelines &amp; Formats
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Common Event Format (CEF) Syslog Pipeline</span>
                <p className="text-xs font-mono text-slate-500 mt-0.5">syslog://siem-collector.internal:514 (Format: CEF, Compression: Enabled)</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                Active Stream
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Streaming JSON Audit Pipeline</span>
                <p className="text-xs font-mono text-slate-500 mt-0.5">https://kafka-gateway.internal:9092/topics/audit-stream (Format: JSON, Compression: Enabled)</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                Active Stream
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Integration Testing */}
      {activeTab === "test" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-500" /> Dispatch Test Event
          </h2>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Select Integration Target</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            <button
              onClick={handleTestIntegration}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Send Test Event Payload
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Delivery Verified (HTTP {testResult.code})
                </span>
                <span className="font-mono text-slate-500">{testResult.latency}</span>
              </div>
              <p className="text-slate-700 dark:text-zinc-300 font-semibold">
                Test payload successfully received by endpoint {selectedTarget}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Delivery Metrics */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Integration Endpoints</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">4 Targets</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">24h Exported Events</span>
            <h3 className="text-2xl font-black text-blue-500 mt-1">1,284,000 Events</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Delivery Success Rate</span>
            <h3 className="text-2xl font-black text-emerald-500 mt-1">99.98%</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-500 uppercase">P95 Delivery Latency</span>
            <h3 className="text-2xl font-black text-purple-500 mt-1">18.5 ms</h3>
          </div>
        </div>
      )}
    </div>
  );
}
