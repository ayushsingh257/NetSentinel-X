"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-red-400 mb-4">Security Target Not Found</h2>
      <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-8">
        The requested endpoint or resource does not exist within the NetSentinel-X security perimeter.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-all"
        >
          <Home className="w-4 h-4" /> Home Page
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        >
          <ArrowLeft className="w-4 h-4" /> SOC Dashboard
        </Link>
      </div>
    </div>
  );
}
