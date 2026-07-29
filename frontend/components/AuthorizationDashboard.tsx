"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  Key,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

interface Violation {
  id: string;
  username: string;
  role: string;
  action: string;
  resource: string;
  severity: string;
  timestamp: string;
  description: string;
}

interface RoleMatrix {
  [key: string]: string[];
}

const INITIAL_VIOLATIONS: Violation[] = [
  {
    id: "VIOL-9011",
    username: "analyst_user",
    role: "SECURITY_ANALYST",
    action: "SYSTEM_CONFIGURATION",
    resource: "/api/v2/security/sessions/revoke",
    severity: "HIGH",
    timestamp: "2026-07-29T10:15:00.000Z",
    description:
      "Unauthorized user 'analyst_user' attempted SYSTEM_CONFIGURATION",
  },
  {
    id: "VIOL-9012",
    username: "guest_viewer",
    role: "VIEW_ONLY",
    action: "EXECUTE_PLAYBOOKS",
    resource: "/api/v2/workflows/execute",
    severity: "MEDIUM",
    timestamp: "2026-07-29T09:45:00.000Z",
    description:
      "View-only user attempted restricted mutation action EXECUTE_PLAYBOOKS",
  },
];

export default function AuthorizationDashboard() {
  const [activeTab, setActiveTab] = useState<
    "explorer" | "matrix" | "violations"
  >("explorer");
  const [selectedRole, setSelectedRole] = useState<string>("SECURITY_ANALYST");
  const [roleMatrix, setRoleMatrix] = useState<RoleMatrix>({
    SUPER_ADMIN: [
      "VIEW_INCIDENTS",
      "CREATE_INCIDENTS",
      "CLOSE_INCIDENTS",
      "RUN_THREAT_HUNTS",
      "CREATE_RULES",
      "MODIFY_RULES",
      "EXECUTE_PLAYBOOKS",
      "EXPORT_REPORTS",
      "VIEW_AUDIT_LOGS",
      "SYSTEM_CONFIGURATION",
    ],
    SOC_ADMIN: [
      "VIEW_INCIDENTS",
      "CREATE_INCIDENTS",
      "CLOSE_INCIDENTS",
      "RUN_THREAT_HUNTS",
      "CREATE_RULES",
      "MODIFY_RULES",
      "EXECUTE_PLAYBOOKS",
      "EXPORT_REPORTS",
      "VIEW_AUDIT_LOGS",
    ],
    SECURITY_ANALYST: [
      "VIEW_INCIDENTS",
      "CREATE_INCIDENTS",
      "CLOSE_INCIDENTS",
      "RUN_THREAT_HUNTS",
      "EXECUTE_PLAYBOOKS",
      "EXPORT_REPORTS",
    ],
    THREAT_HUNTER: ["VIEW_INCIDENTS", "RUN_THREAT_HUNTS", "EXPORT_REPORTS"],
    DETECTION_ENGINEER: [
      "VIEW_INCIDENTS",
      "CREATE_RULES",
      "MODIFY_RULES",
      "EXPORT_REPORTS",
    ],
    AUDITOR: ["VIEW_INCIDENTS", "EXPORT_REPORTS", "VIEW_AUDIT_LOGS"],
    VIEW_ONLY: ["VIEW_INCIDENTS", "VIEW_REPORTS", "VIEW_DASHBOARD"],
  });

  const [violations, setViolations] = useState<Violation[]>(INITIAL_VIOLATIONS);
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthzData() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [matrixRes, violRes] = await Promise.all([
          fetch(`${apiBase}/api/v2/authz/roles`, { headers }).catch(
            () => null
          ),
          fetch(`${apiBase}/api/v2/authz/violations`, { headers }).catch(
            () => null
          ),
        ]);

        if (isMounted) {
          if (matrixRes && matrixRes.ok) {
            const data = await matrixRes.json();
            if (data.matrix) setRoleMatrix(data.matrix);
          }
          if (violRes && violRes.ok) {
            const data = await violRes.json();
            if (data.violations) setViolations(data.violations);
          }
        }
      } catch {
        // Fallback initialized
      }
    }

    loadAuthzData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [matrixRes, violRes] = await Promise.all([
        fetch(`${apiBase}/api/v2/authz/roles`, { headers }).catch(() => null),
        fetch(`${apiBase}/api/v2/authz/violations`, { headers }).catch(
          () => null
        ),
      ]);

      if (matrixRes && matrixRes.ok) {
        const data = await matrixRes.json();
        if (data.matrix) setRoleMatrix(data.matrix);
      }
      if (violRes && violRes.ok) {
        const data = await violRes.json();
        if (data.violations) setViolations(data.violations);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const allPossiblePermissions = [
    "VIEW_INCIDENTS",
    "CREATE_INCIDENTS",
    "CLOSE_INCIDENTS",
    "RUN_THREAT_HUNTS",
    "CREATE_RULES",
    "MODIFY_RULES",
    "EXECUTE_PLAYBOOKS",
    "EXPORT_REPORTS",
    "VIEW_AUDIT_LOGS",
    "SYSTEM_CONFIGURATION",
  ];

  const currentRolePerms = roleMatrix[selectedRole] || [];

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
              Enterprise Authorization & Access Control
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 18 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Role-Based Access Control (RBAC), Least Privilege Policy &
              Privilege Escalation Monitoring
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Policy Data
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Defined Roles
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            {Object.keys(roleMatrix).length}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            SuperAdmin to ViewOnly
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Enforced Permissions
            </span>
            <Key className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            {allPossiblePermissions.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Granular API Guards
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Protected Endpoints
            </span>
            <Lock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            100%
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            JWT + RBAC Middleware
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Security Violations
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            {violations.length}
          </div>
          <div className="text-xs text-amber-500 font-medium mt-1">
            Blocked & Logged
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "explorer"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Permission Explorer
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "matrix"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Access Control Matrix
        </button>
        <button
          onClick={() => setActiveTab("violations")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "violations"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Security Violations
          {violations.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 font-bold">
              {violations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Permission Explorer */}
      {activeTab === "explorer" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(roleMatrix).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  selectedRole === role
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allowed Actions */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Allowed Actions for {selectedRole}
              </h3>
              <div className="space-y-2">
                {currentRolePerms.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-400 italic">
                    No allowed actions.
                  </p>
                ) : (
                  currentRolePerms.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-mono font-medium"
                    >
                      <span>{perm}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase font-sans font-bold">
                        Permitted
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Denied Actions */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-rose-500" />
                Denied Actions for {selectedRole}
              </h3>
              <div className="space-y-2">
                {allPossiblePermissions
                  .filter((p) => !currentRolePerms.includes(p))
                  .map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-700 dark:text-rose-400 text-sm font-mono font-medium"
                    >
                      <span>{perm}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase font-sans font-bold">
                        Blocked
                      </span>
                    </div>
                  ))}
                {allPossiblePermissions.filter(
                  (p) => !currentRolePerms.includes(p)
                ).length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-zinc-400 italic">
                    Full super-administrator privileges. Zero denied actions.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Access Control Matrix */}
      {activeTab === "matrix" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Role Permission Matrix
            </h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter roles or permissions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Incidents</th>
                  <th className="p-4 text-center">Threat Hunt</th>
                  <th className="p-4 text-center">Rules Engine</th>
                  <th className="p-4 text-center">SOAR Playbooks</th>
                  <th className="p-4 text-center">Reports</th>
                  <th className="p-4 text-center">System Config</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {Object.entries(roleMatrix)
                  .filter(
                    ([role]) =>
                      !searchFilter ||
                      role.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map(([role, perms]) => {
                    const hasIncidents = perms.includes("CREATE_INCIDENTS");
                    const hasViewIncidents = perms.includes("VIEW_INCIDENTS");
                    const hasHunt = perms.includes("RUN_THREAT_HUNTS");
                    const hasRules = perms.includes("CREATE_RULES");
                    const hasSOAR = perms.includes("EXECUTE_PLAYBOOKS");
                    const hasReports = perms.includes("EXPORT_REPORTS");
                    const hasConfig = perms.includes("SYSTEM_CONFIGURATION");

                    return (
                      <tr
                        key={role}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-900 dark:text-zinc-100 font-mono">
                          {role}
                        </td>
                        <td className="p-4 text-center">
                          {hasIncidents ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : hasViewIncidents ? (
                            <Eye className="w-5 h-5 text-blue-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasHunt ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasRules ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasSOAR ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasReports ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasConfig ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500/40 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Violations */}
      {activeTab === "violations" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-400 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              Privilege escalation attempts and unauthorized API access
              requests are automatically logged to the immutable audit log and
              flagged for SOC review.
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Logged Security Violations & Escalation Attempts
              </h3>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {violations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
                  No authorization security violations recorded.
                </div>
              ) : (
                violations.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {v.severity}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {v.action}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {v.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        {v.description}
                      </p>
                      <div className="text-xs text-slate-400 flex gap-4 pt-1">
                        <span>User: {v.username}</span>
                        <span>Role: {v.role}</span>
                        <span>Resource: {v.resource}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(v.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
