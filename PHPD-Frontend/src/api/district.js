import { get, post, put, del } from "./client";


/**
 * This module powers the frontend "District" UI.
 * Backend routes are create-district/list-district/update-district/delete-district.
 *
 * Client payload/fields are normalized to { district_name, province, division } on the frontend
 * to minimize churn; we translate to { district_name, zone, circle } for backend.
 */
const CREATE = "create-district/";
const LIST = "list-district/";
const UPDATE = "update-district/";
const DELETE_PATH = "delete-district/";

export async function listDistricts(divisionId) {
  const params = divisionId != null ? { circle: String(divisionId) } : undefined;
  const res = await get(LIST, params);
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return data.map((row) => ({
    ...row,
    // normalize naming for existing UI
    province: row.province ?? row.zone,
    zone: row.zone ?? row.province,
    division: row.division ?? row.circle,
    circle: row.circle ?? row.division,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
    division_name: row.division_name ?? row.circle_name,
    circle_name: row.circle_name ?? row.division_name,
  }));
}

export async function getDistrictById(id) {
  const res = await get(LIST, { id: String(id) });
  const row = res?.data ?? res;
  if (!row) return null;
  return {
    ...row,
    province: row.province ?? row.zone,
    zone: row.zone ?? row.province,
    division: row.division ?? row.circle,
    circle: row.circle ?? row.division,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
    division_name: row.division_name ?? row.circle_name,
    circle_name: row.circle_name ?? row.division_name,
  };
}

export async function createDistrict(payload) {
  const district_name = String(payload?.district_name ?? "").trim();
  const zone = Number(payload?.province ?? payload?.zone);
  const circle = Number(payload?.division ?? payload?.circle);
  return post(CREATE, { district_name, zone, circle });
}

/** Update district by id. Body: { district_name, division, province } (ids from list-province / list-division). */
export async function updateDistrict(id, payload) {
  const body = {};
  if (payload?.district_name !== undefined) body.district_name = String(payload.district_name).trim();
  if (payload?.province !== undefined || payload?.zone !== undefined) body.zone = Number(payload?.province ?? payload?.zone);
  if (payload?.division !== undefined || payload?.circle !== undefined) body.circle = Number(payload?.division ?? payload?.circle);
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteDistrict(id) {
  await del(`${DELETE_PATH}${id}/`);
}
