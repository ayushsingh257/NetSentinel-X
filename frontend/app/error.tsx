"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("NetSentinel-X Error Captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-400 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <AlertOctagon className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">500</h1>
      <h2 className="text-xl font-bold text-amber-400 mb-4">System Telemetry Exception</h2>
      <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-8">
        An unhandled execution exception occurred in the frontend telemetry renderer. The system has automatically isolated the state.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        >
          <RefreshCw className="w-4 h-4" /> Retry Telemetry
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-all"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
