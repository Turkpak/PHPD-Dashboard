 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/** POST /api/create-division/ — body: { division_name: string, province: number } (province = id from list-province) */
const CREATE = "create-division/";
const LIST = "list-division/";
const UPDATE = "update-division/";
const DELETE_PATH = "delete-division/";

export async function listDivisions(provinceId) {
  const params = provinceId != null ? { province: String(provinceId) } : undefined;
  const data = await get(LIST, params );
  return Array.isArray(data) ? data : [];
}

export async function getDivisionById(id) {
  const data = await get(LIST, { id: String(id) });
  return _nullishCoalesce(data, () => ( null));
}

export async function createDivision(payload) {
  return post(CREATE, payload);
}

export async function updateDivision(id, payload) {
  return put(`${UPDATE}${id}/`, payload);
}

export async function deleteDivision(id) {
  await del(`${DELETE_PATH}${id}/`);
}
