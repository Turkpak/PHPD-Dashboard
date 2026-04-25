 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { get, post, put, del, request } from "./client";







import { boundaryFileToGeojson } from "@/utils/boundaryToGeojson";
import { mockProjects } from "./mockData";

/** POST /api/create-project/ — multipart: stakeholder, project_name, ..., xer_file, boundary_file */
const CREATE = "create-project/";
/** GET /api/list-project/ — returns GeoJSON FeatureCollection; we normalize to Project[] for the UI */
const LIST = "list-project/";
const UPDATE = "update-project/";
const DELETE_PATH = "delete-project/";
const TOP_PROJECTS = "top-projects/";

function normalizeProjectFeature(f



) {
  const props = (_nullishCoalesce(f.properties, () => ( f))) ;
  const geom = _nullishCoalesce((f ).geometry, () => ( props.geom));
  const project = {
    id: (_nullishCoalesce(f.id, () => ( props.id))) ,
    ...(props ),
    ...(geom !== undefined && { geom }),
  } ;

  // Normalize activities shape so UI can rely on ONE approach:
  // percent_complete + finish_date (legacy naming) regardless of backend serializer keys.
  if (Array.isArray((project ).activities)) {
    (project ).activities = (project ).activities.map((a) => {
      const percent_complete =
        _nullishCoalesce(_nullishCoalesce(_optionalChain([a, 'optionalAccess', _ => _.percent_complete]), () => ( _optionalChain([a, 'optionalAccess', _2 => _2.progress]))), () => ( 0));
      const finish_date =
        _nullishCoalesce(_nullishCoalesce(_optionalChain([a, 'optionalAccess', _3 => _3.finish_date]), () => ( _optionalChain([a, 'optionalAccess', _4 => _4.end_date]))), () => ( null));
      return { ...a, percent_complete, finish_date };
    });
  }
  return project;
}

export async function listProjects() {
  try {
    const data = await get(LIST);
    if (!data) return [];
    if (typeof data === "object" && "features" in data && Array.isArray((data ).features)) {
      return (data ).features.map((f) => normalizeProjectFeature(f));
    }
    if (Array.isArray(data)) {
      return data.map((f) => normalizeProjectFeature(f ));
    }
    return [];
  } catch {
    // Temporary fallback so dashboard/maps/pages can render without backend.
    return mockProjects.map((p) => ({
      ...p,
      project_reference_no: p.project_reference_no ?? `REF-${p.id}`,
    }));
  }
}

/** GET /api/top-projects/ — returns list of top projects with progress % */
export async function listTopProjects() {
  const data = await get(TOP_PROJECTS);
  return Array.isArray(data) ? data : [];
}

export async function getProjectById(id) {
  const data = await get(LIST, { id: String(id) });
  if (data == null) return null;
  let raw = data;
  // Some endpoints nest again: { data: GeoJSON Feature }
  if (
    typeof raw === "object" &&
    raw !== null &&
    "data" in raw &&
    typeof (raw ).data === "object" &&
    (raw ).data !== null &&
    "properties" in ((raw ).data )
  ) {
    raw = (raw ).data;
  }
  if (typeof raw === "object" && raw !== null && "properties" in raw) {
    return normalizeProjectFeature(raw );
  }
  return raw ;
}

function appendFormValue(form, key, value) {
  if (value === undefined || value === null) return;
  if (value instanceof File) {
    form.append(key, value);
    return;
  }
  form.append(key, String(value));
}

/** Django `DateField` expects `YYYY-MM-DD` or null; never send `""` (400 validation). */
function normalizeDateFieldForApi(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const head = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  return null;
}

function sanitizeProjectDates(payload) {
  const out = { ...payload } ;
  for (const key of ["project_starting_date", "pifra_utilization_date"] ) {
    if (key in out) {
      (out )[key] = normalizeDateFieldForApi(out[key]);
    }
  }
  return out;
}

