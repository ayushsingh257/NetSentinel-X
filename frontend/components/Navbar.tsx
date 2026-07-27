"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Activity, Bot, Cpu, Menu, X, BarChart3, LogIn, UserPlus } from "lucide-react";
import AnimatedThemeToggler from "@/components/ui/animated-theme-toggler";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-zinc-900 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500 transition-all">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 font-sans">
              NetSentinel<span className="text-emerald-600 dark:text-emerald-400">-X</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-mono">v2.0</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans tracking-wide hidden sm:block">
              Enterprise Network Detection &amp; AI SOC Platform
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700 dark:text-zinc-300 font-sans">
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>SOC Dashboard</span>
          </Link>
          <Link href="/#copilot" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <Bot className="w-4 h-4 text-emerald-500" />
            <span>AI Copilot</span>
          </Link>
          <Link href="/#capabilities" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>Capabilities</span>
          </Link>
          <Link href="/#workflows" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>SOC Workflows</span>
          </Link>
        </div>

        {/* Right CTA Actions & Animated Theme Toggler */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Animated Theme Toggler */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <AnimatedThemeToggler />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-6 py-4 space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Toggle Theme:</span>
            <AnimatedThemeToggler />
          </div>

          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold py-2"
          >
            <BarChart3 className="w-4 h-4" /> SOC Dashboard
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-2"
          >
            <LogIn className="w-4 h-4 text-emerald-500" /> Sign In
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold py-2"
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </Link>
        </div>
      )}
    </nav>
  );
}