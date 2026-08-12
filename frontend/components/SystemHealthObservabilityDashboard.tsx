"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export interface ServiceHealthItem {
  name: string;
  status: "HEALTHY" | "WARNING" | "DEGRADED" | "DOWN";
  uptime: number;
  latency_ms: number;
  last_check: string;
  error_count: number;
  version: string;
}

export interface SystemHealthData {
  cpu_usage_percent: number;
  memory_usage_mb: number;
  memory_usage_percent: number;
  database_status: string;
  db_connection_pool_active: number;
  redis_status: string;
  websocket_connected_clients: number;
  event_processing_rate_cps: number;
  threat_engine_status: string;
  threat_engine_latency_ms: number;
  service_uptime_seconds: number;
  system_version: string;
  services: ServiceHealthItem[];
  checked_at: string;
}

export default function SystemHealthObservabilityDashboard() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(5);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSystemHealth = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchWithAuth("/api/v2/system/health");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch system health`);
      }
      const json: SystemHealthData = await response.json();
      setData(json);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("System Health Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load telemetry");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchSystemHealth();
      }
    }, 0);

    const interval = setInterval(() => {
      fetchSystemHealth();
    }, refreshIntervalSec * 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchSystemHealth, refreshIntervalSec]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-white rounded-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">System Health &amp; Infrastructure Telemetry</h2>
        </div>
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary fallbackTitle="System Health Observability Module Error">
      <div className="space-y-6 font-sans text-slate-100">
        
        {/* Header bar with refresh controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Enterprise Platform Observability
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time infrastructure health, CPU/RAM telemetry, DB connections &amp; threat engine performance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interval:</span>
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-900 text-white">5s</option>
                <option value={10} className="bg-slate-900 text-white">10s</option>
                <option value={30} className="bg-slate-900 text-white">30s</option>
              </select>
            </div>

            <button
              onClick={fetchSystemHealth}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>⚠ Telemetry Error: {error} — Serving latest cached status.</span>
          </div>
        )}

        {/* Core Infrastructure KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CPU Usage Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> Host CPU Usage
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                NORMAL
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">
                {data?.cpu_usage_percent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">Multi-core Load</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(data?.cpu_usage_percent || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Memory Usage Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" /> RAM Allocation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                OPTIMAL
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">
                {data?.memory_usage_mb.toFixed(1)} <span className="text-sm font-normal text-slate-400">MB</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">{data?.memory_usage_percent.toFixed(1)}% Heap</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                style={{ width: `${Math.min(data?.memory_usage_percent || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Ingestion Rate Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Ingestion Rate
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                LIVE DPI
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">
                {data?.event_processing_rate_cps.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-400">CPS</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Packets/Sec</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Streaming continuous packet capture
            </div>
          </div>

          {/* WebSocket & DB Pool Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400" /> WS &amp; DB Connections
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="space-x-1">
                <span className="text-3xl font-black text-white font-mono">
                  {data?.websocket_connected_clients}
                </span>
                <span className="text-xs text-purple-400 font-bold">WS Clients</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-200 font-mono">
                  {data?.db_connection_pool_active}
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">DB Conns</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span>Threat Engine Latency:</span>
              <span className="text-emerald-400 font-bold">{data?.threat_engine_latency_ms} ms</span>
            </div>
          </div>

        </div>

        {/* Service Matrix Table */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Subsystem Operational Health</h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Uptime: <strong className="text-emerald-400">{formatUptime(data?.service_uptime_seconds || 0)}</strong></span>
              <span>•</span>
              <span>Version: <strong className="text-white">{data?.system_version}</strong></span>
              <span>•</span>
              <span>Last Check: <strong className="text-slate-300">{lastRefreshed.toLocaleTimeString()}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Subsystem Component</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uptime SLA</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Error Count</th>
                  <th className="py-3 px-4">Engine Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.services || []).map((service, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <span>{service.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {service.status === "HEALTHY" ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> HEALTHY
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {service.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {service.uptime.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {service.latency_ms} ms
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {service.error_count}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {service.version}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database & Storage Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">PostgreSQL Enterprise Storage</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block uppercase">Database Status</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data?.database_status}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block uppercase">Active Connection Pool</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {data?.db_connection_pool_active} / 50 Max
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Redis In-Memory Cache &amp; Event Bus</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block uppercase">Redis Engine Status</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data?.redis_status}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block uppercase">Active WebSocket Subscribers</span>
                <span className="text-purple-400 font-bold text-sm">
                  {data?.websocket_connected_clients} Dashboard Clients
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardErrorBoundary>
  );
}
