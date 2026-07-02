 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
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
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export function clearTokens() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getAccessToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res) {
  const text = await res.text();
  let json;

  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(res.statusText || `Request failed: ${res.status}`);
  }

  if (res.status >= 400) {
    throw new Error(_optionalChain([json, 'optionalAccess', _ => _.message]) || `Request failed: ${res.status}`);
  }

  // ✅ handle raw array
  if (Array.isArray(json)) {
    return json ;
  }

  // ✅ handle normal API (with data)
  if ("data" in json) {
    return json.data ;
  }

  // ✅ handle gantt API (tasks, links)
  return json ;
}

/**
 * Raw API call that returns the full JSON body (no `{data: ...}` unwrapping).
 * Use this for endpoints like `list-delay-log/` that already return `{count, data}`.
 */
export async function requestRaw(
  path,
  options = {}
) {
  const { method = "GET", body, headers = {}, formData } = options;
  const url = apiUrl(path);
  const authHeaders = getAuthHeaders();

  const isJson = !formData && body !== undefined;
  const requestHeaders = {
    ...authHeaders,
    ...headers,
  };
  if (isJson) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let requestBody;
  if (formData) requestBody = formData;
  else if (body !== undefined) requestBody = JSON.stringify(body);

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    credentials: "include",
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e2) {
    throw new Error(res.statusText || `Request failed: ${res.status}`);
  }
  if (res.status >= 400) {
    throw new Error(_optionalChain([json, 'optionalAccess', _2 => _2.message]) || `Request failed: ${res.status}`);
  }
  return json ;
}









/**
 * Call the backend API. Uses Authorization: Bearer if token is present.
 * Throws on non-2xx or when backend returns status >= 400 in envelope.
 * Returns the `data` part of the API response.
 */
export async function request(
  path,
  options = {}
) {
  const { method = "GET", body, headers = {}, formData } = options;
  const url = apiUrl(path);
  const authHeaders = getAuthHeaders();

  const isJson = !formData && body !== undefined;
  const requestHeaders = {
    ...authHeaders,
    ...headers,
  };
  if (isJson) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let requestBody;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    credentials: "include",
  });

  return parseResponse(res);
}

/** GET request */
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

/** POST request */
export async function post(path, body) {
  return request(path, { method: "POST", body });
}

/** PUT request */
export async function put(path, body) {
  return request(path, { method: "PUT", body });
}

/** PATCH request */
export async function patch(path, body) {
  return request(path, { method: "PATCH", body });
}

/** DELETE request */
export async function del(path) {
  return request(path, { method: "DELETE" });
}
