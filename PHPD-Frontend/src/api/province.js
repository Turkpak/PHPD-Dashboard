 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/** POST /api/create-province/ — body: { province_name: string } */
const CREATE_PATH = "create-province/";
/** GET /api/list-province/ — returns all provinces with id and province_name */
const LIST = "list-province/";
/** PUT /api/update-province/{id}/ — body: { province_name?: string } */
const UPDATE = "update-province/";
const DELETE_PATH = "delete-province/";

/**
 * GET list-province: fetch all provinces added by the user.
 * URL: http://127.0.0.1:8000/api/list-province/
 */
export async function listProvinces() {
  const data = await get(LIST);
  return Array.isArray(data) ? data : [];
}

export async function getProvinceById(id) {
  const data = await get(LIST, { id: String(id) });
  return _nullishCoalesce(data, () => ( null));
}

/**
 * POST create-province: create a new province.
 * URL: http://127.0.0.1:8000/api/create-province/
 * Body: { province_name: "Punjab" }
 */
export async function createProvince(payload) {
  return post(CREATE_PATH, { province_name: payload.province_name.trim() });
}

/**
 * PUT update-province: update province name by id.
 * URL: http://127.0.0.1:8000/api/update-province/1/
 * Body: { province_name: string }
 */
export async function updateProvince(id, payload) {
  const body = payload.province_name !== undefined ? { province_name: String(payload.province_name).trim() } : {};
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteProvince(id) {
  await del(`${DELETE_PATH}${id}/`);
}
