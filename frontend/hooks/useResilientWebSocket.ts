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
  const reconnectCountRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    try {
      const opts = optionsRef.current;
      const baseUrl = opts.url || WS_BASE_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const wsUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;

      const currentCount = reconnectCountRef.current;
      setStatus(currentCount > 0 ? "RECONNECTING" : "CONNECTING");

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("CONNECTED");
        reconnectCountRef.current = 0;
        setReconnectCount(0);
      };

      ws.onmessage = (event) => {
        setMessages((prev) => [event.data, ...prev.slice(0, 499)]);
        if (optionsRef.current.onMessage) {
          optionsRef.current.onMessage(event.data);
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket stream error encountered:", error);
      };

      ws.onclose = (event) => {
        setStatus("DISCONNECTED");
        if (event.wasClean) return;

        const maxAttempts = optionsRef.current.maxReconnectAttempts || 10;
        const initialDelay = optionsRef.current.initialReconnectDelayMs || 1000;

        if (reconnectCountRef.current < maxAttempts) {
          const delay = Math.min(initialDelay * Math.pow(2, reconnectCountRef.current), 30000);
          reconnectCountRef.current += 1;
          setReconnectCount(reconnectCountRef.current);
          setStatus("RECONNECTING");

          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        }
      };
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setStatus("DISCONNECTED");
    }
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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
