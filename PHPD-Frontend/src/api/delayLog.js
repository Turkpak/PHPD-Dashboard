 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { post, requestRaw } from "./client";

 




















export async function addDelayLog(payload) {
  return post("add-delay-log/", payload);
}

 





















export async function listDelayLogs(params) {
  const q = {};
  if (_optionalChain([params, 'optionalAccess', _ => _.project]) != null) q.project = String(params.project);
  if (_optionalChain([params, 'optionalAccess', _2 => _2.activity]) != null) q.activity = String(params.activity);
  const search = new URLSearchParams(q).toString();
  const path = search ? `list-delay-log/?${search}` : "list-delay-log/";
  return requestRaw(path, { method: "GET" });
}

 
















export async function updateDelayLog(id, payload) {
  // Backend expects /api/update-delay-log/<id>/ with a JSON body.
  return requestRaw(`update-delay-log/${id}/`, { method: "PUT", body: payload });
}

