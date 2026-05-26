"use client";

export default function ThreatIntelPanel() {
  return (
    <div className="bg-zinc-950 border border-yellow-500 rounded-2xl p-5">

      <h2 className="text-2xl font-bold text-yellow-400 mb-5">
        Threat Intelligence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-zinc-900 rounded-xl p-4 border border-red-800">

          <p className="text-zinc-400">
            Malicious IPs
          </p>

          <h3 className="text-4xl font-bold text-red-400 mt-2">
            14
          </h3>

        </div>

        <div className="bg-zinc-900 rounded-xl p-4 border border-yellow-700">

          <p className="text-zinc-400">
            IOC Matches
          </p>

          <h3 className="text-4xl font-bold text-yellow-400 mt-2">
            8
          </h3>

        </div>

        <div className="bg-zinc-900 rounded-xl p-4 border border-cyan-700">

          <p className="text-zinc-400">
            Threat Score
          </p>

          <h3 className="text-4xl font-bold text-cyan-400 mt-2">
            92%
          </h3>

        </div>

      </div>

    </div>
  );
}