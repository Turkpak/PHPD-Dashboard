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
  if (params?.project != null) q.project = String(params.project);
  if (params?.activity != null) q.activity = String(params.activity);
  const search = new URLSearchParams(q).toString();
  const path = search ? `${LIST_PROGRESS_IMAGE}?${search}` : LIST_PROGRESS_IMAGE;
  const res = await requestRaw(path, { method: "GET" });
  return Array.isArray(res?.data) ? (res.data) : [];
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
