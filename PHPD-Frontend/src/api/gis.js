import { get } from "./client";

const GIS_PROJECT_STATUS_PATH = "gis-project-status/";

/**
 * GET /api/gis-project-status/
 *
 * Lightweight status-only dataset for the GIS dashboard. This intentionally
 * replaces the much larger project-gantt-all response on /gis.
 */
export async function getGISProjectStatuses() {
  const data = await get(GIS_PROJECT_STATUS_PATH);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.statuses)) return data.statuses;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}
