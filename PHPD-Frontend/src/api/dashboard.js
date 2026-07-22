import { get } from "./client";

const PAGE_BY_VIEW = {
  divisions: "zones",
  districts: "circles",
  tehsils: "tehsils",
  projects: "projects",
};

const normalizeDivision = (row) => ({
  ...row,
  division_name: row.division_name ?? row.circle_name,
  circle_name: row.circle_name ?? row.division_name,
  province: row.province ?? row.zone,
  zone: row.zone ?? row.province,
  province_name: row.province_name ?? row.zone_name,
  zone_name: row.zone_name ?? row.province_name,
});

const normalizeDistrict = (row) => ({
  ...row,
  province: row.province ?? row.zone,
  zone: row.zone ?? row.province,
  division: row.division ?? row.circle,
  circle: row.circle ?? row.division,
  province_name: row.province_name ?? row.zone_name,
  zone_name: row.zone_name ?? row.province_name,
  division_name: row.division_name ?? row.circle_name,
  circle_name: row.circle_name ?? row.division_name,
});

const normalizeTehsil = (row) => ({
  ...row,
  province: row.province ?? row.zone,
  zone: row.zone ?? row.province,
  division: row.division ?? row.circle,
  circle: row.circle ?? row.division,
  province_name: row.province_name ?? row.zone_name,
  zone_name: row.zone_name ?? row.province_name,
  division_name: row.division_name ?? row.circle_name,
  circle_name: row.circle_name ?? row.division_name,
});

const normalizeProject = (row) => ({
  ...row,
  division: row.division ?? row.circle,
  circle: row.circle ?? row.division,
  division_name: row.division_name ?? row.circle_name,
  circle_name: row.circle_name ?? row.division_name,
  total_budget_allocated:
    row.total_budget_allocated ?? row.total_budget ?? 0,
  budget_utilized: row.budget_utilized ?? row.total_consume ?? 0,
});

export async function getDashboardPageData(viewType = "divisions") {
  const page = PAGE_BY_VIEW[viewType] || "zones";
  const response = await get(`dashboard/${page}/`);
  const data = response?.data ?? response ?? {};

  return {
    page: data.page ?? page,
    divisions: Array.isArray(data.divisions)
      ? data.divisions.map(normalizeDivision)
      : [],
    districts: Array.isArray(data.districts)
      ? data.districts.map(normalizeDistrict)
      : [],
    tehsils: Array.isArray(data.tehsils)
      ? data.tehsils.map(normalizeTehsil)
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map(normalizeProject)
      : [],
    projectGanttAll: Array.isArray(data.project_gantt_all)
      ? data.project_gantt_all
      : [],
  };
}
