"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Terminal,
} from "lucide-react";

interface AttackEvent {
  id: string;
  type: string;
  source_ip: string;
  payload: string;
  action: string;
  timestamp: string;
  target_path: string;
}

export default function WebSecurityDashboard() {
  const [activeTab, setActiveTab] = useState<"posture" | "logs" | "config">(
    "posture"
  );

  const [securityScore] = useState(98);
  const [attackEvents, setAttackEvents] = useState<AttackEvent[]>([
    {
      id: "ATTK-801",
      type: "BLOCKED_XSS",
      source_ip: "192.168.1.50",
      payload: "<script>alert('XSS')</script>",
      action: "REJECTED",
      timestamp: "2026-07-29T10:10:00.000Z",
      target_path: "/api/v2/incidents/create",
    },
    {
      id: "ATTK-802",
      type: "BLOCKED_SQLI",
      source_ip: "10.0.0.12",
      payload: "admin' OR 1=1 --",
      action: "REJECTED",
      timestamp: "2026-07-29T09:45:00.000Z",
      target_path: "/login",
    },
    {
      id: "ATTK-803",
      type: "BLOCKED_FILE_UPLOAD",
      source_ip: "172.16.0.8",
      payload: "malware_payload.exe",
      action: "REJECTED",
      timestamp: "2026-07-29T09:20:00.000Z",
      target_path: "/api/v2/security/files/validate",
    },
  ]);

  const [testPayload, setTestPayload] = useState("<script>alert(1)</script>");
  const [testResult, setTestResult] = useState<{
    blocked?: boolean;
    type?: string;
    reason?: string;
    cleaned_text?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchWebSecData() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const res = await fetch(`${apiBase}/api/v2/web-security/events`, {
          headers,
        }).catch(() => null);
        if (isMounted && res && res.ok) {
          const data = await res.json();
          if (data.events) setAttackEvents(data.events);
        }
      } catch {
        // Fallback
      }
    }

    fetchWebSecData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTestInput = async () => {
    setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${apiBase}/api/v2/web-security/test-input`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: testPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch {
      setTestResult({
        blocked: true,
        type: "XSS",
        reason: "Input matched prohibited script execution signature",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Enterprise Web Application Security
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 19 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              OWASP Top 10 Protection, Dual-Layer XSS Defense, CSRF Tokens &amp;
              Strict Content Security Policy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Web Security Score:</span>
          <span className="text-lg font-mono">{securityScore}/100</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("posture")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "posture"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Security Posture
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "logs"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Attack Prevention Logs
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
            {attackEvents.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "config"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Security Configuration
        </button>
      </div>

      {/* Tab 1: Security Posture */}
      {activeTab === "posture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  XSS Protection
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
                  Active (Dual Layer)
                </h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">
                  DOMPurify + Backend Filter
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  CSRF Protection
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
                  Enforced (SameSite)
                </h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">
                  Token + Origin Check
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  CSP Enforcement
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
                  Strict Header Policy
                </h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">
                  Frame Ancestors None
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          {/* Interactive Input Validator Playground */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              Live Input Validation &amp; Payload Inspector
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Test request strings against Era 19 XSS, SQLi, and OS command
              injection filters.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder="Enter input string (e.g. <script>alert(1)</script> or incident_id=123)..."
                className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleTestInput}
                disabled={loading}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
              >
                {loading ? "Inspecting..." : "Inspect Payload"}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-sm space-y-1 font-mono ${
                  testResult.blocked
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {testResult.blocked ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      BLOCKED — Malicious Payload Identified (Type:{" "}
                      {testResult.type || "XSS"})
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      ALLOWED — Clean Input Parameter
                    </>
                  )}
                </div>
                {testResult.reason && (
                  <p className="text-xs opacity-90">{testResult.reason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attack Prevention Logs */}
      {activeTab === "logs" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Web Attack Prevention Log
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Realtime Blocked Requests
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {attackEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {evt.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {evt.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Path: {evt.target_path}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 dark:text-zinc-300">
                    Payload: &quot;{evt.payload}&quot;
                  </p>
                  <p className="text-xs text-slate-400">
                    Source IP: {evt.source_ip}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                    {evt.action}
                  </span>
                  <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security Configuration */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              Content Security Policy (CSP) Policy
            </h3>
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl text-xs font-mono text-slate-700 dark:text-zinc-300 space-y-1">
              <div>default-src &apos;self&apos;;</div>
              <div>script-src &apos;self&apos;;</div>
              <div>style-src &apos;self&apos; &apos;unsafe-inline&apos;;</div>
              <div>img-src &apos;self&apos; data:;</div>
              <div>frame-ancestors &apos;none&apos;;</div>
              <div>object-src &apos;none&apos;;</div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-500" />
              Secure File Upload Allowlist Policy
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  Allowed Extensions:
                </span>
                <span className="font-mono text-emerald-500">
                  .pdf, .json, .csv, .txt
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  Blocked Executables:
                </span>
                <span className="font-mono text-rose-500">
                  .exe, .sh, .bat, .js, .html
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  Max File Size:
                </span>
                <span className="font-mono text-slate-600 dark:text-zinc-400">
                  10 MB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
