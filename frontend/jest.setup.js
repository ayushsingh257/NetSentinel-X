import "@testing-library/jest-dom";

process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
process.env.NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

if (typeof window !== "undefined" && !window.WebSocket) {
  class DummyWebSocket {
    constructor() {
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
    }
    close() {}
    send() {}
  }
  window.WebSocket = DummyWebSocket;
}