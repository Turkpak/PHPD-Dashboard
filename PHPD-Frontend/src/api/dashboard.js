import { get } from "./client";

const PAGE_BY_VIEW = {
  divisions: "zones",
  districts: "circles",
  tehsils: "tehsils",
  projects: "projects",
};

const normalizeDivision = (row) => ({
  ...row,
  division_name: row.division_name ?? row.zone_name,
  zone_name: row.zone_name ?? row.division_name,
});

const normalizeDistrict = (row) => ({
  ...row,
  // Dashboard semantic hierarchy is Zone -> Circle -> Tehsil.
  district_name: row.district_name ?? row.circle_name,
  division: row.division ?? row.zone,
  circle: row.circle ?? row.id,
  circle_name: row.circle_name ?? row.district_name,
});

const normalizeTehsil = (row) => ({
  ...row,
  division: row.division ?? row.zone,
  // Dashboard uses `district` as the selected Circle id for backward compatibility.
  // Prefer the explicit Circle fields so a real District FK cannot overwrite the dashboard hierarchy.
  district: row.circle ?? row.district,
  district_name: row.circle_name ?? row.district_name,
});

const normalizeProject = (row) => ({
  ...row,
  // Keep existing Dashboard.jsx aliases while using correct hierarchy IDs.
  division: row.zone,
  division_name: row.zone_name,
  district: row.circle,
  district_name: row.circle_name,
  total_budget_allocated: row.total_budget ?? 0,
  budget_utilized: row.total_consume ?? 0,
  physical_progress: Number(row.physical_progress ?? 0),
  financial_progress: Number(row.financial_progress ?? 0),
  overall_progress: Number(row.overall_progress ?? 0),
});

export async function getDashboardPageData(viewType = "divisions") {
  const page = PAGE_BY_VIEW[viewType] || "zones";
  const response = await get(`dashboard/${page}/`);
  const data = response?.data ?? response ?? {};

  return {
    page: data.page ?? page,
    summary: data.summary ?? {},
    financialChart: data.financial_chart ?? { planned: 100, actual: 0, variance: 100 },
    physicalChart: data.physical_chart ?? { planned: 100, actual: 0, variance: 100 },
    bestPerformingProjects: Array.isArray(data.best_performing_projects)
      ? data.best_performing_projects.map(normalizeProject)
      : [],
    topHierarchy: Array.isArray(data.top_hierarchy) ? data.top_hierarchy : [],
    mapProjects: Array.isArray(data.map_projects)
      ? data.map_projects.map(normalizeProject)
      : [],
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
