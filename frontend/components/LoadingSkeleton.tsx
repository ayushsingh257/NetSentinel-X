"use client";

import React from "react";

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({
  rows = 4,
  height = "h-12",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} rounded-2xl bg-slate-200/60 dark:bg-zinc-900/60 animate-pulse border border-slate-200/40 dark:border-zinc-800/40`}
        />
      ))}
    </div>
  );
}
