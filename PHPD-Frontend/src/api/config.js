export const API_PREFIX = "/api";
export const DEFAULT_BACKEND_URL = "http://localhost:8000";

/**
 * In dev we use Vite proxy: requests go to same origin (e.g. /api/...)
 * and Vite forwards to 127.0.0.1:8000. Set VITE_API_BASE_URL in .env to override.
 */
function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const { hostname, port } = window.location;
    if (hostname === "localhost" && ["5000", "5173", "3000"].includes(port))
      return ""; // same-origin — Vite proxy handles /api
  }
  if (import.meta.env.DEV) return DEFAULT_BACKEND_URL;
  return "";
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${API_PREFIX}${p}` : `${API_PREFIX}${p}`;
}

/**
 * Build an absolute URL for Django-served media files (e.g. `/media/...`).
 */
export function mediaUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = API_BASE_URL || DEFAULT_BACKEND_URL;
  return `${base}${p}`;
}
