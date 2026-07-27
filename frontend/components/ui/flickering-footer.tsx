"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function FlickeringFooter() {
  return (
    <footer className="w-full bg-slate-950 dark:bg-black border-t border-slate-800 dark:border-zinc-900 text-slate-400 dark:text-zinc-400 font-sans text-xs py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Copyright */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500 dark:text-orange-500" />
          <span className="font-bold text-slate-200 dark:text-white">NetSentinel-X</span>
          <span className="text-slate-500">•</span>
          <span>© {new Date().getFullYear()} NetSentinel-X Enterprise v2.0</span>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap items-center gap-6 text-slate-400 hover:text-slate-200 transition-colors">
          <Link href="/dashboard" className="hover:text-blue-400 dark:hover:text-orange-400">
            Platform
          </Link>
          <Link href="/#capabilities" className="hover:text-blue-400 dark:hover:text-orange-400">
            Solutions
          </Link>
          <Link href="/#workflows" className="hover:text-blue-400 dark:hover:text-orange-400">
            Documentation
          </Link>
          <Link href="/dashboard/observability" className="hover:text-blue-400 dark:hover:text-orange-400">
            API &amp; Health
          </Link>
          <a
            href="https://github.com/ayushsingh257/NetSentinel-X"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 dark:hover:text-orange-400"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default FlickeringFooter;
