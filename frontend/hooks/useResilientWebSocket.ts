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
  const connectRef = useRef<() => void>(() => {});

  // Synchronize options ref safely inside an effect
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connectSocket = useCallback(() => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const opts = optionsRef.current;
      const baseUrl = opts.url || WS_BASE_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const wsUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;

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

  // Update connectRef after connectSocket is initialized
  useEffect(() => {
    connectRef.current = connectSocket;
  }, [connectSocket]);

  // Manage connection lifecycle asynchronously to prevent setState in effect body warnings
  useEffect(() => {
    const timer = setTimeout(() => {
      connectSocket();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  const manualReconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    setReconnectCount(0);
    setStatus("CONNECTING");
    connectSocket();
  }, [connectSocket]);

  return {
    status,
    messages,
    reconnectCount,
    reconnect: manualReconnect,
  };
}
