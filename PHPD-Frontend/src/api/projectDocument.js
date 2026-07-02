import { request, requestRaw } from "./client";

const CREATE = "create-project-document/";
const LIST = "list-project-document/";
const UPDATE = "update-project-document/";

 






export async function createProjectDocument(payload) {
  const form = new FormData();
  form.append("project", String(payload.project));
  form.append("activity", String(payload.activity));
  form.append("file", payload.file);
  form.append("title", payload.title.trim() || payload.file.name);
  return request(CREATE, { method: "POST", formData: form });
}

/** Row from GET list-project-document/ (paginated envelope). */
 









function extractListPayload(raw) {
  const r = raw ;
  const results = r?.results ;
  if (results?.data != null && Array.isArray(results.data)) return results.data ;
  if (Array.isArray(r?.results)) return r.results ;
  if (Array.isArray(r?.data)) return r.data ;
  return [];
}

/**
 * GET /api/list-project-document/
 * Backend accepts `project` and/or `activity` query params (ProjectActivity PK for `activity`).
 * Some clients use `activity_id`; we send both when filtering by activity for compatibility.
 */
export async function listProjectDocuments(params



) {
  const q = {};
  if (params?.project != null) q.project = String(params.project);
  if (params?.activity != null) {
    q.activity = String(params.activity);
    q.activity_id = String(params.activity);
  }
  const search = new URLSearchParams(q).toString();
  const path = search ? `${LIST}?${search}` : LIST;
  const raw = await requestRaw(path, { method: "GET" });
  return extractListPayload(raw);
}

 






export async function updateProjectDocument(
  id,
  payload
) {
  const form = new FormData();
  if (payload.project != null) form.append("project", String(payload.project));
  if (payload.activity !== undefined) {
    if (payload.activity == null) form.append("activity", "");
    else form.append("activity", String(payload.activity));
  }
  if (payload.title !== undefined) form.append("title", payload.title ?? "");
  if (payload.file != null) form.append("file", payload.file);
  return requestRaw(`${UPDATE}${id}/`, { method: "PUT", formData: form });
}
