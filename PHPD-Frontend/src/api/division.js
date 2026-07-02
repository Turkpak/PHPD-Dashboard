 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put, del } from "./client";


/**
 * This module powers the frontend "Circle" UI (currently routed at /division-management).
 * Backend routes are create-circle/list-circle/update-circle/delete-circle.
 *
 * Client payload/fields are normalized to { division_name, province } on the frontend
 * to minimize churn in existing pages; we translate to { circle_name, zone } for backend.
 */
const CREATE = "create-circle/";
const LIST = "list-circle/";
const UPDATE = "update-circle/";
const DELETE_PATH = "delete-circle/";

export async function listDivisions(provinceId) {
  const params = provinceId != null ? { zone: String(provinceId) } : undefined;
  const res = await get(LIST, params);
  // Backend wraps responses in {status,message,data}
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return data.map((row) => ({
    ...row,
    // normalize names so existing UI can keep using division/province naming
    division_name: row.division_name ?? row.circle_name,
    circle_name: row.circle_name ?? row.division_name,
    province: row.province ?? row.zone,
    zone: row.zone ?? row.province,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
  }));
}

export async function getDivisionById(id) {
  const res = await get(LIST, { id: String(id) });
  const row = res?.data ?? res;
  if (!row) return null;
  return {
    ...row,
    division_name: row.division_name ?? row.circle_name,
    circle_name: row.circle_name ?? row.division_name,
    province: row.province ?? row.zone,
    zone: row.zone ?? row.province,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
  };
}

export async function createDivision(payload) {
  const circle_name = String(payload?.division_name ?? payload?.circle_name ?? "").trim();
  const zone = Number(payload?.province ?? payload?.zone);
  return post(CREATE, { circle_name, zone });
}

export async function updateDivision(id, payload) {
  const body = {};
  if (payload?.division_name !== undefined || payload?.circle_name !== undefined) {
    body.circle_name = String(payload?.division_name ?? payload?.circle_name ?? "").trim();
  }
  if (payload?.province !== undefined || payload?.zone !== undefined) {
    body.zone = Number(payload?.province ?? payload?.zone);
  }
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteDivision(id) {
  await del(`${DELETE_PATH}${id}/`);
}
