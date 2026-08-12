"use client";

import { useState } from "react";
import { useResilientWebSocket } from "@/hooks/useResilientWebSocket";

export default function TrafficDashboard() {
  const [filter, setFilter] = useState("ALL");
  const { status, messages, reconnectCount, reconnect } = useResilientWebSocket();

  const getStatusBadge = () => {
    switch (status) {
      case "CONNECTED":
        return (
          <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CONNECTED (Live Ingress)
          </span>
        );
      case "RECONNECTING":
        return (
          <span className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            RECONNECTING (Attempt {reconnectCount})
          </span>
        );
      case "CONNECTING":
        return (
          <span className="px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 flex items-center gap-1.5">
            CONNECTING...
          </span>
        );
      case "DISCONNECTED":
      default:
        return (
          <button
            onClick={reconnect}
            className="px-3 py-1 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full border border-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            DISCONNECTED (Click to Reconnect)
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Live Traffic Monitor &amp; Packet Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time deep packet inspection feed broadcast via resilient WebSocket gateway.
          </p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "ALL"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          ALL PROTOCOLS
        </button>

        <button
          onClick={() => setFilter("TCP")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "TCP"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          TCP FLOWS
        </button>

        <button
          onClick={() => setFilter("UDP")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "UDP"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          UDP FLOWS
        </button>
      </div>

      <div className="bg-zinc-950/90 rounded-2xl p-4 h-[75vh] overflow-y-auto border border-zinc-800 shadow-2xl font-mono text-xs space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
            <span className="animate-spin text-2xl">📡</span>
            <p>Listening for live network packet telemetry...</p>
          </div>
        ) : (
          messages
            .filter((message) => {
              if (filter === "ALL") return true;
              return message.includes(`PROTOCOL: ${filter}`);
            })
            .map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border border-zinc-900 bg-zinc-900/50 ${
                  message.includes("TCP")
                    ? "text-cyan-400"
                    : message.includes("UDP")
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {message.includes("TCP") && (
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold mr-2 border border-cyan-500/20">
                    TCP
                  </span>
                )}

                {message.includes("UDP") && (
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold mr-2 border border-amber-500/20">
                    UDP
                  </span>
                )}

                {!message.includes("TCP") && !message.includes("UDP") && (
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold mr-2 border border-emerald-500/20">
                    OTHER
                  </span>
                )}

                {message}
              </div>
            ))
        )}
      </div>
    </div>
  );
}