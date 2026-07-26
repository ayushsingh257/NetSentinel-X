"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Activity, Bot, Cpu, FileText, Menu, X, BarChart3 } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full border-b border-cyan-900/60 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              NetSentinel<span className="text-cyan-400 font-extrabold">-X</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 font-mono">v2.0</span>
            </h1>
            <p className="text-xs text-zinc-400 tracking-wide hidden sm:block">
              Enterprise AI Security Operations Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>SOC Dashboard</span>
          </Link>
          <Link href="/#copilot" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Copilot</span>
          </Link>
          <Link href="/#architecture" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Architecture</span>
          </Link>
          <Link href="/#mitre" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>MITRE Radar</span>
          </Link>
          <Link href="/#docs" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Docs</span>
          </Link>
        </div>

        {/* Live Status Badge & Action CTA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)] px-3.5 py-1.5 rounded-xl">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wider">
              DPI ENGINE ACTIVE
            </span>
          </div>

          <Link
            href="/dashboard"
            className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-95"
          >
            Launch SOC Dashboard
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-4 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-cyan-400 font-semibold py-2"
          >
            <BarChart3 className="w-4 h-4" /> SOC Dashboard
          </Link>
          <Link
            href="/#copilot"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-cyan-400 py-2"
          >
            <Bot className="w-4 h-4" /> AI Copilot
          </Link>
          <Link
            href="/#architecture"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-cyan-400 py-2"
          >
            <Cpu className="w-4 h-4" /> Architecture
          </Link>
          <Link
            href="/#mitre"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-cyan-400 py-2"
          >
            <Activity className="w-4 h-4" /> MITRE ATT&CK Radar
          </Link>
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold text-white bg-cyan-600 rounded-xl"
            >
              Launch SOC Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}