"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { WS_BASE_URL } from "@/lib/api";

export type ConnectionStatus = "CONNECTING" | "CONNECTED" | "RECONNECTING" | "DISCONNECTED";

export interface ResilientWebSocketOptions {
  url?: string;
  onMessage?: (data: string) => void;
  maxReconnectAttempts?: number;
  initialReconnectDelayMs?: number;
}

export function useResilientWebSocket(options: ResilientWebSocketOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>("CONNECTING");
  const [messages, setMessages] = useState<string[]>([]);
  const [reconnectCount, setReconnectCount] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initialDelay = options.initialReconnectDelayMs || 1000;
  const maxAttempts = options.maxReconnectAttempts || 10;

  const connect = useCallback(() => {
    try {
      const baseUrl = options.url || WS_BASE_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const wsUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;

      setStatus(reconnectCount > 0 ? "RECONNECTING" : "CONNECTING");
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("CONNECTED");
        setReconnectCount(0);
      };

      ws.onmessage = (event) => {
        setMessages((prev) => [event.data, ...prev.slice(0, 499)]); // Keep last 500 messages
        if (options.onMessage) {
          options.onMessage(event.data);
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket stream error encountered:", error);
      };

      ws.onclose = (event) => {
        setStatus("DISCONNECTED");
        if (event.wasClean) return;

        // Exponential backoff reconnect
        if (reconnectCount < maxAttempts) {
          const delay = Math.min(initialDelay * Math.pow(2, reconnectCount), 30000);
          setReconnectCount((prev) => prev + 1);
          setStatus("RECONNECTING");
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setStatus("DISCONNECTED");
    }
  }, [options, reconnectCount, initialDelay, maxAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    messages,
    reconnectCount,
    reconnect: connect,
  };
}
