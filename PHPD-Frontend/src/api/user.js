 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get, post, put } from "./client";








const CREATE = "create-user/";
const LIST = "get-user/";
const USER_PERMISSIONS = "user-permissions/";

/**
 * GET /api/user-permissions/ — list all users with their page permissions (super_admin only).
 * Returns array of { user_id, full_name, email, role, permissions[] }.
 */
export async function getUsersWithPermissions() {
  const data = await get(USER_PERMISSIONS);
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/get-user/ — list all users (no query params).
 */
export async function listUsers() {
  const data = await get(LIST);
  return Array.isArray(data) ? data : [];
}

/**
 * POST /api/create-user/ — create user.
 * Body: email, first_name, last_name, password, role, stakeholder
 */
export async function createUser(payload) {
  const body = {
    email: payload.email.trim(),
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    password: payload.password,
    role: payload.role,
    stakeholder: payload.stakeholder,
    company_name: _nullishCoalesce(payload.company_name, () => ( "SafeCity")),
  };
  if (payload.permissions != null) {
    body.permissions = payload.permissions;
  }
  return post(CREATE, body);
}

/**
 * POST /api/user-permissions/ — assign page CRUD permissions to a user (super_admin only).
 * Body: user, sidebar_label, sub_label?, can_view, can_create, can_update, can_delete
 */
export async function createUserPermission(
  payload
) {
  const body = {
    user: payload.user,
    sidebar_label: payload.sidebar_label,
    can_view: payload.can_view,
    can_create: payload.can_create,
    can_update: payload.can_update,
    can_delete: payload.can_delete,
  };
  if (payload.sub_label != null && payload.sub_label !== "") {
    body.sub_label = payload.sub_label;
  }
  return post(USER_PERMISSIONS, body);
}

/**
 * PUT /api/user-permissions/:id/ — update page CRUD permissions (super_admin only).
 * Body: user, sidebar_label, sub_label?, can_view, can_create, can_update, can_delete (full object).
 */
export async function updateUserPermission(
  id,
  payload
) {
  const body = {
    user: payload.user,
    sidebar_label: payload.sidebar_label,
    can_view: payload.can_view,
    can_create: payload.can_create,
    can_update: payload.can_update,
    can_delete: payload.can_delete,
  };
  if (payload.sub_label != null && payload.sub_label !== "") {
    body.sub_label = payload.sub_label;
  }
  return put(`${USER_PERMISSIONS}${id}/`, body);
}
