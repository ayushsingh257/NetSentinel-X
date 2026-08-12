/**
 * NetSentinel-X V2 — Enterprise API Client Utility
 * Provides HttpOnly cookie-authenticated fetch calls, CSRF token handling, and session management.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

/**
 * Extracts a specific cookie value by name from document.cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Retrieves the current CSRF token from cookie or localStorage fallback
 */
export function getCsrfToken(): string {
  const cookieCsrf = getCookie("csrf_token");
  if (cookieCsrf) return cookieCsrf;
  if (typeof window !== "undefined") {
    return localStorage.getItem("csrf_token") || "dev-csrf-token";
  }
  return "dev-csrf-token";
}

/**
 * Stores role metadata locally for UI navigation state
 */
export function setAuthRole(role: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("role", role);
  }
}

/**
 * Gets the current stored user role
 */
export function getAuthRole(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role") || "analyst";
  }
  return "analyst";
}

/**
 * Clears local session metadata
 */
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("csrf_token");
  }
}

/**
 * Production-ready fetch wrapper featuring HttpOnly cookie credentials,
 * automatic CSRF header injection, and structured error handling.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const method = (options.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Inject CSRF token for non-safe HTTP methods
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrfToken = getCsrfToken();
    if (csrfToken && !headers["X-CSRF-Token"]) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  // Attach legacy Authorization header fallback if token exists in localStorage
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (localToken && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${localToken}`;
    }
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Always include HttpOnly cookies
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      // Clear session metadata on 401 unauthorized
      clearAuth();
    }

    return response;
  } catch (error) {
    console.error(`API Request Error [${method} ${url}]:`, error);
    throw error;
  }
}
