 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/** POST /api/create-tehsil/ — body: { tehsil_name: string, province: number, division: number, district: number } (ids from list-province / list-division / list-district) */
const CREATE = "create-tehsil/";
const LIST = "list-tehsil/";
const UPDATE = "update-tehsil/";
const DELETE_PATH = "delete-tehsil/";

export async function listTehsils(districtId) {
  const params = districtId != null ? { district: String(districtId) } : undefined;
  const data = await get(LIST, params );
  return Array.isArray(data) ? data : [];
}

export async function getTehsilById(id) {
  const data = await get(LIST, { id: String(id) });
  return _nullishCoalesce(data, () => ( null));
}

export async function createTehsil(payload) {
  return post(CREATE, payload);
}

export async function updateTehsil(id, payload) {
  return put(`${UPDATE}${id}/`, payload);
}

export async function deleteTehsil(id) {
  await del(`${DELETE_PATH}${id}/`);
}
