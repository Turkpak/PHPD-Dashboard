 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";









const EMPTY_PERMISSION = {
  can_view: false,
  can_create: false,
  can_update: false,
  can_delete: false,
};

function isSuperAdmin(role) {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return r === "super_admin" || r === "super admin";
}

/**
 * Returns permission helpers based on the current user's login response (permissions array).
 * Super_admin bypasses: all pages get full access.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = (_nullishCoalesce(_optionalChain([user, 'optionalAccess', _ => _.role]), () => ( ""))).trim().toLowerCase();
  const superAdmin = isSuperAdmin(_nullishCoalesce(_optionalChain([user, 'optionalAccess', _2 => _2.role]), () => ( undefined)));
  const permissions = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _3 => _3.permissions]), () => ( []));

  const getPermission = useMemo(
    () =>
      (sidebarLabel, subLabel) => {
        if (superAdmin) {
          return {
            can_view: true,
            can_create: true,
            can_update: true,
            can_delete: true,
          };
        }
        const sub = _nullishCoalesce(subLabel, () => ( ""));
        const perm = permissions.find(
          (p) =>
            p.sidebar_label === sidebarLabel && (_nullishCoalesce(p.sub_label, () => ( ""))) === sub
        );
        if (!perm) return EMPTY_PERMISSION;
        return {
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
        };
      },
    [superAdmin, permissions]
  );

  const canView = useMemo(
    () => (sidebarLabel, subLabel) =>
      getPermission(sidebarLabel, _nullishCoalesce(subLabel, () => ( null))).can_view,
    [getPermission]
  );

  return { getPermission, canView, isSuperAdmin: superAdmin };
}
