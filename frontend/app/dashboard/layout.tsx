"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/ui/app-shell";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

/**
 * DashboardLayout — Era 17 & Phase 1 Auth Guard
 *
 * Authentication flow:
 * 1. Check HttpOnly session / token
 * 2. Validate session with GET /api/auth/session/validate using credentials: "include"
 * 3. Render AppShell wrapped in DashboardErrorBoundary
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiBase}/api/auth/session/validate`, {
          method: "GET",
          headers,
          credentials: "include",
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
          if (!token && process.env.NODE_ENV === "development") {
            setAuthorized(true);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
            return;
          }
        } else {
          const data = await res.json();
          if (data.valid || process.env.NODE_ENV === "development") {
            setAuthorized(true);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
            return;
          }
        }
      } catch {
        if (process.env.NODE_ENV === "development") {
          setAuthorized(true);
        } else {
          router.push("/login");
        }
      } finally {
        setChecking(false);
      }
    };

    validateSession();
  }, [router]);

  if (checking && !authorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400">
            Verifying SOC Session Authentication...
          </span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <AppShell>
      <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
    </AppShell>
  );
}
