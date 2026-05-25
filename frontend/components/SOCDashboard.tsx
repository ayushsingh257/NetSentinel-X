"use client";

import TrafficDashboard from "./TrafficDashboard";
import AlertDashboard from "./AlertDashboard";
import Navbar from "./Navbar";
import { useEffect } from "react";

export default function SOCDashboard() {
  useEffect(() => {

  const token = localStorage.getItem("token");

  if (!token) {

    window.location.href = "/login";
  }

}, []);
return (
  <div className="min-h-screen bg-black text-white">

    <Navbar />

    <div className="p-6 border-b border-zinc-800">

      <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        Security Operations Center
      </h1>

      <p className="text-zinc-400 mt-2">
        Enterprise Realtime Threat Monitoring Platform
      </p>

    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">

  <div className="bg-zinc-950/80 backdrop-blur-sm border border-cyan-500 rounded-xl p-5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:-translate-y-1 transition-all duration-300">
    <p className="text-zinc-400 text-sm">Total Packets</p>

    <h2 className="text-4xl font-bold text-cyan-400 mt-2">
      0
    </h2>
  </div>

  <div className="bg-zinc-950/80 backdrop-blur-sm border border-red-500 rounded-xl p-5 shadow-lg shadow-red-500/10 hover:shadow-red-500/30 hover:-translate-y-1 transition-all duration-300">
    <p className="text-zinc-400 text-sm">Threat Alerts</p>

    <h2 className="text-4xl font-bold text-red-400 mt-2">
      0
    </h2>
  </div>

  <div className="bg-zinc-950/80 backdrop-blur-sm border border-green-500 rounded-xl p-5 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300">
    <p className="text-zinc-400 text-sm">System Status</p>

    <h2 className="text-2xl font-bold text-green-400 mt-2">
      ACTIVE
    </h2>
  </div>

  <div className="bg-zinc-950/80 backdrop-blur-sm border border-yellow-500 rounded-xl p-5 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300">
    <p className="text-zinc-400 text-sm">Monitoring</p>

    <h2 className="text-2xl font-bold text-yellow-400 mt-2">
      LIVE
    </h2>
  </div>

</div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">

      <div className="xl:col-span-2 border border-cyan-500 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] transition-all duration-300">

        <TrafficDashboard />

      </div>

      <div className="border border-red-500 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_30px_rgba(255,0,0,0.25)] transition-all duration-300">

        <AlertDashboard />

      </div>

    </div>

  </div>
);
}