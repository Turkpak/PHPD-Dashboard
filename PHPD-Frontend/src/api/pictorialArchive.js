import { get, del, request } from "./client";

const CREATE = "create-pictorial-archive/";
const LIST = "list-pictorial-archive/";
const UPDATE = "update-pictorial-archive/";
const DELETE_PATH = "delete-pictorial-archive/";

export async function listPictorialArchives(projectId) {
  const params = projectId != null ? { project_id: String(projectId) } : undefined;
  const data = await get(LIST, params);
  return Array.isArray(data) ? data : [];
}

export async function getPictorialArchiveById(id) {
  const data = await get(LIST, { id: String(id) });
  return data ?? null;
}

export async function createPictorialArchive(payload) {
  const form = new FormData();
  form.append("project", String(payload.project));
  if (payload.image != null) form.append("image", payload.image);
  form.append("image_date", payload.image_date);
  if (payload.description != null) form.append("description", payload.description);
  return request(CREATE, { method: "POST", formData: form });
}

export async function updatePictorialArchive(id, payload) {
  const form = new FormData();
  if (payload.image != null) form.append("image", payload.image);
  if (payload.image_date != null) form.append("image_date", payload.image_date);
  if (payload.description != null) form.append("description", payload.description);
  return request(`${UPDATE}${id}/`, { method: "PUT", formData: form });
}

export async function deletePictorialArchive(id) {
  await del(`${DELETE_PATH}${id}/`);
}
