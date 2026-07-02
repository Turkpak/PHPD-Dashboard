 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }export const API_PREFIX = "/api";

export const DEFAULT_BACKEND_URL = "http://localhost:8000";

/**
 * In dev we use Vite proxy: request goes to same origin (e.g. /api/create-stakeholder/)
 * and Vite forwards to 127.0.0.1:8000 so the response comes back (no CORS / "Failed to fetch").
 * Set VITE_API_BASE_URL in .env to override (e.g. for production or no proxy).
 */
function getApiBaseUrl() {
  const fromEnv = _optionalChain([(import.meta.env.VITE_API_BASE_URL ), 'optionalAccess', _ => _.trim, 'call', _2 => _2(), 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/\/$/, "")]);
  if (fromEnv) return fromEnv;
  // Dev with proxy: use same origin so Vite proxies /api to Django
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const { hostname, port } = window.location;
    if (hostname === "localhost" && (port === "5000" || port === "5173" || port === "3000"))
      return ""; // same-origin → proxy handles /api
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
 * Build an absolute URL for Django-served media (e.g. `/media/...`).
 * When dev uses Vite proxy (`API_BASE_URL === ""`), media is NOT under `/api`,
 * so we fall back to the backend origin.
 */
export function mediaUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // Prefer localhost:8000 in dev to match browser host and avoid edge DNS issues on Windows.
  const base = API_BASE_URL || DEFAULT_BACKEND_URL;
  return `${base}${p}`;
}
