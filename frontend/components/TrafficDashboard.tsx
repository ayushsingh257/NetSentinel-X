"use client";

import { useEffect, useState } from "react";

export default function TrafficDashboard() {
  const [messages, setMessages] = useState<string[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      setMessages((prev) => [event.data, ...prev]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <h1 className="text-4xl font-bold mb-6">
        Live Traffic Monitor
      </h1>

      <div className="flex gap-4 mb-4">

        <button
          onClick={() => setFilter("ALL")}
          className="bg-cyan-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition-all duration-200"
        >
          ALL
        </button>

        <button
          onClick={() => setFilter("TCP")}
          className="bg-green-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition-all duration-200"
        >
          TCP
        </button>

        <button
          onClick={() => setFilter("UDP")}
          className="bg-yellow-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition-all duration-200"
        >
          UDP
        </button>

      </div>

      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 h-[80vh] overflow-y-auto border border-green-500 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">

        {messages.length === 0 ? (
          <p>No traffic captured yet...</p>
        ) : (
          messages
            .filter((message) => {
              if (filter === "ALL") return true;

              return message.includes(`PROTOCOL: ${filter}`);
            })
            .map((message, index) => (
              <div
                key={index}
                className="mb-2 border-b border-zinc-700 pb-2"
              >
                {message}
              </div>
            ))
        )}

      </div>
    </div>
  );
}