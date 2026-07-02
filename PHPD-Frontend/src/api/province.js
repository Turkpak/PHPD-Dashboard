import { get, post, put, del } from "./client";

const CREATE_PATH = "create-zone/";
const LIST = "list-zone/";
const UPDATE = "update-zone/";
const DELETE_PATH = "delete-zone/";

export async function listProvinces() {
  const data = await get(LIST);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    ...row,
    province_name: row.province_name ?? row.zone_name,
    zone_name: row.zone_name ?? row.province_name,
  }));
}

export async function getProvinceById(id) {
  const data = await get(LIST, { id: String(id) });
  return data ?? null;
}

export async function createProvince(payload) {
  const name = String(payload?.province_name ?? payload?.zone_name ?? "").trim();
  return post(CREATE_PATH, { zone_name: name });
}

export async function updateProvince(id, payload) {
  const hasName = payload?.province_name !== undefined || payload?.zone_name !== undefined;
  const name = String(payload?.province_name ?? payload?.zone_name ?? "").trim();
  const body = hasName ? { zone_name: name } : {};
  return put(`${UPDATE}${id}/`, body);
}

export async function deleteProvince(id) {
  await del(`${DELETE_PATH}${id}/`);
}
