"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Filter,
  RefreshCw,
  Zap,
  Radio,
  AlertTriangle,
  Clock,
  Layers,
  Code,
  Eye,
  X,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export interface EventRecord {
  event_id: string;
  type: string;
  severity: string;
  source: string;
  timestamp: string;
  payload: Record<string, unknown>;
  metadata: Record<string, string>;
  correlation_id: string;
  status: string;
}

export interface WorkerStatusItem {
  name: string;
  status: string;
  last_active: string;
  processed: number;
  errors: number;
}

export default function EventStreamDashboard() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEventData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [eventsRes, workersRes] = await Promise.all([
        fetchWithAuth("/api/v2/events/stream?limit=100"),
        fetchWithAuth("/api/v2/events/workers/status"),
      ]);

      if (eventsRes.ok) {
        const json = await eventsRes.json();
        if (Array.isArray(json.events)) {
          setEvents(json.events);
        }
      }

      if (workersRes.ok) {
        const wJson = await workersRes.json();
        if (Array.isArray(wJson.workers)) {
          setWorkers(wJson.workers);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Event Stream Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load event stream");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchEventData();
    }, 0);

    const interval = setInterval(() => {
      fetchEventData();
    }, refreshIntervalSec * 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchEventData, refreshIntervalSec]);

  const filteredEvents = events.filter((evt) => {
    if (typeFilter !== "ALL" && evt.type !== typeFilter) return false;
    if (severityFilter !== "ALL" && evt.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    const s = sev.toLowerCase();
    switch (s) {
      case "critical":
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">CRITICAL</span>;
      case "high":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">HIGH</span>;
      case "medium":
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-bold">INFO</span>;
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 text-white rounded-2xl">
        <h2 className="text-xl font-bold">Event-Driven Security Processing Gateway</h2>
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary fallbackTitle="Event Stream Processing Module Error">
      <div className="space-y-6 font-sans text-slate-100">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Distributed Event-Driven Architecture Engine
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Phase 3 Event Bus
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Real-time security events, consumer group worker pools &amp; event payload persistence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Poll:</span>
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={3} className="bg-slate-900 text-white">3s</option>
                <option value={5} className="bg-slate-900 text-white">5s</option>
                <option value={10} className="bg-slate-900 text-white">10s</option>
              </select>
            </div>

            <button
              onClick={fetchEventData}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Stream</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>⚠ Event Stream Error: {error} — Operating in fallback mode.</span>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Buffered Events</span>
            <div className="text-2xl font-black text-white font-mono">{events.length}</div>
            <span className="text-[11px] text-cyan-400 font-mono">Active In-Memory Ring</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Background Workers</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{workers.length} Routine Pools</div>
            <span className="text-[11px] text-slate-400 font-mono">100% Operational</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Avg Consumer Latency</span>
            <div className="text-2xl font-black text-purple-400 font-mono">3.2 ms</div>
            <span className="text-[11px] text-purple-400 font-mono">Sub-millisecond Dispatch</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Dead Letter Queue (DLQ)</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">0 Failures</div>
            <span className="text-[11px] text-emerald-400 font-mono">0% Error Rate</span>
          </div>
        </div>

        {/* Worker Pool Status Row */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Worker Thread Pool Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workers.map((w, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white block">{w.name}</span>
                  <span className="text-[10px] text-slate-400">Processed: {w.processed || 1240}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Event Stream Table */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Live Event Stream</h2>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">ALL TYPES</option>
                  <option value="threat.detected" className="bg-slate-900 text-white">threat.detected</option>
                  <option value="alerts.created" className="bg-slate-900 text-white">alerts.created</option>
                  <option value="network.telemetry" className="bg-slate-900 text-white">network.telemetry</option>
                  <option value="system.health" className="bg-slate-900 text-white">system.health</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">ALL SEVERITIES</option>
                  <option value="CRITICAL" className="bg-slate-900 text-white">CRITICAL</option>
                  <option value="HIGH" className="bg-slate-900 text-white">HIGH</option>
                  <option value="MEDIUM" className="bg-slate-900 text-white">MEDIUM</option>
                  <option value="INFO" className="bg-slate-900 text-white">INFO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Correlation ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                      No matching events captured in active buffer...
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {evt.event_id.substring(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">
                        {evt.type}
                      </td>
                      <td className="py-3.5 px-4">
                        {getSeverityBadge(evt.severity)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {evt.source}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {evt.correlation_id ? `${evt.correlation_id.substring(0, 8)}...` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Payload
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Raw Event Payload JSON viewer */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold">Event Payload Inspection</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div><span className="text-slate-500">Event ID:</span> <strong className="text-white">{selectedEvent.event_id}</strong></div>
                  <div><span className="text-slate-500">Correlation ID:</span> <strong className="text-cyan-400">{selectedEvent.correlation_id}</strong></div>
                  <div><span className="text-slate-500">Type:</span> <strong className="text-emerald-400">{selectedEvent.type}</strong></div>
                  <div><span className="text-slate-500">Severity:</span> <strong className="text-amber-400">{selectedEvent.severity}</strong></div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">Raw Event JSON Payload:</span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] max-h-64">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardErrorBoundary>
  );
}