export async function createProject(payload) {
  const hasFiles = payload.xer_file != null || payload.boundary_file != null;

  if (hasFiles) {
    const form = new FormData();
    appendFormValue(form, "stakeholder", payload.stakeholder);
    appendFormValue(form, "project_name", _nullishCoalesce(payload.project_name, () => ( "")));
    appendFormValue(form, "category", _nullishCoalesce(payload.category, () => ( "")));
    appendFormValue(form, "project_description", _nullishCoalesce(payload.project_description, () => ( "")));
    appendFormValue(
      form,
      "project_starting_date",
      _nullishCoalesce(normalizeDateFieldForApi(payload.project_starting_date), () => ( undefined)),
    );
    appendFormValue(form, "project_reference_no", _nullishCoalesce(payload.project_reference_no, () => ( "")));
    appendFormValue(form, "latitude_coordinates", _nullishCoalesce(payload.latitude_coordinates, () => ( "")));
    appendFormValue(form, "longitude_coordinates", _nullishCoalesce(payload.longitude_coordinates, () => ( "")));
    appendFormValue(form, "zone", _nullishCoalesce(payload.zone, () => ( "")));
    appendFormValue(form, "circle", _nullishCoalesce(payload.circle, () => ( "")));
    appendFormValue(form, "province", payload.province);
    appendFormValue(form, "division", payload.division);
    appendFormValue(form, "district", payload.district);
    appendFormValue(form, "tehsil", payload.tehsil);
    appendFormValue(form, "total_budget_allocated", _nullishCoalesce(payload.total_budget_allocated, () => ( "")));
    appendFormValue(form, "budget_utilized", _nullishCoalesce(payload.budget_utilized, () => ( "")));
    appendFormValue(form, "allocation_capital_cost", payload.allocation_capital_cost);
    appendFormValue(form, "allocation_revenue_cost", payload.allocation_revenue_cost);
    appendFormValue(form, "allocation_total_cost", payload.allocation_total_cost);
    appendFormValue(form, "pd_release_capital_cost", payload.pd_release_capital_cost);
    appendFormValue(form, "pd_release_cost", payload.pd_release_cost);
    appendFormValue(form, "pd_release_total_cost", payload.pd_release_total_cost);
    appendFormValue(form, "spending_release_capital_cost", payload.spending_release_capital_cost);
    appendFormValue(form, "spending_release_revenue_cost", payload.spending_release_revenue_cost);
    appendFormValue(form, "spending_release_total_cost", payload.spending_release_total_cost);
    appendFormValue(form, "pifra_utilization_capital_cost", payload.pifra_utilization_capital_cost);
    appendFormValue(form, "pifra_utilization_revenue_cost", payload.pifra_utilization_revenue_cost);
    appendFormValue(form, "pifra_utilization_total_cost", payload.pifra_utilization_total_cost);
    appendFormValue(
      form,
      "pifra_utilization_date",
      _nullishCoalesce(normalizeDateFieldForApi(payload.pifra_utilization_date), () => ( undefined)),
    );
    appendFormValue(form, "percentage_utilization_capital", payload.percentage_utilization_capital);
    appendFormValue(form, "percentage_utilization_revenue", payload.percentage_utilization_revenue);
    appendFormValue(form, "percentage_utilization_total", payload.percentage_utilization_total);

    if (payload.xer_file) form.append("xer_file", payload.xer_file);

    let boundaryFile = _nullishCoalesce(payload.boundary_file, () => ( null));
    if (boundaryFile) {
      boundaryFile = await boundaryFileToGeojson(boundaryFile);
      form.append("boundary_file", boundaryFile);
    }

    return request(CREATE, { method: "POST", formData: form });
  }

  return post(
    CREATE,
    sanitizeProjectDates({
    stakeholder: payload.stakeholder,
    project_name: _nullishCoalesce(payload.project_name, () => ( null)),
    category: _nullishCoalesce(payload.category, () => ( null)),
    project_description: _nullishCoalesce(payload.project_description, () => ( null)),
    project_starting_date: _nullishCoalesce(payload.project_starting_date, () => ( null)),
    project_reference_no: _nullishCoalesce(payload.project_reference_no, () => ( null)),
    latitude_coordinates: _nullishCoalesce(payload.latitude_coordinates, () => ( null)),
    longitude_coordinates: _nullishCoalesce(payload.longitude_coordinates, () => ( null)),
    zone: _nullishCoalesce(payload.zone, () => ( null)),
    circle: _nullishCoalesce(payload.circle, () => ( null)),
    province: payload.province,
    division: payload.division,
    district: payload.district,
    tehsil: payload.tehsil,
    total_budget_allocated: _nullishCoalesce(payload.total_budget_allocated, () => ( null)),
    budget_utilized: _nullishCoalesce(payload.budget_utilized, () => ( null)),
    allocation_capital_cost: _nullishCoalesce(payload.allocation_capital_cost, () => ( null)),
    allocation_revenue_cost: _nullishCoalesce(payload.allocation_revenue_cost, () => ( null)),
    allocation_total_cost: _nullishCoalesce(payload.allocation_total_cost, () => ( null)),
    pd_release_capital_cost: _nullishCoalesce(payload.pd_release_capital_cost, () => ( null)),
    pd_release_cost: _nullishCoalesce(payload.pd_release_cost, () => ( null)),
    pd_release_total_cost: _nullishCoalesce(payload.pd_release_total_cost, () => ( null)),
    spending_release_capital_cost: _nullishCoalesce(payload.spending_release_capital_cost, () => ( null)),
    spending_release_revenue_cost: _nullishCoalesce(payload.spending_release_revenue_cost, () => ( null)),
    spending_release_total_cost: _nullishCoalesce(payload.spending_release_total_cost, () => ( null)),
    pifra_utilization_capital_cost: _nullishCoalesce(payload.pifra_utilization_capital_cost, () => ( null)),
    pifra_utilization_revenue_cost: _nullishCoalesce(payload.pifra_utilization_revenue_cost, () => ( null)),
    pifra_utilization_total_cost: _nullishCoalesce(payload.pifra_utilization_total_cost, () => ( null)),
    pifra_utilization_date: _nullishCoalesce(payload.pifra_utilization_date, () => ( null)),
    percentage_utilization_capital: _nullishCoalesce(payload.percentage_utilization_capital, () => ( null)),
    percentage_utilization_revenue: _nullishCoalesce(payload.percentage_utilization_revenue, () => ( null)),
    percentage_utilization_total: _nullishCoalesce(payload.percentage_utilization_total, () => ( null)),
    } ),
  );
}

