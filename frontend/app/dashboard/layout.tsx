"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/ui/app-shell";

/**
 * DashboardLayout — Era 17 Auth Guard
 *
 * Authentication flow:
 * 1. Check localStorage for token
 * 2. If no token → redirect to /login immediately
 * 3. If token exists → call GET /api/auth/session/validate to verify with backend
 * 4. If backend returns invalid/401 → redirect to /login (catches fake/expired/tampered tokens)
 * 5. If backend confirms valid → render AppShell with dashboard content
 *
 * This ensures a hardcoded or fake token in localStorage cannot bypass authentication.
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

      // Step 1: No token at all → redirect immediately
      if (!token) {
        router.push("/login");
        return;
      }

      // Step 2: Backend session validation (Era 17 hardening)
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const res = await fetch(`${apiBase}/api/auth/session/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Fail fast — don't block the user for too long
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
          // Backend rejected the token (expired, tampered, or invalid)
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (!data.valid) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login");
          return;
        }

        // Session confirmed valid by backend
        setAuthorized(true);
      } catch {
        // Network error or backend unavailable — fail open in dev mode only
        // In production (Era 19) this will always fail closed
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

  // Loading state during backend validation
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

  return <AppShell>{children}</AppShell>;
}
