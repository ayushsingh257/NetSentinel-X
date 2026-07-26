"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import { motion } from "motion/react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to convert any CSS color to rgba
export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    return fallback;
  }
};

export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

export const Icons = {
  logo: ({ className }: { className?: string }) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6 text-cyan-400", className)}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  soc2: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-xs font-mono text-cyan-300", className)}>
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
      SOC 2 Type II
    </div>
  ),
  iso27001: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300", className)}>
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      ISO 27001
    </div>
  ),
  hipaa: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/60 text-xs font-mono text-blue-300", className)}>
      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
      HIPAA Compliant
    </div>
  ),
};

interface FlickeringFooterProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
}

export function FlickeringFooter({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(34, 211, 238)",
  maxOpacity = 0.2,
}: FlickeringFooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const parsedColor = useMemo(() => getRGBA(color), [color]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInView) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor(canvas.width / (squareSize + gridGap));
    const rows = Math.floor(canvas.height / (squareSize + gridGap));
    const opacities = new Float32Array(cols * rows);

    for (let i = 0; i < opacities.length; i++) {
      opacities[i] = Math.random() * maxOpacity;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = row * cols + col;
          if (Math.random() < flickerChance) {
            opacities[idx] = Math.random() * maxOpacity;
          }
          ctx.fillStyle = colorWithOpacity(parsedColor, opacities[idx]);
          ctx.fillRect(
            col * (squareSize + gridGap),
            row * (squareSize + gridGap),
            squareSize,
            squareSize
          );
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, squareSize, gridGap, flickerChance, parsedColor, maxOpacity]);

  return (
    <footer ref={containerRef} className="relative w-full overflow-hidden bg-zinc-950 border-t border-cyan-900/40 text-zinc-300">
      {/* Background canvas flicker */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Icons.logo />
              <span className="text-xl font-bold tracking-tight text-white">
                NetSentinel<span className="text-cyan-400">-X</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                v2.0 Enterprise
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Next-generation Enterprise AI Security Operations Platform. Powered by Deep Packet Inspection, Real-time Telemetry, MITRE ATT&CK Mapping, and Autonomous AI Copilots.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Icons.soc2 />
              <Icons.iso27001 />
              <Icons.hipaa />
            </div>
          </div>

          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">SOC Dashboard <ChevronRightIcon className="w-3.5 h-3.5 text-cyan-500" /></Link></li>
              <li><Link href="#copilot" className="hover:text-cyan-400 transition-colors">AI Security Copilot</Link></li>
              <li><Link href="#mitre" className="hover:text-cyan-400 transition-colors">MITRE ATT&CK Radar</Link></li>
              <li><Link href="#detection-studio" className="hover:text-cyan-400 transition-colors">Detection Studio</Link></li>
              <li><Link href="#threat-intel" className="hover:text-cyan-400 transition-colors">Threat Intel Fusion</Link></li>
            </ul>
          </div>

          {/* Column 2: Architecture & Engines */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><span className="text-zinc-300 font-mono text-xs">eBPF Packet Monitor</span></li>
              <li><span className="text-zinc-300 font-mono text-xs">DPI Engine (Go)</span></li>
              <li><span className="text-zinc-300 font-mono text-xs">UEBA Anomaly Scoring</span></li>
              <li><span className="text-zinc-300 font-mono text-xs">WebSocket Realtime Feed</span></li>
              <li><span className="text-zinc-300 font-mono text-xs">Automated Playbooks</span></li>
            </ul>
          </div>

          {/* Column 3: Status & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">System Status</h4>
            <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-300">
                <span>DPI Engine</span>
                <span className="text-emerald-400 font-mono">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>AI Reasoning</span>
                <span className="text-cyan-400 font-mono">READY</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Threat Stream</span>
                <span className="text-emerald-400 font-mono">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} NetSentinel-X Enterprise AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Security Disclosure</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
