function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";



/**
 * This module is used by the frontend "Zone" UI.
 * Backend routes are named create-zone/list-zone/update-zone/delete-zone.
 *
 * Payload/fields are normalized to { province_name } on the client side to
 * minimize churn across the existing frontend.
 */
const CREATE_PATH = "create-zone/";
const LIST = "list-zone/";
const UPDATE = "update-zone/";
const DELETE_PATH = "delete-zone/";

/**
 * GET list-zone: fetch all zones.
 */
export async function listProvinces() {
  const data = await get(LIST);
  // Backend uses `zone_name`; normalize to also expose `province_name`
  // so existing frontend pages don't need to change all field reads.
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    ...row,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
  }));
}

export async function getProvinceById(id) {
  const data = await get(LIST, { id: String(id) });
  return _nullishCoalesce(data, () => ( null));
}

/**
 * POST create-zone: create a new zone.
 */
export async function createProvince(payload) {
  const name = String(payload?.province_name ?? payload?.zone_name ?? "").trim();
  return post(CREATE_PATH, { zone_name: name });
}

/**
 * PUT update-zone: update zone name by id.
 */
export async function updateProvince(id, payload) {
  const hasName = payload?.province_name !== undefined || payload?.zone_name !== undefined;
  const name = String(payload?.province_name ?? payload?.zone_name ?? "").trim();
  const body = hasName ? { zone_name: name } : {};
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteProvince(id) {
  await del(`${DELETE_PATH}${id}/`);
}
