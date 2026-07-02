 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/** POST /api/create-stakeholder/ — body: { stakeholder_type, stakeholder_title [, status] } */
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
  return _nullishCoalesce(data, () => ( null));
}

/**
 * POST request to create a new stakeholder.
 * Endpoint: http://127.0.0.1:8000/api/create-stakeholder/
 * Body: { stakeholder_type: string, stakeholder_title: string } — both required.
 */
export async function createStakeholder(payload) {
  const body = {
    stakeholder_type: payload.stakeholder_type.trim(),
    stakeholder_title: payload.stakeholder_title.trim(),
  };
  if (payload.status != null && payload.status !== undefined) {
    body.status = payload.status;
  }
  return post(CREATE_PATH, body);
}

/**
 * PUT request to update a stakeholder.
 * URL: http://127.0.0.1:8000/api/update-stakeholder/{id}/
 * Body: { stakeholder_type?, stakeholder_title?, status? }
 */
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
