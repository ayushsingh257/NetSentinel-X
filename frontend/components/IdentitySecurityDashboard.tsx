"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Laptop,
  AlertTriangle,
  FileText,
  Smartphone,
  Lock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSession {
  session_id: string;
  username: string;
  role: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  created_at: string;
  risk_score: number;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPICIOUS";
}

interface AuthEvent {
  id: string;
  event_type: string;
  username: string;
  ip: string;
  device: string;
  location: string;
  risk_score: number;
  timestamp: string;
  details: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SESSIONS: UserSession[] = [
  { session_id: "SESS-1001", username: "Ayush", role: "SUPER_ADMIN", device: "Windows 11 PC", browser: "Chrome 126", ip_address: "103.21.124.50", location: "New Delhi, India", created_at: "10 mins ago", risk_score: 10, status: "ACTIVE" },
  { session_id: "SESS-1002", username: "Sarah_SOC", role: "SOC_ADMIN", device: "MacBook Pro M3", browser: "Safari 17", ip_address: "49.207.180.12", location: "Mumbai, India", created_at: "25 mins ago", risk_score: 15, status: "ACTIVE" },
  { session_id: "SESS-1003", username: "Analyst_Bob", role: "SECURITY_ANALYST", device: "Linux Workstation", browser: "Firefox 125", ip_address: "185.220.101.5", location: "Frankfurt, Germany", created_at: "1 hour ago", risk_score: 85, status: "SUSPICIOUS" },
  { session_id: "SESS-1004", username: "Dev_User", role: "VIEW_ONLY", device: "Android Phone", browser: "Chrome Mobile", ip_address: "198.51.100.20", location: "Bengaluru, India", created_at: "3 hours ago", risk_score: 20, status: "REVOKED" },
];

const MOCK_EVENTS: AuthEvent[] = [
  { id: "AUTHEVT-1001", event_type: "LOGIN_SUCCESS", username: "Ayush", ip: "103.21.124.50", device: "Windows 11 PC", location: "New Delhi, India", risk_score: 10, timestamp: "10 mins ago", details: "Successful password & TOTP MFA login" },
  { id: "AUTHEVT-1002", event_type: "TOKEN_REFRESH", username: "Sarah_SOC", ip: "49.207.180.12", device: "MacBook Pro M3", location: "Mumbai, India", risk_score: 15, timestamp: "25 mins ago", details: "15-min access token renewed via rotating refresh token" },
  { id: "AUTHEVT-1003", event_type: "SUSPICIOUS_LOGIN", username: "Analyst_Bob", ip: "185.220.101.5", device: "Linux Workstation", location: "Frankfurt, Germany", risk_score: 85, timestamp: "1 hour ago", details: "Impossible travel detected from India to Germany (Velocity: 1400 km/h). Login BLOCKED." },
  { id: "AUTHEVT-1004", event_type: "MFA_FAILURE", username: "Dev_User", ip: "198.51.100.20", device: "Android Phone", location: "Bengaluru, India", risk_score: 45, timestamp: "3 hours ago", details: "Invalid 6-digit TOTP passcode attempt" },
  { id: "AUTHEVT-1005", event_type: "SESSION_REVOKED", username: "Analyst_Bob", ip: "103.21.124.50", device: "Windows PC", location: "New Delhi, India", risk_score: 90, timestamp: "4 hours ago", details: "Admin terminated session SESS-1003 due to suspicious activity" },
];

const TABS = [
  { id: "posture", label: "Identity Posture", icon: <UserCheck className="w-4 h-4" /> },
  { id: "sessions", label: "Active Sessions", icon: <Laptop className="w-4 h-4" /> },
  { id: "mfa", label: "MFA Management", icon: <Smartphone className="w-4 h-4" /> },
  { id: "risk", label: "Login Risk Monitor", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "events", label: "Authentication Events", icon: <FileText className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IdentitySecurityDashboard() {
  const [activeTab, setActiveTab] = useState("posture");
  const [sessions, setSessions] = useState<UserSession[]>(MOCK_SESSIONS);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => (s.session_id === sessionId ? { ...s, status: "REVOKED" } : s))
    );
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "SUSPICIOUS":
        return "px-2 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "REVOKED":
      case "EXPIRED":
        return "px-2 py-0.5 text-xs font-bold rounded bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "px-2 py-0.5 text-xs font-bold rounded bg-slate-500/10 text-slate-400";
    }
  };

  const eventBadge = (type: string) => {
    switch (type) {
      case "LOGIN_SUCCESS":
      case "MFA_SUCCESS":
      case "TOKEN_REFRESH":
        return "px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "SUSPICIOUS_LOGIN":
      case "MFA_FAILURE":
      case "SESSION_REVOKED":
        return "px-2 py-0.5 text-xs font-bold rounded bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "px-2 py-0.5 text-xs font-bold rounded bg-blue-500/10 text-blue-400";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Secure Session &amp; Advanced Identity
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 24 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              15-Min JWT Tokens, 30-Day Refresh Rotation, TOTP MFA &amp; Impossible Travel Risk Blocking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Identity Security Score:</span>
          <span className="text-lg font-mono">98/100</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Identity Posture */}
      {activeTab === "posture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">MFA Coverage</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">100% Privileged</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">TOTP Enforced</p>
              </div>
              <Smartphone className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Access Token TTL</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">15 Minutes</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Short-Lived Window</p>
              </div>
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Refresh Token</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">30 Days</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Single-Use Rotating</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Active Sessions</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">12 Sessions</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Device Fingerprinted</p>
              </div>
              <Laptop className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Identity Security Controls</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">15-Minute Short-Lived Access Tokens</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">JWT access token lifetime reduced from 24h to 15m, minimizing stolen token blast radius.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Single-Use Refresh Token Rotation &amp; Reuse Detection</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Refresh tokens rotated on every exchange. Immediate global session revocation on token reuse attack.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Privileged Role Multi-Factor Authentication (TOTP)</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Strict Google / Microsoft Authenticator TOTP required for SUPER_ADMIN and SOC_ADMIN roles.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Active Sessions */}
      {activeTab === "sessions" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Platform Active User Sessions</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Real-Time Revocation Engine</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Device / Browser</th>
                  <th className="p-3">IP / Location</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {sessions.map(s => (
                  <tr key={s.session_id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100 font-mono">{s.username}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono">{s.role}</span></td>
                    <td className="p-3 font-mono">{s.device} ({s.browser})</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{s.ip_address} - {s.location}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-zinc-100">{s.risk_score}/100</td>
                    <td className="p-3"><span className={statusBadge(s.status)}>{s.status}</span></td>
                    <td className="p-3">
                      {s.status === "ACTIVE" || s.status === "SUSPICIOUS" ? (
                        <button
                          onClick={() => handleRevokeSession(s.session_id)}
                          className="px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Terminated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: MFA Management */}
      {activeTab === "mfa" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Privileged Accounts Multi-Factor Authentication Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">SUPER_ADMIN</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">MFA ENABLED</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Google / Microsoft Authenticator TOTP active. 8 Recovery Codes generated.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">SOC_ADMIN</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">MFA ENABLED</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Mandatory TOTP enforced. Verified 10 minutes ago.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">SECURITY_ANALYST</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded">MFA ENABLED</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Strict TOTP verification required for SOC investigation actions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Login Risk Monitor */}
      {activeTab === "risk" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Adaptive Login Risk &amp; Impossible Travel Detections</h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border-l-4 border-l-red-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-500">IMPOSSIBLE TRAVEL DETECTED</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/10 text-red-500 rounded">BLOCKED (Risk 85/100)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  User Analyst_Bob logged in from <strong>India (10:00 PM)</strong> and <strong>Frankfurt, Germany (10:05 PM)</strong>. Velocity calculation exceeds 1400 km/h.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border-l-4 border-l-amber-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-500">UNRECOGNIZED NEW DEVICE</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-500 rounded">STEP_UP_MFA (Risk 45/100)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  User Dev_User attempted login from unrecognized Android device in Bengaluru. Triggered mandatory TOTP step-up verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Authentication Events */}
      {activeTab === "events" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Identity Security Audit Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">IP / Location</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {MOCK_EVENTS.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100 font-mono">{evt.username}</td>
                    <td className="p-3"><span className={eventBadge(evt.event_type)}>{evt.event_type}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{evt.ip} ({evt.location})</td>
                    <td className="p-3 font-mono">{evt.device}</td>
                    <td className="p-3 font-mono font-bold">{evt.risk_score}</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{evt.timestamp}</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400 text-[11px] truncate max-w-xs">{evt.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
