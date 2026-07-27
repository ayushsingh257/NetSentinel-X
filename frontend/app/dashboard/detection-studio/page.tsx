"use client";

import DetectionStudio from "@/components/DetectionStudio";

export default function DetectionStudioPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Sigma &amp; YARA Detection Engineering Studio
        </h1>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          Author, test, validate, and deploy custom Sigma rules and YARA signatures with AI validation.
        </p>
      </div>

      <DetectionStudio />
    </div>
  );
}
