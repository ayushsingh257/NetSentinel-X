"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const protocolData = [
  { name: "TCP", value: 65 },
  { name: "UDP", value: 25 },
  { name: "ICMP", value: 10 },
];

const COLORS = ["#06b6d4", "#eab308", "#22c55e"];

const attackerData = [
  { ip: "External IP 1", packets: 120 },
  { ip: "External IP 2", packets: 95 },
  { ip: "External IP 3", packets: 80 },
  { ip: "Local Network", packets: 60 },
];

export default function AnalyticsPanel() {

  return (

    <div className="bg-zinc-950 border border-cyan-500 rounded-xl p-4">

      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
        Traffic Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700">

          <h3 className="text-zinc-400">
            Packets Captured
          </h3>

          <p className="text-3xl font-bold text-cyan-400">
            12,482
          </p>

        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700">

          <h3 className="text-zinc-400">
            Threat Alerts
          </h3>

          <p className="text-3xl font-bold text-red-400">
            84
          </p>

        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700">

          <h3 className="text-zinc-400">
            Active Connections
          </h3>

          <p className="text-3xl font-bold text-green-400">
            231
          </p>

        </div>

      </div>

      <div className="flex flex-col items-center">

        <PieChart
          width={500}
          height={350}
        >

          <Pie
            data={protocolData}
            dataKey="value"
            outerRadius={100}
            label
          >

            {protocolData.map((entry, index) => (

              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Top Traffic Sources
        </h2>

        <div className="overflow-x-auto flex justify-center">

          <BarChart
            width={700}
            height={350}
            data={attackerData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
            />

            <XAxis
              dataKey="ip"
              stroke="#aaa"
            />

            <YAxis stroke="#aaa" />

            <Tooltip />

            <Bar
              dataKey="packets"
              fill="#ef4444"
            />

          </BarChart>

        </div>

      </div>

    </div>
  );
}