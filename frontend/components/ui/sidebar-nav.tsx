"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  Activity,
  Bot,
  Flame,
  Cpu,
  Terminal,
  Globe2,
  Brain,
  Zap,
  Workflow,
  ShieldAlert,
  Search,
  FileBarChart,
  Server,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import AnimatedThemeToggler from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCopilot?: () => void;
  onOpenSimulator?: () => void;
}

export function SidebarNav({
  collapsed,
  onToggleCollapse,
  onOpenCopilot,
  onOpenSimulator,
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState("analyst");
  const [username, setUsername] = useState("Security Analyst");

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "analyst";
    const storedToken = localStorage.getItem("token") || "";
    setRole(storedRole);
    if (storedToken.includes("admin")) {
      setUsername("SOC Admin");
    } else if (storedToken.includes("analyst")) {
      setUsername("Tier-2 Analyst");
    } else {
      setUsername("Security Operator");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const navGroups = [
    {
      label: "Core Operations",
      items: [
        { href: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
        { href: "/dashboard/monitoring", label: "Live Telemetry", icon: Activity },
        { href: "/dashboard/copilot", label: "AI Copilot Desk", icon: Bot },
        { href: "/dashboard/incidents", label: "Incident Management", icon: ShieldAlert },
      ],
    },
    {
      label: "Threat Defense",
      items: [
        { href: "/dashboard/investigation", label: "Attack Investigation", icon: Flame },
        { href: "/dashboard/mitre", label: "MITRE ATT&CK", icon: Cpu },
        { href: "/dashboard/threat-intel", label: "Threat Intel Fusion", icon: Globe2 },
      ],
    },
    {
      label: "Detection & Analytics",
      items: [
        { href: "/dashboard/detection-studio", label: "Detection Studio", icon: Terminal },
        { href: "/dashboard/ueba", label: "UEBA Analytics", icon: Brain },
        { href: "/dashboard/optimizer", label: "AI Detection Optimizer", icon: Zap },
      ],
    },
    {
      label: "Automation & Hunting",
      items: [
        { href: "/dashboard/soar", label: "SOAR Playbooks", icon: Workflow },
        { href: "/dashboard/threat-hunting", label: "Threat Hunting", icon: Search },
      ],
    },
    {
      label: "Governance & Security",
      items: [
        { href: "/dashboard/executive-reporting", label: "Executive Reports", icon: FileBarChart },
        { href: "/dashboard/observability", label: "System Health", icon: Server },
        { href: "/dashboard/security-hardening", label: "Security Hardening", icon: KeyRound },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-all duration-300 z-30 font-sans select-none shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                NetSentinel<span className="text-emerald-600 dark:text-emerald-400">-X</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono">v2.0</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">SOC Operations</span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/40"
                      : "text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400 dark:text-zinc-400")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Action Triggers */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>RAG AI Copilot</span>
              </div>
              <ExternalLink className="w-3 h-3 text-purple-500" />
            </button>
          )}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all font-mono"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Attack Simulator</span>
              </div>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </button>
          )}
        </div>
      )}

      {/* Footer Profile & Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs shrink-0">
            {role.substring(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{username}</span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase">{role}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!collapsed && <AnimatedThemeToggler sound={false} />}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
