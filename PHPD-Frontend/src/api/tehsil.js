import { get, post, put, del } from "./client";


/**
 * This module powers the frontend "Tehsil" UI.
 * Backend routes are create-tehsil/list-tehsil/update-tehsil/delete-tehsil.
 *
 * Client payload/fields are normalized to { tehsil_name, province, division, district } on the frontend
 * to minimize churn; we translate to { tehsil_name, zone, circle, district } for backend.
 */
const CREATE = "create-tehsil/";
const LIST = "list-tehsil/";
const UPDATE = "update-tehsil/";
const DELETE_PATH = "delete-tehsil/";

export async function listTehsils(districtId) {
  const params = districtId != null ? { district: String(districtId) } : undefined;
  const res = await get(LIST, params);
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return data.map((row) => ({
    ...row,
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

export async function getTehsilById(id) {
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

export async function createTehsil(payload) {
  const tehsil_name = String(payload?.tehsil_name ?? "").trim();
  const zone = Number(payload?.zone ?? payload?.province);
  const circle = Number(payload?.circle ?? payload?.division);
  const district = Number(payload?.district);
  return post(CREATE, { tehsil_name, zone, circle, district });
}

export async function updateTehsil(id, payload) {
  const body = {};
  if (payload?.tehsil_name !== undefined) body.tehsil_name = String(payload.tehsil_name).trim();
  if (payload?.zone !== undefined || payload?.province !== undefined) body.zone = Number(payload?.zone ?? payload?.province);
  if (payload?.circle !== undefined || payload?.division !== undefined) body.circle = Number(payload?.circle ?? payload?.division);
  if (payload?.district !== undefined) body.district = Number(payload.district);
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteTehsil(id) {
  await del(`${DELETE_PATH}${id}/`);
}
