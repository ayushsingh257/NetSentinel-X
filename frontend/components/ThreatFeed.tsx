"use client";

const threats = [
  {
    severity: "CRITICAL",
    message: "Brute Force Activity Detected",
    source: "185.220.101.45",
  },
  {
    severity: "HIGH",
    message: "Port Scan Detected",
    source: "45.33.32.156",
  },
  {
    severity: "MEDIUM",
    message: "Suspicious DNS Query",
    source: "192.168.29.60",
  },
];

export default function ThreatFeed() {
  return (
    <div className="bg-zinc-950 border border-red-500 rounded-2xl p-5 h-full">

      <h2 className="text-2xl font-bold text-red-400 mb-4">
        Live Threat Feed
      </h2>

      <div className="space-y-4">

        {threats.map((threat, index) => (

          <div
            key={index}
            className="bg-zinc-900 border border-red-800 rounded-xl p-4"
          >

            <div className="flex justify-between items-center mb-2">

              <span className="text-red-400 font-bold">
                {threat.severity}
              </span>

              <span className="text-zinc-500 text-sm">
                LIVE
              </span>

            </div>

            <p className="text-white font-semibold">
              {threat.message}
            </p>

            <p className="text-zinc-400 text-sm mt-1">
              Source: {threat.source}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}