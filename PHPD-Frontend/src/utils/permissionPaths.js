/**
 * Map pathname to sidebar_label + sub_label for permission checks.
 * Used by PermissionGate and Sidebar so both use the same mapping.
 */
export function getPermissionForPath(
  path
) {
  const map


 = {
    "/": { sidebar_label: "Citywise Progress", sub_label: null },
    "/finance": { sidebar_label: "Finance & Budget", sub_label: null },
    "/gis": { sidebar_label: "GIS Layers", sub_label: null },
    "/settings": { sidebar_label: "Settings", sub_label: null },
    "/province-management": {
      sidebar_label: "Area Management",
      sub_label: "Zone",
    },
    "/division-management": {
      sidebar_label: "Area Management",
      sub_label: "Circle",
    },
    "/district-management": {
      sidebar_label: "Area Management",
      sub_label: "District",
    },
    "/tehsil-management": {
      sidebar_label: "Area Management",
      sub_label: "Tehsil",
    },
    "/stakeholder-management": { sidebar_label: "Stakeholders", sub_label: null },
    "/project-management": {
      sidebar_label: "Project Management",
      sub_label: null,
    },
    "/project-management/create": {
      sidebar_label: "Project Management",
      sub_label: null,
    },
    "/project-management/view": {
      sidebar_label: "Project Management",
      sub_label: null,
    },
    "/project-activity-management": {
      sidebar_label: "Project Activities",
      sub_label: null,
    },
    "/user-management": { sidebar_label: "User Management", sub_label: null },
  };
  const exact = map[path];
  if (exact) return exact;
  if (path.startsWith("/project/"))
    return { sidebar_label: "Project Management", sub_label: null };
  return null;
}
