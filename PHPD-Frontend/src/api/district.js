 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/** POST /api/create-district/ — body: { district_name: string, division: number, province: number } (ids from list-province / list-division) */
const CREATE = "create-district/";
/** GET /api/list-district/ — returns all districts with province_name, division_name for table (Province → Division → District) */
const LIST = "list-district/";
/** PUT /api/update-district/{id}/ — body: { district_name?: string, division?: number, province?: number } (use district id in URL) */
const UPDATE = "update-district/";
const DELETE_PATH = "delete-district/";

export async function listDistricts(divisionId) {
  const params = divisionId != null ? { division: String(divisionId) } : undefined;
  const data = await get(LIST, params );
  return Array.isArray(data) ? data : [];
}

export async function getDistrictById(id) {
  const data = await get(LIST, { id: String(id) });
  return _nullishCoalesce(data, () => ( null));
}

export async function createDistrict(payload) {
  return post(CREATE, payload);
}

/** Update district by id. Body: { district_name, division, province } (ids from list-province / list-division). */
export async function updateDistrict(id, payload) {
  return put(`${UPDATE}${id}/`, payload);
}

export async function deleteDistrict(id) {
  await del(`${DELETE_PATH}${id}/`);
}
