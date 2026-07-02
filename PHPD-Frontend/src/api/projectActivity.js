import { get, post, put, del } from "./client";
import { mockGanttSchedulesForProjects, mockProjects } from "./mockData";






const CREATE_PATH = "create-project-activity/";
/** GET /api/list-project-activity/?project=<id> â€” DB activities (not GeoJSON list-project). */
const LIST_ACTIVITIES_PATH = "list-project-activity/";
const UPDATE_PATH = "update-project-activity/";
const DELETE_PATH = "delete-project-activity/";

export async function listProjectActivities(
  projectId,
) {
  // ListProjectActivityView.list() expects query param `project` (project PK).
  const params = projectId != null ? { project: String(projectId) } : undefined;
  const data = await get(LIST_ACTIVITIES_PATH, params);
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

export async function createProjectActivity(
  payload,
) {
  // backend accepts all fields as plain body
  return post(CREATE_PATH, payload );
}

export async function updateProjectActivity(
  id,
  payload,
) {
  return put(`${UPDATE_PATH}${id}/`, payload );
}

export async function deleteProjectActivity(id) {
  await del(`${DELETE_PATH}${id}/`);
}





































































/** GET /api/project-gantt-all/ â€” schedules for all projects (nested tasks) */
export async function getProjectGanttAll() {
  try {
    const data = await get("project-gantt-all/");
    const schedules = Array.isArray((data )?.schedules) ? (data ).schedules : [];
    return schedules ;
  } catch {
    // Temporary fallback for Dashboard/Comparison progress calculations.
    return mockGanttSchedulesForProjects(mockProjects);
  }
}

export async function getProjectGanttData(projectId) {
  if (!projectId) return [];

  // New API (nested): /api/project-gantt-nested/:id/
  // Old API (flat):   /api/project-gantt/:id/
  // We prefer the new nested endpoint, but keep a safe fallback.
  const data = await get(`project-gantt-nested/${projectId}/`);

  const asDate = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    if (!s) return null;
    const t = new Date(s).getTime();
    return Number.isFinite(t) ? s : null;
  };

  const rollupRange = (node) => {
    const ownStart = asDate(node?.start_date);
    const ownEnd = asDate(node?.end_date) ?? ownStart;
    const children = Array.isArray(node?.subtasks) ? node.subtasks : [];
    if (children.length === 0) return { start: ownStart, end: ownEnd };

    let minStart = ownStart ? new Date(ownStart).getTime() : null;
    let maxEnd = ownEnd ? new Date(ownEnd).getTime() : null;
    for (const c of children) {
      const r = rollupRange(c);
      const cs = r.start ? new Date(r.start).getTime() : null;
      const ce = r.end ? new Date(r.end).getTime() : null;
      if (cs != null) minStart = minStart == null ? cs : Math.min(minStart, cs);
      if (ce != null) maxEnd = maxEnd == null ? ce : Math.max(maxEnd, ce);
    }
    return {
      start: minStart != null ? new Date(minStart).toISOString().slice(0, 10) : null,
      end: maxEnd != null ? new Date(maxEnd).toISOString().slice(0, 10) : null,
    };
  };

  const out = [];
  let orderCounter = 0;
  const flattenNested = (node, parent) => {
    const id = String((node?._id ?? node?.id) ?? "");
    if (!id) return;
    const range = rollupRange(node);
    out.push({
      id,
      activity_id: node?.activity_id ? String(node.activity_id) : undefined,
      db_id: typeof node?.id === "number" ? node.id : node?.id ? Number(node.id) : undefined,
      label: String((node?.name ?? node?.activity_name) ?? `#${id}`),
      duration: typeof node?.duration === "number" && Number.isFinite(node.duration) ? node.duration : undefined,
      duration_display: typeof node?.duration_display === "string" ? node.duration_display : undefined,
      progress_status: typeof node?.progress_status === "string" ? node.progress_status : node?.progress_status ?? null,
      start: range.start,
      end: range.end,
      actual_start: asDate(node?.actual_start),
      actual_end: asDate(node?.actual_end),
      progress_date: asDate(node?.progress_date),
      progress: typeof node?.progress === "number" && Number.isFinite(node.progress) ? node.progress : 0,
      parent,
      order: orderCounter++,
      has_delay: Boolean(node?.has_delay),
      delay_info: node?.delay_info ?? undefined,
    });
    const children = Array.isArray(node?.subtasks) ? node.subtasks : [];
    for (const c of children) flattenNested(c, id);
  };

  const schedules = Array.isArray(data?.schedules) ? data.schedules : [];
  if (schedules.length > 0 && Array.isArray(schedules[0]?.tasks)) {
    for (const t of schedules[0].tasks) flattenNested(t, undefined);
    return out;
  }

  // Fallback: if backend returned old flat schema for some reason.
  const legacy = await get(`project-gantt/${projectId}/`);
  const tasksArray = legacy?.tasks || [];
  return tasksArray.map((act, idx) => ({
    id: String(act.id),
    activity_id: act.activity_id,
    db_id: typeof act.id === "number" ? act.id : Number(act.id),
    label: act.activity_name || `#${act.activity_id}`,
    duration: typeof act.duration === "number" && Number.isFinite(act.duration) ? act.duration : undefined,
    duration_display: typeof act.duration_display === "string" ? act.duration_display : undefined,
    progress_status: typeof act.progress_status === "string" ? act.progress_status : act?.progress_status ?? null,
    start: act.start_date || null,
    end: act.end_date || act.start_date || null,
    actual_start: act.actual_start ?? null,
    actual_end: act.actual_end ?? null,
    progress: act.progress ?? 0,
    parent: act.parent_id ? String(act.parent_id) : undefined,
    order: idx,
    has_delay: Boolean(act.has_delay),
    delay_info: act.delay_info ?? undefined,
  }));
}

 









export async function updateTaskActual(
  taskId,
  payload
) {
  return put(
    `update-project-activity/${taskId}/`,
    payload 
  );
}
