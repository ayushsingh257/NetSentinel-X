"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/ui/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
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

  return <AppShell>{children}</AppShell>;
}
