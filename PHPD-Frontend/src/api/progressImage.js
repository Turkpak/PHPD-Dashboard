 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { requestRaw } from "./client";

const CREATE_PROGRESS_IMAGE = "create-progress-image/";
const LIST_PROGRESS_IMAGE = "list-progress-image/";
const UPDATE_PROGRESS_IMAGE = "update-progress-image/";

 





























export async function createProgressImage(
  payload
) {
  const form = new FormData();
  form.append("project", String(payload.project));
  form.append("activity", String(payload.activity));
  form.append("image", payload.image);
  form.append("image_date", payload.image_date);
  if (payload.caption != null && String(payload.caption).trim()) {
    form.append("caption", String(payload.caption).trim());
  }
  return requestRaw(CREATE_PROGRESS_IMAGE, { method: "POST", formData: form });
}

export async function listProgressImages(params) {
  const q = {};
  if (_optionalChain([params, 'optionalAccess', _ => _.project]) != null) q.project = String(params.project);
  if (_optionalChain([params, 'optionalAccess', _2 => _2.activity]) != null) q.activity = String(params.activity);
  const search = new URLSearchParams(q).toString();
  const path = search ? `${LIST_PROGRESS_IMAGE}?${search}` : LIST_PROGRESS_IMAGE;
  const res = await requestRaw(path, { method: "GET" });
  return Array.isArray(_optionalChain([res, 'optionalAccess', _3 => _3.data])) ? (res.data ) : [];
}

 







export async function updateProgressImage(
  id,
  payload
) {
  const form = new FormData();
  form.append("project", String(payload.project));
  form.append("activity", String(payload.activity));
  form.append("image_date", payload.image_date);
  if (payload.caption != null) form.append("caption", String(payload.caption));
  if (payload.image != null) form.append("image", payload.image);
  return requestRaw(`${UPDATE_PROGRESS_IMAGE}${id}/`, { method: "PUT", formData: form });
}

