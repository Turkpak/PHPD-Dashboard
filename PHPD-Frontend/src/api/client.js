import { apiUrl } from "./config";

const AUTH_TOKEN_KEY = "safecity_access_token";
const REFRESH_TOKEN_KEY = "safecity_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access, refresh) {
  localStorage.setItem(AUTH_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(res.statusText || `Request failed: ${res.status}`);
  }
  if (res.status >= 400) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  if (Array.isArray(json)) return json;
  if ("data" in json) return json.data;
  return json;
}

/**
 * Raw API call — returns the full JSON body without unwrapping.
 * Use for endpoints like `list-delay-log/` that return `{count, data}`.
 */
export async function requestRaw(path, options = {}) {
  const { method = "GET", body, headers = {}, formData } = options;
  const url = apiUrl(path);
  const authHeaders = getAuthHeaders();
  const isJson = !formData && body !== undefined;
  const requestHeaders = { ...authHeaders, ...headers };
  if (isJson) requestHeaders["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    credentials: "include",
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(res.statusText || `Request failed: ${res.status}`);
  }
  if (res.status >= 400) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  return json;
}

/**
 * Standard API call — returns the `data` field of the response envelope.
 * Throws on non-2xx responses.
 */
export async function request(path, options = {}) {
  const { method = "GET", body, headers = {}, formData } = options;
  const url = apiUrl(path);
  const authHeaders = getAuthHeaders();
  const isJson = !formData && body !== undefined;
  const requestHeaders = { ...authHeaders, ...headers };
  if (isJson) requestHeaders["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    credentials: "include",
  });

  return parseResponse(res);
}

export async function get(path, params) {
  let url = path;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") search.set(k, String(v));
    }
    const q = search.toString();
    if (q) url += (path.includes("?") ? "&" : "?") + q;
  }
  return request(url, { method: "GET" });
}

export async function post(path, body) {
  return request(path, { method: "POST", body });
}

export async function put(path, body) {
  return request(path, { method: "PUT", body });
}

export async function patch(path, body) {
  return request(path, { method: "PATCH", body });
}

export async function del(path) {
  return request(path, { method: "DELETE" });
}
