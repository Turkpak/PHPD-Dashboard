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
 * Returns permission helpers based on the current user's login response.
 * Super_admin bypasses all checks — every page gets full access.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role ?? "").trim().toLowerCase();
  const superAdmin = isSuperAdmin(user?.role ?? undefined);
  const permissions = user?.permissions ?? [];

  const getPermission = useMemo(
    () =>
      (sidebarLabel, subLabel) => {
        if (superAdmin) {
          return { can_view: true, can_create: true, can_update: true, can_delete: true };
        }
        const sub = subLabel ?? "";
        const perm = permissions.find(
          (p) => p.sidebar_label === sidebarLabel && (p.sub_label ?? "") === sub
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
    () => (sidebarLabel, subLabel) => getPermission(sidebarLabel, subLabel ?? null).can_view,
    [getPermission]
  );

  return { getPermission, canView, isSuperAdmin: superAdmin };
}
