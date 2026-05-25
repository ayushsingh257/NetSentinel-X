"use client";

export default function Navbar() {
  return (
    <div className="w-full border-b border-cyan-900 bg-black/95 backdrop-blur-md sticky top-0 z-50">

      <div className="flex items-center justify-between px-6 py-4">

        <div>
          <h1 className="text-3xl font-extrabold text-cyan-400 tracking-wide">
            NetSentinel-X
          </h1>

          <p className="text-zinc-500 text-sm">
            Enterprise Security Operations Center
          </p>
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-green-500 shadow-lg shadow-green-500/20 px-4 py-2 rounded-xl">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

            <span className="text-green-400 font-semibold">
              SYSTEM ACTIVE
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}