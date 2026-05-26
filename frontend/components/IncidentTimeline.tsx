"use client";

const incidents = [
  "DNS anomaly detected",
  "Port scan activity detected",
  "Suspicious TLS handshake",
  "High-volume HTTP traffic detected",
  "Threat intelligence IOC matched",
];

export default function IncidentTimeline() {
  return (
    <div className="bg-zinc-950 border border-cyan-500 rounded-2xl p-5">

      <h2 className="text-2xl font-bold text-cyan-400 mb-6">
        Incident Timeline
      </h2>

      <div className="space-y-6">

        {incidents.map((incident, index) => (

          <div
            key={index}
            className="flex items-start gap-4"
          >

            <div className="w-4 h-4 rounded-full bg-cyan-400 mt-1 animate-pulse"></div>

            <div>

              <p className="text-white font-semibold">
                {incident}
              </p>

              <p className="text-zinc-500 text-sm">
                Realtime Security Event
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}