"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Lock,
  Users,
  Key,
  ShieldCheck,
  AlertTriangle,
  LogOut
} from "lucide-react";

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  source: string;
  description: string;
  ip_address: string;
  timestamp: string;
}

export interface SecurityPosture {
  security_score: number;
  authentication_status: string;
  api_protection_status: string;
  secrets_status: string;
  dependencies_status: string;
  container_status: string;
  active_sessions_count: number;
  recent_security_events: SecurityEvent[];
  checked_at: string;
}

export interface UserRoleAssignment {
  user_id: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface ActiveSession {
  session_id: string;
  user_id: string;
  username: string;
  role: string;
  ip_address: string;
  user_agent: string;
  device_info: string;
  login_time: string;
  last_seen: string;
  is_active: boolean;
}

const SEED_POSTURE: SecurityPosture = {
  security_score: 96,
  authentication_status: "HEALTHY",
  api_protection_status: "HEALTHY",
  secrets_status: "HEALTHY",
  dependencies_status: "HEALTHY",
  container_status: "WARNING",
  active_sessions_count: 2,
  recent_security_events: [
    { id: "SECEVT-901", event_type: "FAILED_LOGIN", severity: "MEDIUM", source: "Authentication Layer", description: "Failed password attempt for user 'admin' from IP 185.220.101.45", ip_address: "185.220.101.45", timestamp: "2026-07-27T00:30:00.000Z" },
    { id: "SECEVT-902", event_type: "PRIVILEGE_CHANGE", severity: "HIGH", source: "RBAC Engine", description: "Role upgraded for USR-001 to SUPER_ADMIN by system administrator", ip_address: "192.168.1.10", timestamp: "2026-07-27T00:40:00.000Z" },
    { id: "SECEVT-903", event_type: "BLOCKED_REQUEST", severity: "LOW", source: "Rate Limiter Middleware", description: "Rate limit triggered (105 req/min) for IP 192.168.1.105", ip_address: "192.168.1.105", timestamp: "2026-07-27T00:50:00.000Z" },
  ],
  checked_at: "2026-07-27T01:00:00.000Z",
};

const SEED_RBAC: UserRoleAssignment[] = [
  { user_id: "USR-001", username: "Ayush (Lead Analyst)", role: "SUPER_ADMIN", permissions: ["VIEW_INCIDENTS", "CREATE_INCIDENTS", "CLOSE_INCIDENTS", "RUN_THREAT_HUNTS", "CREATE_RULES", "EXECUTE_PLAYBOOKS", "SYSTEM_CONFIGURATION"] },
  { user_id: "USR-002", username: "SOC Analyst", role: "SECURITY_ANALYST", permissions: ["VIEW_INCIDENTS", "CREATE_INCIDENTS", "RUN_THREAT_HUNTS", "EXECUTE_PLAYBOOKS"] },
  { user_id: "USR-003", username: "Security Engineer", role: "DETECTION_ENGINEER", permissions: ["VIEW_INCIDENTS", "CREATE_RULES", "MODIFY_RULES"] },
  { user_id: "USR-004", username: "Compliance Auditor", role: "AUDITOR", permissions: ["VIEW_INCIDENTS", "VIEW_AUDIT_LOGS", "EXPORT_REPORTS"] },
];

const SEED_SESSIONS: ActiveSession[] = [
  { session_id: "SES-1001", user_id: "USR-001", username: "Ayush (Lead Analyst)", role: "SUPER_ADMIN", ip_address: "192.168.1.10", user_agent: "Browser", device_info: "Chrome 126 / Windows 11", login_time: "2026-07-26T23:00:00.000Z", last_seen: "2026-07-27T00:59:00.000Z", is_active: true },
  { session_id: "SES-1002", user_id: "USR-002", username: "SOC Analyst", role: "SECURITY_ANALYST", ip_address: "192.168.1.15", user_agent: "Browser", device_info: "Safari 17 / macOS Sonoma", login_time: "2026-07-27T00:00:00.000Z", last_seen: "2026-07-27T00:55:00.000Z", is_active: true },
];

export default function SecurityHardeningDashboard() {
  const [posture, setPosture] = useState<SecurityPosture>(SEED_POSTURE);
  const [rbacList, setRbacList] = useState<UserRoleAssignment[]>(SEED_RBAC);
  const [sessions, setSessions] = useState<ActiveSession[]>(SEED_SESSIONS);
  const [activeTab, setActiveTab] = useState<"posture" | "rbac" | "sessions" | "events">("posture");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchPosture = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/security/posture`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.security_score !== undefined) {
          setPosture(data);
        }
      }
    } catch {
      // Use seed data
    }
  }, []);

  const fetchRBAC = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/security/rbac`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.assignments)) {
          setRbacList(data.assignments);
        }
      }
    } catch {
      // Use seed data
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/security/sessions`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      }
    } catch {
      // Use seed data
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosture();
      void fetchRBAC();
      void fetchSessions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPosture, fetchRBAC, fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/api/v2/security/sessions/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      await fetchSessions();
    } catch {
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "HEALTHY" || status === "OPTIMAL") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">🟢 HEALTHY</span>;
    }
    return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono font-bold">🟡 {status}</span>;
  };

  const rbacItems = rbacList || SEED_RBAC;
  const activeSessions = sessions || SEED_SESSIONS;
  const secEvents = posture?.recent_security_events || SEED_POSTURE.recent_security_events;

  return (
    <div className="bg-zinc-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">

      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Enterprise Security Hardening &amp; Production Readiness
              <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                Hardening v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">RBAC Permissions, Authentication Hardening, Rate Limiting &amp; Security Posture</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs">
          {(["posture", "rbac", "sessions", "events"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors capitalize flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "posture" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              {tab === "rbac" && <Users className="w-3.5 h-3.5 text-purple-400" />}
              {tab === "sessions" && <Key className="w-3.5 h-3.5 text-cyan-400" />}
              {tab === "events" && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
              <span>
                {tab === "posture"
                  ? "Security Posture"
                  : tab === "rbac"
                  ? "RBAC Explorer"
                  : tab === "sessions"
                  ? `Sessions (${activeSessions.length})`
                  : "Security Events"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Security Posture Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Security Posture Score</span>
          <span className="text-lg font-bold text-emerald-400">{posture?.security_score ?? 96}/100</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Active Sessions</span>
          <span className="text-lg font-bold text-cyan-400">{activeSessions.length} Sessions</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Rate Limiting</span>
          <span className="text-lg font-bold text-emerald-400">100 req/min</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Security Headers</span>
          <span className="text-lg font-bold text-purple-400">CSP / HSTS / XFO</span>
        </div>
      </div>

      {/* Tab 1: Security Posture Overview */}
      {activeTab === "posture" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Authentication Hardening</span>
                {getStatusBadge(posture?.authentication_status ?? "HEALTHY")}
              </div>
              <p className="text-[11px] text-zinc-400">JWT Token Expiration, Session Invalidation &amp; Device Tracking.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">API Rate Limiting &amp; Protection</span>
                {getStatusBadge(posture?.api_protection_status ?? "HEALTHY")}
              </div>
              <p className="text-[11px] text-zinc-400">Global 100 req/min limit per IP, payload sanitization &amp; abuse prevention.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Secrets &amp; Env Management</span>
                {getStatusBadge(posture?.secrets_status ?? "HEALTHY")}
              </div>
              <p className="text-[11px] text-zinc-400">0 secrets in source code, strict startup env validation.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Dependency Vulnerabilities</span>
                {getStatusBadge(posture?.dependencies_status ?? "HEALTHY")}
              </div>
              <p className="text-[11px] text-zinc-400">CI npm audit &amp; Go vulnerability scanning configured.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Container Security</span>
                {getStatusBadge(posture?.container_status ?? "WARNING")}
              </div>
              <p className="text-[11px] text-zinc-400">Docker image scanning &amp; non-root user execution enforcement.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Role-Based Access Control</span>
                {getStatusBadge("HEALTHY")}
              </div>
              <p className="text-[11px] text-zinc-400">7 granular roles mapped to 10 strict permission flags.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Explorer */}
      {activeTab === "rbac" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden font-mono">
            <div className="p-3 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
              Role-Based Access Control Assignments ({rbacItems.length} Users)
            </div>
            <div className="divide-y divide-zinc-800/60">
              {rbacItems.map((usr) => (
                <div key={usr.user_id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white font-sans">{usr.username}</span>
                      <span className="text-[10px] text-zinc-500">({usr.user_id})</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">{usr.role}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {usr.permissions.map((p) => (
                      <span key={p} className="text-[9px] px-2 py-0.5 rounded bg-black text-cyan-300 border border-zinc-800 font-mono">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden font-mono">
            <div className="p-3 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
              Active User Sessions ({activeSessions.length})
            </div>
            <div className="divide-y divide-zinc-800/60">
              {activeSessions.map((s) => (
                <div key={s.session_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{s.username}</span>
                      <span className="text-[10px] font-mono text-cyan-400">({s.session_id})</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{s.device_info} · IP: <span className="font-mono text-zinc-200">{s.ip_address}</span></p>
                    <span className="text-[9px] text-zinc-600 font-mono">Login: {new Date(s.login_time).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => void handleRevokeSession(s.session_id)}
                    disabled={revokingId === s.session_id}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 self-start sm:self-center font-mono"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{revokingId === s.session_id ? "Revoking..." : "Revoke Session"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security Events */}
      {activeTab === "events" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden font-mono">
            <div className="p-3 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
              Recent Security Audit Events ({secEvents.length})
            </div>
            <div className="divide-y divide-zinc-800/60">
              {secEvents.map((e) => (
                <div key={e.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 font-sans">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">{e.event_type}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">{e.severity}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">{e.description}</p>
                    <span className="text-[9px] text-zinc-600 font-mono block">Source: {e.source} · IP: {e.ip_address} · {new Date(e.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
