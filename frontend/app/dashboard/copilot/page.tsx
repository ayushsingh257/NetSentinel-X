"use client";

import AICopilot from "@/components/AICopilot";
import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";

export default function CopilotPage() {
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [query, setQuery] = useState("");

  const suggestedQueries = [
    "Summarize recent critical threat alerts in the last 24 hours",
    "Inspect MITRE ATT&CK technique T1059.001 (PowerShell execution)",
    "Recommend immediate containment steps for IP 192.168.1.105",
    "Generate custom Sigma rule for DNS tunneling detection",
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>RAG AI Security Copilot Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Ask natural language threat reasoning questions across eBPF packet logs, GeoIP feeds, and MITRE techniques.
          </p>
        </div>

        <button
          onClick={() => setCopilotOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
        >
          Open Interactive Drawer
        </button>
      </div>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(q);
              setCopilotOpen(true);
            }}
            className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggested Analysis #{idx + 1}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">
              {q}
            </p>
          </button>
        ))}
      </div>

      <AICopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={query}
      />
    </div>
  );
}
