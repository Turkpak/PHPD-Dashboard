import { get, post, put, del } from "./client";

const CREATE_PATH = "create-stakeholder/";
const LIST = "list-stakeholder/";
const UPDATE = "update-stakeholder/";
const DELETE_PATH = "delete-stakeholder/";

export async function listStakeholders() {
  const data = await get(LIST);
  return Array.isArray(data) ? data : [];
}

export async function getStakeholderById(id) {
  const data = await get(LIST, { id: String(id) });
  return data ?? null;
}

export async function createStakeholder(payload) {
  const body = {
    stakeholder_type: payload.stakeholder_type.trim(),
    stakeholder_title: payload.stakeholder_title.trim(),
  };
  if (payload.status != null) body.status = payload.status;
  return post(CREATE_PATH, body);
}

export async function updateStakeholder(id, payload) {
  const body = {};
  if (payload.stakeholder_type !== undefined) body.stakeholder_type = String(payload.stakeholder_type).trim();
  if (payload.stakeholder_title !== undefined) body.stakeholder_title = String(payload.stakeholder_title).trim();
  if (payload.status !== undefined) body.status = payload.status;
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteStakeholder(id) {
  await del(`${DELETE_PATH}${id}/`);
}
