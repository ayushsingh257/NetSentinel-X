"use client";

import { useEffect, useState } from "react";

interface Alert {
  id: number;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  port: number;
  alert_message: string;
  severity: string;
}

export default function AlertDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function fetchAlerts() {
    try {
      const response = await fetch("http://localhost:8080/alerts");
      const data = await response.json();

      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 3000);

    return () => clearInterval(interval);
  }, []);

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "HIGH":
        return "border-red-500 text-red-400";

      case "MEDIUM":
        return "border-yellow-500 text-yellow-400";

      default:
        return "border-green-500 text-green-400";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-red-500">
        NetSentinel-X Threat Alert Dashboard
      </h1>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-xl p-4 bg-zinc-900 ${getSeverityColor(
              alert.severity
            )}`}
          >
            <h2 className="text-xl font-bold mb-2">
              🚨 {alert.severity} ALERT
            </h2>

            <p>
              <strong>Message:</strong> {alert.alert_message}
            </p>

            <p>
              <strong>Source:</strong> {alert.source_ip}
            </p>

            <p>
              <strong>Destination:</strong> {alert.destination_ip}
            </p>

            <p>
              <strong>Protocol:</strong> {alert.protocol}
            </p>

            <p>
              <strong>Port:</strong> {alert.port}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}