export async function updateProject(id, payload) {
  const hasFiles = (payload ).xer_file != null || (payload ).boundary_file != null;
  if (hasFiles) {
    const p = payload ;
    const form = new FormData();

    // Core fields (append only if present to keep partial update semantics)
    if (Array.isArray(p.stakeholder)) {
      for (const sid of p.stakeholder) appendFormValue(form, "stakeholder", sid);
    } else {
      appendFormValue(form, "stakeholder", p.stakeholder);
    }
    appendFormValue(form, "project_name", p.project_name);
    appendFormValue(form, "category", p.category);
    appendFormValue(form, "project_description", p.project_description);
    appendFormValue(form, "project_starting_date", _nullishCoalesce(normalizeDateFieldForApi(p.project_starting_date), () => ( undefined)));
    appendFormValue(form, "project_reference_no", p.project_reference_no);
    appendFormValue(form, "latitude_coordinates", p.latitude_coordinates);
    appendFormValue(form, "longitude_coordinates", p.longitude_coordinates);
    appendFormValue(form, "zone", p.zone);
    appendFormValue(form, "circle", p.circle);
    appendFormValue(form, "province", p.province);
    appendFormValue(form, "division", p.division);
    appendFormValue(form, "district", p.district);
    appendFormValue(form, "tehsil", p.tehsil);

    appendFormValue(form, "total_budget_allocated", p.total_budget_allocated);
    appendFormValue(form, "budget_utilized", p.budget_utilized);
    appendFormValue(form, "budget_variance", p.budget_variance);
    appendFormValue(form, "budget_remaining", p.budget_remaining);

    // Financial breakdown fields (optional)
    for (const key of [
      "allocation_capital_cost",
      "allocation_revenue_cost",
      "allocation_total_cost",
      "pd_release_capital_cost",
      "pd_release_cost",
      "pd_release_total_cost",
      "spending_release_capital_cost",
      "spending_release_revenue_cost",
      "spending_release_total_cost",
      "pifra_utilization_capital_cost",
      "pifra_utilization_revenue_cost",
      "pifra_utilization_total_cost",
      "pifra_utilization_date",
      "percentage_utilization_capital",
      "percentage_utilization_revenue",
      "percentage_utilization_total",
    ] ) {
      if (key === "pifra_utilization_date") {
        appendFormValue(form, key, _nullishCoalesce(normalizeDateFieldForApi(p[key]), () => ( undefined)));
      } else {
        appendFormValue(form, key, p[key]);
      }
    }

    if (p.xer_file) form.append("xer_file", p.xer_file);

    let boundaryFile = _nullishCoalesce(p.boundary_file, () => ( null));
    if (boundaryFile) {
      boundaryFile = await boundaryFileToGeojson(boundaryFile);
      form.append("boundary_file", boundaryFile);
    }

    return request(`${UPDATE}${id}/`, { method: "PUT", formData: form });
  }

  return put(`${UPDATE}${id}/`, sanitizeProjectDates({ ...payload } ) );
}

export async function deleteProject(id) {
  await del(`${DELETE_PATH}${id}/`);
}
