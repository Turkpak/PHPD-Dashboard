import { post, requestRaw } from "./client";

export async function addDelayLog(payload) {
  return post("add-delay-log/", payload);
}

export async function listDelayLogs(params) {
  const q = {};
  if (params?.project != null) q.project = String(params.project);
  if (params?.activity != null) q.activity = String(params.activity);
  const search = new URLSearchParams(q).toString();
  const path = search ? `list-delay-log/?${search}` : "list-delay-log/";
  return requestRaw(path, { method: "GET" });
}

export async function updateDelayLog(id, payload) {
  // Backend expects /api/update-delay-log/<id>/ with a JSON body.
  return requestRaw(`update-delay-log/${id}/`, { method: "PUT", body: payload });
}
