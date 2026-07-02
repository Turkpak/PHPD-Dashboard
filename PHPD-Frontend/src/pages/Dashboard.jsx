import React from "react";

// Transpiler-compatibility helpers (nullish coalesce + optional chain)
const _nullishCoalesce = (lhs, rhsFn) => lhs != null ? lhs : rhsFn();
const _optionalChain = (ops) => {
  let lastAccessLHS;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i];
    const fn = ops[i + 1];
    i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) return undefined;
    if (op === "access" || op === "optionalAccess") { lastAccessLHS = value; value = fn(value); }
    else if (op === "call" || op === "optionalCall") { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; }
  }
  return value;
};

import { Layout } from "@/components/layout/Layout";
import { InstallationCard } from "@/components/dashboard/InstallationCard";

import { PhaseDistributionChart } from "@/components/dashboard/PhaseDistributionChart";
import { PhaseTimelineChart } from "@/components/dashboard/PhaseTimelineChart";
import { PlannedVsActualChart } from "@/components/dashboard/PlannedVsActualChart";
import { HierarchyCard } from "@/components/dashboard/HierarchyCard";
import { CityMap } from "@/components/dashboard/CityMap";
import { CityCompletionChart } from "@/components/comparison/CityCompletionChart";

import { MilestoneDetailsPanel } from "@/components/dashboard/MilestoneDetailsPanel";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label as RechartsLabel,
} from "recharts";
import { useWindowSize } from "@/hooks/use-window-size";
import { CardHeader, CardTitle, } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  listProvinces,
  getProjectGanttAll,
  getProjectGanttData,
  listDivisions,
  listDistricts,
  listTehsils,
} from "@/api";

import {
  ClipboardCheck,
  Building2,
  Camera,
  Zap,
  Home,
  Radio,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  DollarSign,
  FolderKanban,
  Info,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listProjects, } from "@/api/project";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

// Installation progress data

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function safeParseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildMonthLabelsBetween(minDate, maxDate) {
  const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const labels = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    labels.push(_nullishCoalesce(MONTH_LABELS[cursor.getMonth()], () => ("Jan")));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return labels;
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function diffDaysInclusive(start, end) {
  const s = safeParseDate(_nullishCoalesce(start, () => (null)));
  const e = safeParseDate(_nullishCoalesce(end, () => (null)));
  if (!s || !e) return 1;
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

function buildPhaseFromProjectGantt(
  tasks,
  options,
) {
  const planned = 100;
  if (!tasks || tasks.length === 0) {
    return { actual: 0, planned, subProjects: [], timeline: [] };
  }











  // 1) Filter out null-date rows (exclude from chart entirely)
  const datedRows = [];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t) continue;
    if (!t.start || !t.end) continue;
    datedRows.push({
      id: String(t.id),
      name: t.label,
      progress: clamp01(Number(_nullishCoalesce(t.progress, () => (0)))),
      plannedProgress: planned,
      start: t.start,
      end: t.end,
      parentId: t.parent ? String(t.parent) : undefined,
    });
  }

  if (datedRows.length === 0) {
    return { actual: 0, planned, subProjects: [], timeline: [] };
  }

  // Lookup by id (uses API order preference naturally because we traverse `tasks`).
  const datedById = new Map();
  for (let i = 0; i < datedRows.length; i++) {
    datedById.set(datedRows[i].id, datedRows[i]);
  }

  // Optional: limit the whole phase to a single tehsil subtree based on tehsil name.
  // This prevents the WBS pie from including other geographies inside the same XER.
  const applySubtreeFilter = (subtreeRootName) => {
    if (!subtreeRootName) return null;
    const needle = subtreeRootName.trim().toLowerCase();
    if (!needle) return null;

    // Build children map across all dated rows.
    const childrenByParent = new Map();
    for (const r of datedRows) {
      const pid = r.parentId ? String(r.parentId) : undefined;
      const list = _nullishCoalesce(childrenByParent.get(pid), () => ([]));
      list.push(r);
      childrenByParent.set(pid, list);
    }

    // Candidate roots: rows whose name matches the selected tehsil name.
    const candidates = datedRows.filter((r) => r.name.trim().toLowerCase() === needle || r.name.toLowerCase().includes(needle));
    if (candidates.length === 0) return null;

    // Pick the candidate whose subtree contains the most nodes (most likely the correct tehsil node).
    const subtreeSize = (rootId) => {
      const seen = new Set();
      const queue = [rootId];
      while (queue.length) {
        const cur = queue.shift();
        if (seen.has(cur)) continue;
        seen.add(cur);
        const kids = _nullishCoalesce(childrenByParent.get(cur), () => ([]));
        for (const k of kids) queue.push(k.id);
      }
      return seen.size;
    };

    let bestRoot = null;
    let bestSize = -1;
    for (const c of candidates) {
      const size = subtreeSize(c.id);
      if (size > bestSize) {
        bestSize = size;
        bestRoot = c.id;
      }
    }

    if (!bestRoot) return null;

    // Compute all descendants ids.
    const allowed = new Set();
    const stack = [bestRoot];
    while (stack.length) {
      const cur = stack.pop();
      if (allowed.has(cur)) continue;
      allowed.add(cur);
      const kids = _nullishCoalesce(childrenByParent.get(cur), () => ([]));
      for (const k of kids) stack.push(k.id);
    }

    // Mutate datedRows in place by filtering to allowed subtree.
    for (let i = datedRows.length - 1; i >= 0; i--) {
      if (!allowed.has(datedRows[i].id)) {
        datedRows.splice(i, 1);
      }
    }

    // Rebuild lookup map after filtering.
    datedById.clear();
    for (let i = 0; i < datedRows.length; i++) {
      datedById.set(datedRows[i].id, datedRows[i]);
    }

    return bestRoot;
  };

  const filteredRootId = applySubtreeFilter(_optionalChain([options, 'optionalAccess', _2 => _2.subtreeRootName]));
  if (datedRows.length === 0) {
    return { actual: 0, planned, subProjects: [], timeline: [] };
  }

  // 2) Group by parent_id
  const groupMap = new Map();
  for (let i = 0; i < datedRows.length; i++) {
    const r = datedRows[i];
    // Only child rows (with parentId) participate in grouping.
    if (!r.parentId) continue;
    const list = groupMap.get(r.parentId);
    if (list) list.push(r);
    else groupMap.set(r.parentId, [r]);
  }


  const groups = [];

  // When in tehsil scope, only show tehsil-level nodes (depth 1 under the subtree root).
  // For non-tehsil usage, keep existing behaviour.
  const depthById = new Map();
  if (filteredRootId) {
    depthById.set(filteredRootId, 0);
    const stack = [filteredRootId];
    while (stack.length) {
      const cur = stack.pop();
      const kids = _nullishCoalesce(groupMap.get(cur), () => ([]));
      for (const k of kids) {
        if (!depthById.has(k.id)) {
          depthById.set(k.id, (_nullishCoalesce(depthById.get(cur), () => (0))) + 1);
          stack.push(k.id);
        }
      }
    }
  }

  for (const [parentId, rows] of Array.from(groupMap.entries())) {
    const realParent = datedById.get(parentId);
    const header = _nullishCoalesce(realParent, () => (rows[0]));
    const children = realParent ? rows.filter((r) => r.id !== realParent.id) : rows.slice(1);

    if (filteredRootId) {
      const depth = depthById.get(header.id);
      if (depth !== 1) continue; // tehsil-level only
    }

    groups.push({ header, children });
  }

  // Stable order: by first appearance of header id in API order.
  const apiIndex = new Map();
  for (let i = 0; i < tasks.length; i++) {
    const id = String(_nullishCoalesce(_optionalChain([tasks, 'access', _3 => _3[i], 'optionalAccess', _4 => _4.id]), () => ("")));
    if (!id) continue;
    if (!apiIndex.has(id)) apiIndex.set(id, i);
  }
  groups.sort((a, b) => (_nullishCoalesce(apiIndex.get(a.header.id), () => (0))) - (_nullishCoalesce(apiIndex.get(b.header.id), () => (0))));

  const subProjects = groups.map((g) => {
    const milestones = g.children.map((c) => ({
      id: c.id,
      name: c.name,
      duration: diffDaysInclusive(c.start, c.end),
      startDate: c.start,
      finishDate: c.end,
      progress: c.progress,
      plannedProgress: c.plannedProgress,
    }));

    const dates = [];
    const hs = safeParseDate(g.header.start);
    const he = safeParseDate(g.header.end);
    if (hs) dates.push(hs);
    if (he) dates.push(he);
    for (let i = 0; i < g.children.length; i++) {
      const cs = safeParseDate(g.children[i].start);
      const ce = safeParseDate(g.children[i].end);
      if (cs) dates.push(cs);
      if (ce) dates.push(ce);
    }
    const startDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString() : g.header.start;
    const finishDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString() : g.header.end;

    return {
      id: g.header.id,
      name: g.header.name,
      actualProgress: clamp01(Number(_nullishCoalesce(g.header.progress, () => (0)))),
      plannedProgress: planned,
      // Weight is derived from total duration of direct children (data-driven, not hardcoded).
      weight: Math.max(
        0,
        milestones.reduce((sum, m) => sum + (Number(m.duration) || 0), 0),
      ),
      startDate,
      finishDate,
      milestones: milestones,
    };
  });

  // Normalize weight to 0..1 for the pie chart.
  const weightSum = subProjects.reduce((sum, sp) => sum + (Number(sp.weight) || 0), 0);
  if (weightSum > 0) {
    for (const sp of subProjects) {
      sp.weight = (sp.weight || 0) / weightSum;
    }
  } else if (subProjects.length > 0) {
    const w = 1 / subProjects.length;
    for (const sp of subProjects) sp.weight = w;
  }

  const overallActual = clamp01(
    subProjects.reduce((sum, sp) => sum + sp.actualProgress * sp.weight, 0) /
    Math.max(1e-9, subProjects.reduce((sum, sp) => sum + sp.weight, 0)),
  );

  const dates = [];
  for (const sp of subProjects) {
    const s = safeParseDate(_nullishCoalesce(sp.startDate, () => (null)));
    const e = safeParseDate(_nullishCoalesce(sp.finishDate, () => (null)));
    if (s) dates.push(s);
    if (e) dates.push(e);
  }
  if (dates.length === 0) {
    return { actual: overallActual, planned, subProjects, timeline: [] };
  }
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const months = buildMonthLabelsBetween(minDate, maxDate);
  if (months.length === 0) {
    return { actual: overallActual, planned, subProjects, timeline: [] };
  }

  const timeline = months.map((m, idx) => {
    const t = months.length === 1 ? 1 : idx / (months.length - 1);
    return {
      month: m,
      planned: Math.round(t * planned),
      actual: Math.round(t * overallActual),
    };
  });

  return { actual: overallActual, planned, subProjects, timeline };
}

// Helper function to get progress value (backward compatible)
const getProgressValue = (progress) => {
  const clampPct = (n) => Math.max(0, Math.min(100, n));
  if (typeof progress === "number") return clampPct(Number(progress) || 0);
  return clampPct(Number(progress.actual) || 0);
};

// Helper function to check if progress has detailed data
const hasDetailedProgress = (
  progress,
) => {
  return typeof progress !== "number";
};

// ---- API helpers (file-level, no component dependencies) ----

/** Calculate overall financial progress % from a list of projects */
const calcOverallProgress = (projects) => {
  const num = (v) => {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const clampPct = (n) => Math.max(0, Math.min(100, n));

  const allocated = projects.reduce(
    (acc, p) => acc + num(_optionalChain([(p), 'optionalAccess', _7 => _7.total_budget_allocated])),
    0,
  );
  const utilized = projects.reduce(
    (acc, p) => acc + num(_optionalChain([(p), 'optionalAccess', _8 => _8.budget_utilized])),
    0,
  );
  return allocated > 0 ? clampPct((utilized / allocated) * 100) : 0;
};

/** Build CityInstallationData from an overall financial progress number (API-only; no synthetic phase or timeline data). */
const generateCityDataFromOverall = (
  overall,
  _division,
  _district,
  _tehsil,
) => {
  const value = Math.min(100, Math.max(0, overall));
  return {
    surveys: value,
    foundations: value,
    cabinet: value,
    cable: value,
    controlRoom: value,
    ppic3: value,
    overall: value,
    timeline: undefined,
  };
};

// Color palette for cards
const CARD_COLORS = [
  "green",
  "blue",
  "indigo",
  "teal",
  "purple",
  "orange",
];













const getProgressRangeMeta = (overall) => {
  if (overall >= 100)
    return { label: "Fully Completed", color: "#054332", min: 100, max: 100 }; // PHPD deep green
  if (overall >= 75)
    return { label: "High Progress", color: "#10b981", min: 75, max: 100 }; // Emerald
  if (overall >= 50)
    return { label: "Good Progress", color: "#0d9488", min: 50, max: 75 }; // Teal
  if (overall >= 25)
    return { label: "Moderate Progress", color: "#f59e0b", min: 25, max: 50 }; // Amber
  return { label: "Low Progress", color: "#ef4444", min: 0, max: 25 }; // Rose
};

// --- GIS helpers (mirrors /gis behavior; kept local to dashboard) ---
function normalizeProjectGeom(geom) {
  if (geom == null) return null;
  const g = geom;
  if (g.type === "FeatureCollection" && Array.isArray(g.features)) return geom;
  if (g.type === "Feature" && g.geometry) return geom;
  if (
    g.type === "Polygon" ||
    g.type === "MultiPolygon" ||
    g.type === "Point" ||
    g.type === "LineString"
  ) {
    return { type: "Feature", geometry: g, properties: {} };
  }
  return null;
}

function walkNestedTasks(tasks, visit) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;
  for (const t of tasks) {
    visit(t);
    if (Array.isArray(t.subtasks) && t.subtasks.length > 0) {
      walkNestedTasks(t.subtasks, visit);
    }
  }
}

function deriveProjectStatusFromNestedGantt(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return "pending";
  let anyDelay = false;
  let anyProgress = false;
  let allNotStarted = true;

  walkNestedTasks(tasks, (t) => {
    if (t?.has_delay === true) anyDelay = true;
    const p = Number(t?.progress ?? 0);
    if (Number.isFinite(p) && p > 0) anyProgress = true;
    const ps = String(t?.progress_status ?? "").trim();
    if (ps !== "Not Started") allNotStarted = false;
  });

  if (anyDelay) return "in_delay";
  if (anyProgress) return "in_progress";
  if (allNotStarted) return "pending";
  return "pending";
}

function geometryBboxCenter(geometry) {
  const coords = geometry?.coordinates;
  if (!coords) return null;
  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  const walk = (v) => {
    if (!v) return;
    if (
      Array.isArray(v) &&
      v.length === 2 &&
      typeof v[0] === "number" &&
      typeof v[1] === "number"
    ) {
      const lng = v[0];
      const lat = v[1];
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) walk(x);
    }
  };
  walk(coords);

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(maxLat)
  ) {
    return null;
  }
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
}

function buildProjectsFeatureCollection(projects, statusByProjectId) {
  const features = [];
  for (const p of projects) {
    let normalized = normalizeProjectGeom(p.geom);

    // Fallback to lat/lng if geom is missing
    if (!normalized && p.latitude && p.longitude) {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        normalized = {
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: {},
        };
      }
    }

    if (!normalized) continue;
    const n = normalized;
    const baseProps = {
      id: p.id,
      project_name: p.project_name ?? `Project #${p.id}`,
      status: statusByProjectId.get(p.id) ?? "pending",
    };
    let markerAdded = false;
    if (n.type === "FeatureCollection" && Array.isArray(n.features)) {
      for (const f of n.features) {
        if (!f.geometry) continue;
        const center = geometryBboxCenter(f.geometry);
        features.push({
          type: "Feature",
          geometry: f.geometry,
          properties: {
            ...(f.properties || {}),
            ...baseProps,
            __center: center ?? undefined,
            __marker: !markerAdded,
          },
        });
        markerAdded = true;
      }
    } else if (n.type === "Feature" && n.geometry) {
      const center = geometryBboxCenter(n.geometry);
      features.push({
        type: "Feature",
        geometry: n.geometry,
        properties: {
          ...(n.properties || {}),
          ...baseProps,
          __center: center ?? undefined,
          __marker: true,
        },
      });
    }
  }
  if (features.length === 0) return null;
  return { type: "FeatureCollection", features };
}

export default function Dashboard() {
  const { isCollapsed, setCollapsed } = useSidebar();
  const sidebarPrevCollapsedRef = useRef(null);
  const [location, setLocation] = useLocation();
  const [viewType, setViewType] = useState

    ("divisions");
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState

(null);
  const [expandedDivisions, setExpandedDivisions] = useState(false);
  const [expandedDistricts, setExpandedDistricts] = useState(false);
  const [expandedTehsilGroups, setExpandedTehsilGroups] = useState

    ({});
  const [tehsilSearchQuery, setTehsilSearchQuery] = useState("");
  const [allTehsilGroupsExpanded, setAllTehsilGroupsExpanded] = useState(false);
  const [isFilterBarExpanded, setIsFilterBarExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [progressLegendOpen, setProgressLegendOpen] = useState(false);
  const [selectedMilestoneKey, setSelectedMilestoneKey] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const PROJECTS_PAGE_SIZE = 20;
  const [projectsPage, setProjectsPage] = useState(1);
  const PROJECTS_TABLE_PAGE_SIZE = 10;
  const [projectsTablePage, setProjectsTablePage] = useState(1);
  const [progressType, setProgressType] = useState(
    "physical",
  );
  // track project selection within tehsil view for KPI/Gantt
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState(null);
  const [selectedProjectGanttTasks, setSelectedProjectGanttTasks] = useState([]);
  const selectedProjectPhase = useMemo(
    () =>
      buildPhaseFromProjectGantt(selectedProjectGanttTasks, {
        subtreeRootName: selectedItemType === "tehsil" ? selectedItemName : null,
      }),
    [selectedProjectGanttTasks, selectedItemType, selectedItemName],
  );

  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  // Parent-tracking state for drill-down navigation
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [parentDivisionId, setParentDivisionId] = useState(null);
  const [parentDivisionName, setParentDivisionName] = useState(
    null,
  );
  const [parentDistrictId, setParentDistrictId] = useState(null);
  const [parentDistrictName, setParentDistrictName] = useState(
    null,
  );
  const skipNextUrlSyncRef = useRef(false);

  const EMPTY_ARRAY = useMemo(() => [], []);

  // API queries
  const { data: apiDivisions = EMPTY_ARRAY } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => listDivisions(),
  });
  const { data: apiZones = EMPTY_ARRAY } = useQuery({
    queryKey: ["zones"],
    queryFn: () => listProvinces(),
  });
  const { data: apiDistricts = EMPTY_ARRAY } = useQuery({
    queryKey: ["districts"],
    queryFn: () => listDistricts(),
  });
  const { data: apiTehsils = EMPTY_ARRAY } = useQuery({
    queryKey: ["tehsils"],
    queryFn: () => listTehsils(),
  });
  const { data: apiProjects = EMPTY_ARRAY } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  // Fetch all gantt schedules once and use root task progress for each project card.
  const { data: apiProjectGanttAll = EMPTY_ARRAY } = useQuery({
    queryKey: ["project-gantt-all"],
    queryFn: () => getProjectGanttAll(),
  });

  const ganttProgressByProjectId = useMemo(() => {
    const findNodeById = (
      nodes,
      targetId,
    ) => {
      for (const n of nodes) {
        if (String(_nullishCoalesce(_nullishCoalesce(_optionalChain([n, 'optionalAccess', _9 => _9._id]), () => (_optionalChain([n, 'optionalAccess', _10 => _10.id]))), () => (""))) === targetId) return n;
        const children = Array.isArray(_optionalChain([n, 'optionalAccess', _11 => _11.subtasks])) ? n.subtasks : [];
        const hit = children.length ? findNodeById(children, targetId) : null;
        if (hit) return hit;
      }
      return null;
    };

    const clampPct = (n) => Math.max(0, Math.min(100, n));
    const toPct = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? clampPct(n) : 0;
    };

    const map = new Map();
    for (const s of apiProjectGanttAll) {
      const pid = Number(_optionalChain([s, 'optionalAccess', _12 => _12._id]));
      if (!Number.isFinite(pid)) continue;
      const tasks = Array.isArray(_optionalChain([s, 'optionalAccess', _13 => _13.tasks])) ? s.tasks : [];
      const root = _nullishCoalesce(_nullishCoalesce(findNodeById(tasks, "1"), () => (tasks[0])), () => (null));
      map.set(pid, toPct(_optionalChain([root, 'optionalAccess', _14 => _14.progress])));
    }
    return map;
  }, [apiProjectGanttAll]);

  // Map status (delay / in progress / pending) derived from nested gantt, for GIS boundary coloring + markers.
  const projectStatusById = useMemo(() => {
    const statusByProjectId = new Map();
    for (const s of apiProjectGanttAll) {
      const pid = Number(_optionalChain([s, 'optionalAccess', _12 => _12._id]));
      if (!Number.isFinite(pid)) continue;
      const tasks = _optionalChain([s, 'optionalAccess', _13 => _13.tasks]);
      statusByProjectId.set(pid, deriveProjectStatusFromNestedGantt(tasks));
    }
    return statusByProjectId;
  }, [apiProjectGanttAll]);

  // All Projects overall % (average of root task `_id:"1"` progress across projects)
  const allProjectsOverallFromGantt = useMemo(() => {
    if (apiProjects.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const p of apiProjects) {
      const v = ganttProgressByProjectId.get(p.id);
      if (v === undefined) continue;
      sum += v;
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiProjects, ganttProgressByProjectId]);

  const zoneNameById = useMemo(() => {
    const map = new Map();
    for (const z of apiZones) map.set(Number(z.id), z.zone_name || z.province_name);
    return map;
  }, [apiZones]);

  const divisionNameById = useMemo(() => {
    const map = new Map();
    for (const d of apiDivisions) map.set(Number(d.id), d.division_name);
    return map;
  }, [apiDivisions]);

  const districtNameById = useMemo(() => {
    const map = new Map();
    for (const d of apiDistricts) map.set(Number(d.id), d.district_name);
    return map;
  }, [apiDistricts]);

  const tehsilNameById = useMemo(() => {
    const map = new Map();
    for (const t of apiTehsils) map.set(Number(t.id), t.tehsil_name);
    return map;
  }, [apiTehsils]);

  const projectsForTable = useMemo(() => {
    const rows = apiProjects.map((p) => {
      const pid = Number(p.id);
      const progressPct = _nullishCoalesce(ganttProgressByProjectId.get(pid), () => (0));
      const circleName = divisionNameById.get(Number(p.division)) || "â€”";
      const circle = apiDivisions.find((d) => Number(d.id) === Number(p.division));
      const zoneName =
        zoneNameById.get(Number(circle?.zone ?? circle?.province)) ||
        circle?.zone_name ||
        circle?.province_name ||
        "â€”";
      const distName = districtNameById.get(Number(p.district)) || "â€”";
      const tehName = tehsilNameById.get(Number(p.tehsil)) || "â€”";
      return {
        id: pid,
        name: _nullishCoalesce(p.project_name, () => (`Project #${pid}`)),
        progressPct,
        locationLabel: `${zoneName} / ${circleName} / ${distName} / ${tehName}`,
      };
    });

    rows.sort((a, b) => {
      if (b.progressPct !== a.progressPct) return b.progressPct - a.progressPct;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [apiProjects, apiDivisions, ganttProgressByProjectId, divisionNameById, districtNameById, tehsilNameById, zoneNameById]);

  const divisionCompletionData = useMemo(() => {
    if (!Array.isArray(apiDivisions) || apiDivisions.length === 0) return [];
    if (!Array.isArray(apiDistricts) || !Array.isArray(apiTehsils) || !Array.isArray(apiProjects))
      return [];

    const clamp01 = (n) => Math.max(0, Math.min(100, n));
    const avg = (values) => {
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, v) => acc + v, 0);
      return sum / values.length;
    };

    const calcProjectsOverall = (ps) => {
      let sum = 0;
      let count = 0;
      for (const p of ps) {
        const v = ganttProgressByProjectId.get(p.id);
        if (v === undefined) continue;
        sum += v;
        count++;
      }
      return count > 0 ? clamp01(sum / count) : 0;
    };

    return apiDivisions
      .map((div) => {
        const divDistricts = apiDistricts.filter((d) => d.division === div.id);
        const districtOveralls = [];

        for (const dist of divDistricts) {
          const distTehsils = apiTehsils.filter((t) => t.district === dist.id);
          const tehsilOveralls = [];

          for (const tehsil of distTehsils) {
            const tehsilProjects = apiProjects.filter((p) => p.tehsil === tehsil.id);
            const overall = calcProjectsOverall(tehsilProjects);
            if (tehsilProjects.length > 0) tehsilOveralls.push(overall);
          }

          districtOveralls.push(tehsilOveralls.length > 0 ? avg(tehsilOveralls) : 0);
        }

        const completion = Math.round(avg(districtOveralls));
        return {
          city: `${div.division_name} Zone`,
          completion: clamp01(completion),
        };
      })
      .sort((a, b) => b.completion - a.completion);
  }, [apiDivisions, apiDistricts, apiTehsils, apiProjects, ganttProgressByProjectId]);

  const toSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // Hydrate dashboard hierarchy state from clean URL query params (slug-based, no IDs).
  useEffect(() => {
    if (apiZones.length === 0 || apiDivisions.length === 0 || apiDistricts.length === 0 || apiTehsils.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get("level");
    const viewParam = urlParams.get("view");

    // Helper to update state only if it changed, to prevent loops.
    const safeSet = (setter, current, next) => {
      if (current !== next) {
        skipNextUrlSyncRef.current = true;
        setter(next);
      }
    };

    if (viewParam === "divisions" || viewParam === "districts" || viewParam === "tehsils" || viewParam === "projects") {
      safeSet(setViewType, viewType, viewParam);
    }

    const zoneSlug = urlParams.get("zone");
    const divisionSlug = urlParams.get("division");
    if (level === "zone" && zoneSlug) {
      const foundZone = apiZones.find((z) => toSlug(z.zone_name || z.province_name) === zoneSlug);
      if (foundZone) {
        safeSet(setSelectedItemType, selectedItemType, "zone");
        safeSet(setSelectedItemId, selectedItemId, foundZone.id);
        safeSet(setSelectedItemName, selectedItemName, foundZone.zone_name || foundZone.province_name);
        safeSet(setParentDivisionId, parentDivisionId, null);
        safeSet(setParentDivisionName, parentDivisionName, null);
        safeSet(setParentDistrictId, parentDistrictId, null);
        safeSet(setParentDistrictName, parentDistrictName, null);
      }
      return;
    }

    const districtSlug = urlParams.get("district");
    const tehsilSlug = urlParams.get("tehsil");

    if (level === "tehsil" && tehsilSlug) {
      const foundTehsil = apiTehsils.find((t) => {
        if (toSlug(t.tehsil_name) !== tehsilSlug) return false;
        if (districtSlug && toSlug(t.district_name) !== districtSlug) return false;
        if (divisionSlug && toSlug(t.division_name) !== divisionSlug) return false;
        if (zoneSlug && toSlug(t.zone_name || t.province_name) !== zoneSlug) return false;
        return true;
      });
      if (foundTehsil) {
        safeSet(setSelectedItemType, selectedItemType, "tehsil");
        safeSet(setSelectedItemId, selectedItemId, foundTehsil.id);
        safeSet(setSelectedItemName, selectedItemName, foundTehsil.tehsil_name);
        safeSet(setParentDistrictId, parentDistrictId, foundTehsil.district);
        safeSet(setParentDistrictName, parentDistrictName, foundTehsil.district_name);
        safeSet(setParentDivisionId, parentDivisionId, foundTehsil.division);
        safeSet(setParentDivisionName, parentDivisionName, foundTehsil.division_name);
      }
      return;
    }

    if (level === "district" && districtSlug) {
      const foundDistrict = apiDistricts.find((d) => {
        if (toSlug(d.district_name) !== districtSlug) return false;
        if (divisionSlug && toSlug(d.division_name) !== divisionSlug) return false;
        if (zoneSlug && toSlug(d.zone_name || d.province_name) !== zoneSlug) return false;
        return true;
      });
      if (foundDistrict) {
        safeSet(setSelectedItemType, selectedItemType, "district");
        safeSet(setSelectedItemId, selectedItemId, foundDistrict.id);
        safeSet(setSelectedItemName, selectedItemName, foundDistrict.district_name);
        safeSet(setParentDivisionId, parentDivisionId, foundDistrict.division);
        safeSet(setParentDivisionName, parentDivisionName, foundDistrict.division_name);
        safeSet(setParentDistrictId, parentDistrictId, null);
        safeSet(setParentDistrictName, parentDistrictName, null);
      }
      return;
    }

    if (level === "division" && divisionSlug) {
      const foundDivision = apiDivisions.find((d) => toSlug(d.division_name) === divisionSlug);
      if (foundDivision) {
        safeSet(setSelectedItemType, selectedItemType, "division");
        safeSet(setSelectedItemId, selectedItemId, foundDivision.id);
        safeSet(setSelectedItemName, selectedItemName, foundDivision.division_name);
        safeSet(setParentDivisionId, parentDivisionId, foundDivision.zone || foundDivision.province || null);
        safeSet(setParentDivisionName, parentDivisionName, foundDivision.zone_name || foundDivision.province_name || null);
        safeSet(setParentDistrictId, parentDistrictId, null);
        safeSet(setParentDistrictName, parentDistrictName, null);
      }
      return;
    }

    // Backward compatibility with old ?tehsil=<name> link format.
    const tehsilParam = urlParams.get("tehsil");
    if (tehsilParam) {
      const found = apiTehsils.find(
        (t) => t.tehsil_name.toLowerCase() === decodeURIComponent(tehsilParam).toLowerCase(),
      );
      if (found) {
        safeSet(setSelectedItemName, selectedItemName, found.tehsil_name);
        safeSet(setSelectedItemType, selectedItemType, "tehsil");
        safeSet(setSelectedItemId, selectedItemId, found.id);
        safeSet(setParentDistrictId, parentDistrictId, found.district);
        safeSet(setParentDistrictName, parentDistrictName, found.district_name);
        safeSet(setParentDivisionId, parentDivisionId, found.division);
        safeSet(setParentDivisionName, parentDivisionName, found.division_name);
      }
    }
  }, [window.location.search, apiZones, apiDivisions, apiDistricts, apiTehsils]);

  // Keep URL in sync with drilldown selection.
  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (viewType) params.set("view", viewType);

    if (selectedItemType === "zone" && selectedItemId && selectedItemName) {
      params.set("level", "zone");
      params.set("zone", toSlug(selectedItemName));
    } else if (selectedItemType === "division" && selectedItemId && selectedItemName) {
      params.set("level", "division");
      params.set("division", toSlug(selectedItemName));
      if (parentDivisionId && parentDivisionName) {
        params.set("zone", toSlug(parentDivisionName));
      }
    } else if (selectedItemType === "district" && selectedItemId && selectedItemName) {
      params.set("level", "district");
      params.set("district", toSlug(selectedItemName));
      if (parentDivisionId && parentDivisionName) {
        params.set("division", toSlug(parentDivisionName));
      }
    } else if (selectedItemType === "tehsil" && selectedItemId && selectedItemName) {
      params.set("level", "tehsil");
      params.set("tehsil", toSlug(selectedItemName));
      if (parentDistrictId && parentDistrictName) {
        params.set("district", toSlug(parentDistrictName));
      }
      if (parentDivisionId && parentDivisionName) {
        params.set("division", toSlug(parentDivisionName));
      }
    }

    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
    const currentParams = new URLSearchParams(window.location.search);
    
    // Sort both to ensure consistent comparison regardless of order
    params.sort();
    currentParams.sort();
    
    const isDifferent = 
      window.location.pathname !== "/" || 
      params.toString() !== currentParams.toString();

    if (isDifferent) {
      setLocation(nextUrl);
    }
  }, [
    viewType,
    selectedItemType,
    selectedItemId,
    selectedItemName,
    parentDivisionId,
    parentDivisionName,
    parentDistrictId,
    parentDistrictName,
    setLocation,
  ]);

  // Simulate loading on initial mount and when view type changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms loading simulation
    return () => clearTimeout(timer);
  }, [viewType, selectedItemName, selectedItemType]);

  // Reset pagination when switching to projects view or when the list changes.
  useEffect(() => {
    if (viewType === "projects") {
      setProjectsPage((prev) => (prev !== 1 ? 1 : prev));
      setProjectsTablePage((prev) => (prev !== 1 ? 1 : prev));
    }
  }, [viewType]);

  // clear project selection when leaving tehsil view or projects view
  useEffect(() => {
    if (selectedItemType !== "tehsil" && viewType !== "projects") {
      setSelectedProjectForDetails(null);
    }
  }, [selectedItemType, viewType]);

  // Keep filter controls open at top-level, collapse while drilled in.
  useEffect(() => {
    if (selectedItemType) {
      setShowFilters(false);
    } else {
      setShowFilters(true);
    }
  }, [selectedItemType]);

  // Fetch project-gantt data whenever selected project changes (card or dropdown).
  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!_optionalChain([selectedProjectForDetails, 'optionalAccess', _15 => _15.id])) {
        setSelectedProjectGanttTasks([]);
        return;
      }
      try {
        const data = await getProjectGanttData(selectedProjectForDetails.id);
        if (ignore) return;
        setSelectedProjectGanttTasks(Array.isArray(data) ? data : []);
      } catch (e2) {
        if (ignore) return;
        setSelectedProjectGanttTasks([]);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [_optionalChain([selectedProjectForDetails, 'optionalAccess', _16 => _16.id])]);

  /** Refetch nested gantt after delay log POST so `has_delay` / `delay_info` update in the UI. */
  const refetchSelectedProjectGantt = useCallback(async () => {
    const pid = _optionalChain([selectedProjectForDetails, 'optionalAccess', _17 => _17.id]);
    if (!pid) return;
    try {
      const data = await getProjectGanttData(pid);
      setSelectedProjectGanttTasks(Array.isArray(data) ? data : []);
    } catch (e3) {
      setSelectedProjectGanttTasks([]);
    }
  }, [_optionalChain([selectedProjectForDetails, 'optionalAccess', _18 => _18.id])]);

  // Auto-collapse sidebar while project details (Gantt) are open, and restore prior state on close.
  useEffect(() => {
    const detailsOpen = !!_optionalChain([selectedProjectForDetails, 'optionalAccess', _19 => _19.id]);
    // Only auto-collapse once on open. Do NOT keep forcing it closed,
    // so the user can expand/collapse via the sidebar icon while Gantt is open.
    if (detailsOpen) {
      if (sidebarPrevCollapsedRef.current == null) {
        sidebarPrevCollapsedRef.current = isCollapsed;
        setCollapsed(true);
      }
      return;
    }
    if (sidebarPrevCollapsedRef.current != null) {
      setCollapsed(sidebarPrevCollapsedRef.current);
      sidebarPrevCollapsedRef.current = null;
    }
  }, [_optionalChain([selectedProjectForDetails, 'optionalAccess', _20 => _20.id]), isCollapsed, setCollapsed]);

  // Filter options from API data
  const divisions = useMemo(
    () => ["all", ...apiDivisions.map((d) => d.division_name)],
    [apiDivisions],
  );
  const districts = useMemo(
    () => ["all", ...apiDistricts.map((d) => d.district_name)],
    [apiDistricts],
  );
  const tehsils = useMemo(
    () => ["all", ...apiTehsils.map((t) => t.tehsil_name)],
    [apiTehsils],
  );







  const navigationFlow = useMemo(() => {
    const flow = [
      {
        key: "all",
        label: "All Zones",
        clickable: selectedItemType !== null,
      },
    ];

    if (selectedItemType === "zone" && selectedItemName) {
      flow.push({
        key: "zone",
        label: `${selectedItemName} Zone`,
        clickable: false,
      });
    } else if (selectedItemType === "division" && selectedItemName) {
      flow.push({
        key: "division",
        label: `${selectedItemName} Circle`,
        clickable: false,
      });
    } else if (selectedItemType === "district" && selectedItemName) {
      if (parentDivisionName) {
        flow.push({
          key: "division",
          label: `${parentDivisionName} Circle`,
          clickable: true,
        });
      }
      flow.push({
        key: "district",
        label: `${selectedItemName} District`,
        clickable: false,
      });
    } else if (selectedItemType === "tehsil" && selectedItemName) {
      if (parentDivisionName) {
        flow.push({
          key: "division",
          label: `${parentDivisionName} Circle`,
          clickable: true,
        });
      }
      if (parentDistrictName) {
        flow.push({
          key: "district",
          label: `${parentDistrictName} District`,
          clickable: true,
        });
      }
      flow.push({
        key: "tehsil",
        label: `${selectedItemName} Tehsil`,
        clickable: false,
      });
    }
    return flow;
  }, [
    selectedItemType,
    selectedItemName,
    parentDivisionId,
    parentDivisionName,
    parentDistrictId,
    parentDistrictName,
  ]);

  const handleNavigateToLevel = (level) => {
    if (level === "all") {
      setSelectedItemName(null);
      setSelectedItemType(null);
      setSelectedItemId(null);
      setParentDivisionId(null);
      setParentDivisionName(null);
      setParentDistrictId(null);
      setParentDistrictName(null);
      return;
    }

    if (level === "zone" && selectedItemType === "zone" && selectedItemId && selectedItemName) {
      setSelectedItemId(selectedItemId);
      setSelectedItemName(selectedItemName);
      setSelectedItemType("zone");
      return;
    }

    if (level === "division" && parentDivisionId && parentDivisionName) {
      setSelectedItemId(parentDivisionId);
      setSelectedItemName(parentDivisionName);
      setSelectedItemType("division");
      return;
    }

    if (level === "district" && parentDistrictId && parentDistrictName) {
      setSelectedItemId(parentDistrictId);
      setSelectedItemName(parentDistrictName);
      setSelectedItemType("district");
    }
  };

  // Helper: calculate overall financial progress from a set of projects
  const calcProjectsOverall = (projects) => {
    const clampPct = (n) => Math.max(0, Math.min(100, n));

    // Required source of truth: nested gantt root task `_id:"1"` progress per project.
    let sum = 0;
    let count = 0;
    for (const p of projects) {
      const v = ganttProgressByProjectId.get(p.id);
      if (v === undefined) continue;
      sum += v;
      count++;
    }
    return count > 0 ? clampPct(sum / count) : 0;
  };

  const distributionChart = useMemo(() => {
    if (!selectedItemType || !selectedItemId) return null;

    const avg = (values) => {
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, v) => acc + v, 0);
      return sum / values.length;
    };

    const roundPct = (n) => Math.max(0, Math.min(100, Number(n.toFixed(2))));

    const tehsilOverall = (tehsilId) => {
      const tehsilProjects = apiProjects.filter((p) => p.tehsil === tehsilId);
      if (tehsilProjects.length === 0) return 0;
      return calcProjectsOverall(tehsilProjects);
    };

    const districtOverallFromTehsils = (districtId) => {
      const distTehsils = apiTehsils.filter((t) => t.district === districtId);
      if (distTehsils.length === 0) return 0;
      const tehsilOveralls = distTehsils.map((t) => tehsilOverall(t.id));
      return avg(tehsilOveralls);
    };

    if (selectedItemType === "zone") {
      const zoneCircles = apiDivisions.filter((d) => Number(d.zone ?? d.province) === Number(selectedItemId));
      const rows = zoneCircles.map((c) => {
        const circleProjects = apiProjects.filter((p) => Number(p.division) === Number(c.id));
        return {
          phase: c.division_name,
          percentage: roundPct(calcProjectsOverall(circleProjects)),
        };
      });
      return {
        title: "Circle Progress Distribution",
        description: "Progress % of all circles within the selected zone",
        data: rows.sort((a, b) => b.percentage - a.percentage),
      };
    }

    if (selectedItemType === "division") {
      const divDistricts = apiDistricts.filter((d) => d.division === selectedItemId);
      const rows = divDistricts.map((d) => ({
        phase: d.district_name,
        percentage: roundPct(districtOverallFromTehsils(d.id)),
      }));
      return {
        title: "District Progress Distribution",
        description: "Progress % of all districts within the selected circle",
        data: rows.sort((a, b) => b.percentage - a.percentage),
      };
    }

    if (selectedItemType === "district") {
      const distTehsils = apiTehsils.filter((t) => t.district === selectedItemId);
      const rows = distTehsils.map((t) => ({
        phase: t.tehsil_name,
        percentage: roundPct(tehsilOverall(t.id)),
      }));
      return {
        title: "Tehsil Progress Distribution",
        description: "Progress % of all tehsils within the selected circle",
        data: rows.sort((a, b) => b.percentage - a.percentage),
      };
    }

    return null;
  }, [
    selectedItemType,
    selectedItemId,
    apiDivisions,
    apiDistricts,
    apiTehsils,
    apiProjects,
    ganttProgressByProjectId,
  ]);

  // Calculate aggregated data from a list of projects
  const getAggregatedDataFromProjects = (
    projects,
  ) => {
    const overall = calcProjectsOverall(projects);
    return generateCityDataFromOverall(overall);
  };

  // Get single item data from API projects by ID
  const getSingleItemData = (
    itemId,
    itemType,
  ) => {
    if (!itemId) return null;
    let filtered;
    if (itemType === "zone") {
      const circleIds = apiDivisions
        .filter((c) => Number(c.zone ?? c.province) === Number(itemId))
        .map((c) => Number(c.id));
      filtered = apiProjects.filter((p) => circleIds.includes(Number(p.division)));
    } else if (itemType === "division") {
      filtered = apiProjects.filter((p) => p.division === itemId);
    } else if (itemType === "district") {
      filtered = apiProjects.filter((p) => p.district === itemId);
    } else {
      filtered = apiProjects.filter((p) => p.tehsil === itemId);
    }
    return getAggregatedDataFromProjects(filtered);
  };

  // Get single item data
  const singleItemData = useMemo(() => {
    if (selectedItemId && selectedItemType) {
      return getSingleItemData(selectedItemId, selectedItemType);
    }
    return null;
  }, [selectedItemId, selectedItemType, apiProjects]);

  // Projects in the currently selected geography (zone / circle / district / tehsil) for "Best Performing Projects" cards
  const projectsInSelectedGeography = useMemo(() => {
    if (!selectedItemId || !selectedItemType) return [];
    if (selectedItemType === "zone") {
      const circleIds = apiDivisions
        .filter((c) => Number(c.zone ?? c.province) === Number(selectedItemId))
        .map((c) => Number(c.id));
      return apiProjects.filter((p) => circleIds.includes(Number(p.division)));
    }
    if (selectedItemType === "division") {
      return apiProjects.filter((p) => p.division === selectedItemId);
    }
    if (selectedItemType === "district") {
      return apiProjects.filter((p) => p.district === selectedItemId);
    }
    return apiProjects.filter((p) => p.tehsil === selectedItemId);
  }, [selectedItemId, selectedItemType, apiDivisions, apiProjects]);

  // Projects to show on the embedded GIS map (matches current dashboard scope).
  const mapScopeProjects = useMemo(() => {
    if (selectedItemId && selectedItemType) return projectsInSelectedGeography;
    return apiProjects;
  }, [selectedItemId, selectedItemType, projectsInSelectedGeography, apiProjects]);

  const dashboardMapGeoData = useMemo(() => {
    return buildProjectsFeatureCollection(mapScopeProjects, projectStatusById) || undefined;
  }, [mapScopeProjects, projectStatusById]);

  // Get aggregated data based on view type (all projects)
  const aggregatedData = useMemo(() => {
    return getAggregatedDataFromProjects(apiProjects);
  }, [apiProjects]);

  /** Top projects by budget utilization for root "All Punjab *" views (real API data, not duplicate phase placeholders). */
  const topProjectsForAggregateViews = useMemo(() => {
    if (apiProjects.length === 0) return [];
    return [...apiProjects]
      .map((p) => {
        const total = parseFloat(p.total_budget_allocated || "0") || 0;
        const utilized = parseFloat(p.budget_utilized || "0") || 0;
        const ratio = total > 0 ? utilized / total : 0;
        return { p, ratio };
      })
      .sort((a, b) => b.ratio - a.ratio)
      .map((x) => x.p)
      .slice(0, 6);
  }, [apiProjects]);

  // Overall for All Punjab Zones (average of zone overalls)
  const allDivisionsOverall = useMemo(() => {
    if (apiZones.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const zone of apiZones) {
      const zoneCircleIds = apiDivisions
        .filter((c) => Number(c.zone ?? c.province) === Number(zone.id))
        .map((c) => Number(c.id));
      const projects = apiProjects.filter((p) => zoneCircleIds.includes(Number(p.division)));
      sum += calcProjectsOverall(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiZones, apiDivisions, apiProjects]);

  // Overall for All Punjab Districts (average of district overalls)
  const allDistrictsOverall = useMemo(() => {
    if (apiDistricts.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const dist of apiDistricts) {
      const projects = apiProjects.filter((p) => p.district === dist.id);
      sum += calcProjectsOverall(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiDistricts, apiProjects]);

  // Overall for All Punjab Circles (average of circle overalls)
  const allCirclesOverall = useMemo(() => {
    if (apiDivisions.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const circle of apiDivisions) {
      const projects = apiProjects.filter((p) => p.division === circle.id);
      sum += calcProjectsOverall(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiDivisions, apiProjects]);

  // Financial utilization (average of unit utilizations)
  const allZonesFinancialOverall = useMemo(() => {
    if (apiZones.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const zone of apiZones) {
      const zoneCircleIds = apiDivisions
        .filter((c) => Number(c.zone ?? c.province) === Number(zone.id))
        .map((c) => Number(c.id));
      const projects = apiProjects.filter((p) => zoneCircleIds.includes(Number(p.division)));
      sum += calcOverallProgress(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiZones, apiDivisions, apiProjects]);

  const allCirclesFinancialOverall = useMemo(() => {
    if (apiDivisions.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const circle of apiDivisions) {
      const projects = apiProjects.filter((p) => p.division === circle.id);
      sum += calcOverallProgress(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiDivisions, apiProjects]);

  const allDistrictsFinancialOverall = useMemo(() => {
    if (apiDistricts.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const dist of apiDistricts) {
      const projects = apiProjects.filter((p) => p.district === dist.id);
      sum += calcOverallProgress(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiDistricts, apiProjects]);

  // Context theme: follow the currently visible/selected area overall %
  const contextOverall = useMemo(() => {
    if (selectedItemName && singleItemData) return _nullishCoalesce(singleItemData.overall, () => (0));
    if (viewType === "projects" && !selectedItemName && !selectedItemType)
      return allProjectsOverallFromGantt;
    if (viewType === "tehsils" && !selectedItemName && !selectedItemType)
      return allDistrictsOverall;
    if (viewType === "divisions" && !selectedItemName && !selectedItemType)
      return allDivisionsOverall;
    if (viewType === "districts" && !selectedItemName && !selectedItemType)
      return allCirclesOverall;
    return _nullishCoalesce(_optionalChain([aggregatedData, 'optionalAccess', _21 => _21.overall]), () => (0));
  }, [
    selectedItemName,
    singleItemData,
    aggregatedData,
    viewType,
    selectedItemType,
    allProjectsOverallFromGantt,
    allDivisionsOverall,
    allDistrictsOverall,
    allCirclesOverall,
  ]);

  const contextTheme = useMemo(() => {
    const meta = getProgressRangeMeta(contextOverall);
    return {
      meta,
      // hex with alpha (CSS supports #RRGGBBAA)
      accent: meta.color,
      // stronger tint/border so the theme is clearly visible
      accentSoft: `${meta.color}33`, // ~20% alpha
      accentBorder: `${meta.color}80`, // ~50% alpha
      accentGlow: `${meta.color}4D`, // ~30% alpha (for shadows)
    };
  }, [contextOverall]);

  // Zones data for cards view (API-driven)
  const zonesData = useMemo(() => {
    return apiZones
      .map((zone, index) => {
        const circleIds = apiDivisions
          .filter((c) => Number(c.zone ?? c.province) === Number(zone.id))
          .map((c) => Number(c.id));
        const projects = apiProjects.filter((p) => circleIds.includes(Number(p.division)));
        const overall = calcProjectsOverall(projects);
        return {
          id: zone.id,
          name: zone.zone_name || zone.province_name,
          overall,
          data: generateCityDataFromOverall(overall),
          color: CARD_COLORS[index % CARD_COLORS.length],
        };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [apiZones, apiDivisions, apiProjects]);

  // Circles data for cards view (API-driven)
  const divisionsData = useMemo(() => {
    return apiDivisions
      .map((div, index) => {
        const projects = apiProjects.filter((p) => p.division === div.id);
        const overall = calcProjectsOverall(projects);
        return {
          id: div.id,
          name: div.division_name,
          zoneId: div.zone ?? div.province,
          overall,
          data: generateCityDataFromOverall(overall),
          color: CARD_COLORS[index % CARD_COLORS.length],
        };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [apiDivisions, apiProjects]);

  // Districts data for cards view (API-driven)
  const districtsData = useMemo(() => {
    return apiDistricts
      .map((dist, index) => {
        const projects = apiProjects.filter((p) => p.district === dist.id);
        const overall = calcProjectsOverall(projects);
        return {
          id: dist.id,
          name: dist.district_name,
          divisionId: dist.division,
          overall,
          data: generateCityDataFromOverall(overall),
          color: CARD_COLORS[index % CARD_COLORS.length],
        };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [apiDistricts, apiProjects]);


  // Tehsils data grouped by district name (API-driven)
  const tehsilsDataByDistrict = useMemo(() => {
    const result









      = {};
    apiTehsils.forEach((teh, index) => {
      const districtName = teh.district_name;
      if (!result[districtName]) result[districtName] = [];
      const projects = apiProjects.filter((p) => p.tehsil === teh.id);
      const overall = calcProjectsOverall(projects);
      result[districtName].push({
        id: teh.id,
        name: teh.tehsil_name,
        districtId: teh.district,
        overall,
        data: generateCityDataFromOverall(overall),
        color: CARD_COLORS[index % CARD_COLORS.length],
      });
    });
    // Sort tehsils within each district
    Object.keys(result).forEach((district) => {
      result[district].sort((a, b) => b.overall - a.overall);
    });
    return result;
  }, [apiTehsils, apiProjects]);

  // Skeleton loader component
  const renderSkeletonLoader = () => (
    React.createElement('div', { className: "space-y-6" }
      /* Installation Phase Cards Skeleton */
      , React.createElement('div', { className: "w-full" }
        , React.createElement('div', { className: "mb-3" }
          , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
          , React.createElement(Skeleton, { className: "h-4 w-64" })
        )
        , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" }
          , Array.from({ length: 6 }).map((_, i) => (
            React.createElement(Card, { key: i, className: "p-4" }
              , React.createElement(Skeleton, { className: "h-5 w-24 mb-3" })
              , React.createElement(Skeleton, { className: "h-8 w-16 mb-2" })
              , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
            )
          ))
        )
      )

      /* Overall Progress Card Skeleton */
      , React.createElement(Card, { className: "p-6" }
        , React.createElement('div', { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }
          , React.createElement('div', { className: "space-y-3 flex-1" }
            , React.createElement('div', { className: "flex items-center gap-3" }
              , React.createElement(Skeleton, { className: "h-14 w-14 rounded-xl" })
              , React.createElement('div', { className: "space-y-2" }
                , React.createElement(Skeleton, { className: "h-7 w-48" })
                , React.createElement(Skeleton, { className: "h-4 w-64" })
              )
            )
          )
          , React.createElement('div', { className: "text-center md:text-right" }
            , React.createElement(Skeleton, { className: "h-16 w-24 mb-2" })
            , React.createElement(Skeleton, { className: "h-8 w-32 rounded-full" })
          )
        )
        , React.createElement('div', { className: "mt-6" }
          , React.createElement(Skeleton, { className: "h-5 w-full rounded-full mb-3" })
          , React.createElement('div', { className: "flex items-center justify-between" }
            , React.createElement(Skeleton, { className: "h-3 w-8" })
            , React.createElement(Skeleton, { className: "h-3 w-20" })
            , React.createElement(Skeleton, { className: "h-3 w-8" })
          )
        )
      )

      /* Pie Charts Skeleton */
      , React.createElement('div', { className: "grid gap-6 md:grid-cols-2" }
        , Array.from({ length: 2 }).map((_, i) => (
          React.createElement(Card, { key: i, className: "p-6" }
            , React.createElement(Skeleton, { className: "h-6 w-48 mb-2" })
            , React.createElement(Skeleton, { className: "h-4 w-64 mb-6" })
            , React.createElement(Skeleton, { className: "h-80 w-full rounded-lg" })
          )
        ))
      )

      /* Phase Distribution Chart Skeleton (drilldown only) */
      , selectedItemName && selectedItemType ? (
        React.createElement(Card, { className: "p-6" }
          , React.createElement(Skeleton, { className: "h-6 w-48 mb-2" })
          , React.createElement(Skeleton, { className: "h-4 w-64 mb-6" })
          , React.createElement(Skeleton, { className: "h-80 w-full rounded-lg" })
        )
      ) : null
    )
  );

  // Convert physical progress to financial progress
  const convertToFinancialProgress = (
    physicalPhase,
  ) => {
    const financialMultiplier = 0.92; // Financial is typically 92% of physical
    const varianceAdjustment = 0.85; // Financial variance is typically 85% of physical variance

    const financialActual = Math.min(
      100,
      physicalPhase.actual * financialMultiplier,
    );
    const variance = physicalPhase.actual - physicalPhase.planned;
    const financialVariance = variance * varianceAdjustment;
    const financialPlanned = financialActual - financialVariance;

    // Convert sub-projects to financial
    const financialSubProjects = (
      physicalPhase.subProjects || []
    ).map((sub) => {
      const subFinancialActual = Math.min(
        100,
        sub.actualProgress * financialMultiplier,
      );
      const subVariance = sub.actualProgress - sub.plannedProgress;
      const subFinancialVariance = subVariance * varianceAdjustment;
      const subFinancialPlanned = subFinancialActual - subFinancialVariance;

      return {
        ...sub,
        name: sub.name.replace(
          /(Survey|Assessment|Collection|Measurements|Study|Documentation|Feasibility|Installation|Laying|Renovations|Go Live)/g,
          "$1 Budget",
        ),
        actualProgress: subFinancialActual,
        plannedProgress: Math.max(0, subFinancialPlanned),
      };
    });

    // Convert timeline to financial
    const financialTimeline = (physicalPhase.timeline || []).map((t) => ({
      month: t.month,
      actual: Math.min(100, t.actual * financialMultiplier),
      planned: Math.min(100, t.planned * financialMultiplier),
    }));

    return {
      actual: financialActual,
      planned: Math.max(0, financialPlanned),
      subProjects: financialSubProjects,
      timeline: financialTimeline,
    };
  };

  // Valid InstallationCard colors for project cards
  const PROJECT_CARD_COLORS = ["blue", "orange", "purple", "red", "yellow"];

  // Only show this section on the main (no-filter) All Divisions view.
  const showBestPerformingSection =
    viewType === "divisions" && !selectedItemType && !selectedItemName;

  // Render aggregated charts function
  const renderAggregatedCharts = (
    title,
    data,
    projectsInGeography,
    /** When false (division/district drill-down), project cards are display-only â€” no Gantt fetch. */
    projectCardsInteractive = true,
  ) => {
    const isAggregatedView = title.startsWith("All Punjab");
    const useProjectCards =
      Array.isArray(projectsInGeography) && projectsInGeography.length > 0;
    const scopeProjects =
      Array.isArray(projectsInGeography) && projectsInGeography.length > 0
        ? projectsInGeography
        : apiProjects;

    const clamp01 = (n) => Math.max(0, Math.min(100, n));
    const num = (v) => {
      if (v === null || v === undefined) return 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const getActivityProgress = (a) =>
      clamp01(num(_nullishCoalesce(_nullishCoalesce(_optionalChain([a, 'optionalAccess', _22 => _22.progress]), () => (_optionalChain([a, 'optionalAccess', _23 => _23.percent_complete]))), () => (0))));

    // Donut chart values must match the header cards:
    // - For drilldown (zone/circle/district/tehsil selection) -> compute directly from filtered projects.
    // - For aggregated tabs (All Zones/Circles/Districts) -> compute average-of-groups (same as header).
    let utilizationPct = 0; // financial actual %
    let physicalPct = 0; // physical actual %

    if (isAggregatedView) {
      if (viewType === "divisions") {
        physicalPct = allDivisionsOverall;
        utilizationPct = allZonesFinancialOverall;
      } else if (viewType === "districts") {
        physicalPct = allCirclesOverall;
        utilizationPct = allCirclesFinancialOverall;
      } else if (viewType === "tehsils") {
        // Note: in this UI, `viewType==="tehsils"` corresponds to "All Punjab Districts" level.
        physicalPct = allDistrictsOverall;
        utilizationPct = allDistrictsFinancialOverall;
      }
    } else {
      // For zone/circle/district/tehsil drilldown views, `projectsInGeography` should already be filtered.
      physicalPct = calcProjectsOverall(scopeProjects);
      utilizationPct = calcOverallProgress(scopeProjects);
    }

    // Calculate overall planned and actual from all phases
    let totalPlanned = 0;
    let totalActual = 0;
    let phaseCount = 0;

    installationPhases.forEach((phase) => {
      const progress = data[phase.key];
      if (hasDetailedProgress(progress)) {
        totalPlanned += progress.planned;
        totalActual += progress.actual;
        phaseCount++;
      } else {
        // If no detailed progress, use the number value as both planned and actual
        const value = getProgressValue(progress);
        totalPlanned += value;
        totalActual += value;
        phaseCount++;
      }
    });

    const avgPlanned = phaseCount > 0 ? totalPlanned / phaseCount : 0;
    const avgActual = phaseCount > 0 ? totalActual / phaseCount : 0;
    const variance = avgActual - avgPlanned;
    const absVariance = Math.abs(variance);

    // Financial donut (percent-based): planned=100, actual=util%, variance=remaining to 100
    const financialPlanned = 100;
    const financialActual = utilizationPct;
    const absFinancialVariance = Math.max(0, 100 - financialActual);

    // Overall progress donut (physical, percent-based)
    const overallPlannedPct = 100;
    const overallActualPct = physicalPct;
    const overallVariancePct = Math.max(0, 100 - overallActualPct);
    const overallMax = Math.max(overallPlannedPct, overallActualPct);
    const overallTotalForPie = overallMax + overallVariancePct;
    const normalizedOverallPlanned =
      overallTotalForPie > 0 ? (overallPlannedPct / overallTotalForPie) * 100 : 0;
    const normalizedOverallActual =
      overallTotalForPie > 0 ? (overallActualPct / overallTotalForPie) * 100 : 0;
    const normalizedOverallVariance =
      overallTotalForPie > 0 ? (overallVariancePct / overallTotalForPie) * 100 : 0;

    // Calculate totals for pie chart normalization (installation progress)
    const maxValue = Math.max(avgPlanned, avgActual);
    const totalForPie = maxValue + absVariance;

    // Normalize values for installation progress pie chart
    const normalizedPlanned =
      totalForPie > 0 ? (avgPlanned / totalForPie) * 100 : 0;
    const normalizedActual =
      totalForPie > 0 ? (avgActual / totalForPie) * 100 : 0;
    const normalizedVariance =
      totalForPie > 0 ? (absVariance / totalForPie) * 100 : 0;

    // Calculate totals for financial pie chart normalization
    const maxFinancialValue = Math.max(financialPlanned, financialActual);
    const totalForFinancialPie = maxFinancialValue + absFinancialVariance;

    // Normalize values for financial progress pie chart
    const normalizedFinancialPlanned =
      totalForFinancialPie > 0
        ? (financialPlanned / totalForFinancialPie) * 100
        : 0;
    const normalizedFinancialActual =
      totalForFinancialPie > 0
        ? (financialActual / totalForFinancialPie) * 100
        : 0;
    const normalizedFinancialVariance =
      totalForFinancialPie > 0
        ? (absFinancialVariance / totalForFinancialPie) * 100
        : 0;

    const isSelectedProjectInThisScope =
      projectCardsInteractive &&
      useProjectCards &&
      !!selectedProjectForDetails &&
      projectsInGeography.some((p) => p.id === selectedProjectForDetails.id);

    // Selected milestone (if any) for this current view
    const selectedPhaseMeta = selectedMilestoneKey
      ? installationPhases.find((p) => p.key === selectedMilestoneKey)
      : null;
    const selectedProgress = selectedMilestoneKey
      ? data[selectedMilestoneKey]
      : null;

    const colorMap = {
      blue: "#2F8F6C",
      green: "#2E7D32",
      orange: "#f59e0b",
      purple: "#a855f7",
      red: "#ef4444",
      yellow: "#eab308",
    };

    return (
      React.createElement(React.Fragment, null
        /* Best Performing Projects (hide inside selected division/district/tehsil views) */
        , showBestPerformingSection && (
          React.createElement('div', { className: "w-full" }
            , React.createElement('div', { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 min-w-0" }
              , React.createElement('div', { className: "min-w-0 flex-1" }
                , React.createElement('h2', { className: "text-xl font-bold font-heading text-[#0f172a] dark:text-white" }, "Best Performing Projects"

                )

              )

              , (selectedMilestoneKey || isSelectedProjectInThisScope) && (
                React.createElement('button', {
                  type: "button",
                  onClick: () => {
                    setSelectedMilestoneKey(null);
                    if (useProjectCards && projectCardsInteractive) {
                      setSelectedProjectForDetails(null);
                    }
                  },
                  className: "h-8 px-3 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 border-0 transition-colors whitespace-nowrap flex-shrink-0"
                }
                  , "Clear"

                )
              )
            )
            , React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" }
              , useProjectCards
                ? projectsInGeography.map((project, index) => {
                  const percentage = Math.round(
                    _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => (0)),
                  );
                  const displayName =
                    project.project_name || `Project ${project.id}`;
                  return (
                    React.createElement(InstallationCard, {
                      key: `${title}-project-${project.id}`,
                      title: displayName,
                      percentage: percentage,
                      icon: FolderKanban,
                      color: PROJECT_CARD_COLORS[index % PROJECT_CARD_COLORS.length],
                      // Don't show planned/actual until backend exists.
                      actualProgress: undefined,
                      plannedProgress: undefined,
                      selected:
                        projectCardsInteractive &&
                        _optionalChain([selectedProjectForDetails, 'optionalAccess', _27 => _27.id]) === project.id
                      ,
                      nonInteractive: !projectCardsInteractive,
                      onClick:
                        projectCardsInteractive
                          ? () => {
                            setSelectedMilestoneKey(null);
                            setSelectedProjectForDetails((prev) =>
                              _optionalChain([prev, 'optionalAccess', _28 => _28.id]) === project.id ? null : project,
                            );
                          }
                          : undefined
                      
                    }
                    )
                  );
                })
                : installationPhases.map((phase) => {
                  const progress = data[phase.key];
                  const hasDetails = hasDetailedProgress(progress);
                  const progressValue = hasDetails
                    ? Math.round(progress.actual)
                    : Math.round(getProgressValue(progress));

                  return (
                    React.createElement(InstallationCard, {
                      key: `${title}-${phase.key}`,
                      title: phase.title,
                      percentage: progressValue,
                      icon: phase.icon,
                      color: phase.color,
                      actualProgress: hasDetails ? progress.actual : undefined,
                      plannedProgress: hasDetails ? progress.planned : undefined,
                      selected: selectedMilestoneKey === phase.key,
                      onClick: () => {
                        setSelectedMilestoneKey((prev) =>
                          prev === phase.key ? null : phase.key,
                        );
                      }
                    }
                    )
                  );
                })
            )

            /* Selected project details (Gantt / WBS) for Division/District views */
            , isSelectedProjectInThisScope && (
              React.createElement('div', { className: "mt-6" }
                , React.createElement(MilestoneDetailsPanel, {
                  milestoneTitle: `${selectedProjectForDetails.project_name || `Project ${selectedProjectForDetails.id}`} - Project Gantt`,
                  phase: selectedProjectPhase,
                  phaseColor: "#054332",
                  flatGanttTasks: selectedProjectGanttTasks,
                  ganttProjectId: selectedProjectForDetails.id,
                  onProjectGanttRefresh: refetchSelectedProjectGantt,
                  onClear: () => setSelectedProjectForDetails(null)
                }
                )
              )
            )
          )
        )

        /* Donut charts: hide when a milestone KPI or a single project is selected */
        , !selectedMilestoneKey && !isSelectedProjectInThisScope && (
          React.createElement('div', { className: "grid gap-4 md:grid-cols-2" }
            /* Financial Progress Donut Chart */
            , React.createElement(Card, { className: "overflow-hidden rounded-lg border border-border/80 bg-card shadow-lg shadow-primary/5 transition-shadow hover:shadow-xl hover:shadow-primary/10" }
              , React.createElement(CardHeader, { className: "py-3 px-4 pb-1" }
                , React.createElement(CardTitle, { className: "text-base font-heading" }, "Financial Progress Overview"

                )
              )
              , React.createElement(CardContent, { className: "pt-0 px-4 pb-4" }
                , React.createElement('div', {
                  className: "relative w-full",
                  style: {
                    height: isMobile ? "200px" : isTablet ? "220px" : "260px",
                  }
                }

                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                    , React.createElement(PieChart, {
                      margin: { top: 2, right: 2, bottom: 32, left: 2 }
                    }

                      , React.createElement(Pie, {
                        data: [
                          {
                            name: "Planned",
                            value: normalizedFinancialPlanned,
                            originalValue: financialPlanned,
                            fill: "#054332",
                          },
                          {
                            name: "Actual",
                            value: normalizedFinancialActual,
                            originalValue: financialActual,
                            fill: "#10b981",
                          },
                          {
                            name: "Variance",
                            value: normalizedFinancialVariance,
                            originalValue: absFinancialVariance,
                            fill: "#ef4444",
                          },
                        ],
                        cx: "50%",
                        cy: isMobile ? "46%" : "50%",
                        innerRadius: isMobile ? 42 : isTablet ? 44 : 54,
                        outerRadius: isMobile ? 60 : isTablet ? 72 : 88,
                        paddingAngle: 2,
                        dataKey: "value",
                        stroke: "rgba(255,255,255,0.9)",
                        strokeWidth: 2,
                        isAnimationActive: true,
                        animationDuration: 800,
                        animationBegin: 0
                      }

                        , React.createElement(RechartsLabel, {
                          content: ({ viewBox }) => {
                            const cx = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _29 => _29.cx]), () => (0));
                            const cy = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _30 => _30.cy]), () => (0));
                            const valueText = `${financialActual.toFixed(1)}%`;
                            return (
                              React.createElement('g', {}
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy - (isMobile ? 2 : 3),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-heading font-bold tabular-nums fill-foreground",
                                  style: { fontSize: isMobile ? 14 : 18 }
                                }

                                  , valueText
                                )
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy + (isMobile ? 12 : 14),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-medium uppercase tracking-wider fill-muted-foreground",
                                  style: { fontSize: isMobile ? 9 : 10 }
                                }
                                  , "Actual"

                                )
                              )
                            );
                          }
                        }
                        )
                        , ["#2F8F6C", "#8BC34A", "#ef4444"].map((fill, index) => (
                          React.createElement(Cell, {
                            key: `cell-f-${index}`,
                            fill: fill,
                            stroke: "rgba(255,255,255,0.9)",
                            strokeWidth: 2
                          }
                          )
                        ))
                      )
                      , React.createElement(Tooltip, {
                        contentStyle: {
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: isMobile ? "11px" : "13px",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                        },
                        formatter: (
                          value,
                          name,
                          props,
                        ) => {
                          const originalValue =
                            _nullishCoalesce(_optionalChain([props, 'access', _31 => _31.payload, 'optionalAccess', _32 => _32.originalValue]), () => (value));
                          return [`${originalValue.toFixed(1)}%`, name];
                        }
                      }
                      )
                      , React.createElement(Legend, {
                        verticalAlign: "bottom",
                        align: "center",
                        layout: "horizontal",
                        wrapperStyle: {
                          paddingTop: 6,
                          fontSize: isMobile ? "10px" : "11px",
                        },
                        iconType: "circle",
                        iconSize: 8,
                        formatter: (value) => {
                          let itemValue = 0;
                          if (value === "Planned") itemValue = financialPlanned;
                          else if (value === "Actual")
                            itemValue = financialActual;
                          else if (value === "Variance")
                            itemValue = absFinancialVariance;
                          return (
                            React.createElement('span', { className: "text-muted-foreground font-medium" }
                              , value, " "
                              , React.createElement('span', { className: "font-semibold text-foreground" }
                                , itemValue.toFixed(1), "%"
                              )
                            )
                          );
                        }
                      }
                      )
                    )
                  )
                )
              )
            )

            /* Overall Progress Donut Chart */
            , React.createElement(Card, { className: "overflow-hidden rounded-lg border border-border/80 bg-card shadow-lg shadow-primary/5 transition-shadow hover:shadow-xl hover:shadow-primary/10" }
              , React.createElement(CardHeader, { className: "py-3 px-4 pb-1" }
                , React.createElement(CardTitle, { className: "text-base font-heading" }, "Overall Progress"

                )
              )
              , React.createElement(CardContent, { className: "pt-0 px-4 pb-4" }
                , React.createElement('div', {
                  className: "relative w-full",
                  style: {
                    height: isMobile ? "200px" : isTablet ? "220px" : "260px",
                  }
                }

                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                    , React.createElement(PieChart, {
                      margin: { top: 2, right: 2, bottom: 32, left: 2 }
                    }

                      , React.createElement(Pie, {
                        data: [
                          {
                            name: "Planned",
                            value: normalizedOverallPlanned,
                            originalValue: overallPlannedPct,
                            fill: "#054332",
                          },
                          {
                            name: "Actual",
                            value: normalizedOverallActual,
                            originalValue: overallActualPct,
                            fill: "#10b981",
                          },
                          {
                            name: "Variance",
                            value: normalizedOverallVariance,
                            originalValue: overallVariancePct,
                            fill: "#ef4444",
                          },
                        ],
                        cx: "50%",
                        cy: isMobile ? "46%" : "50%",
                        innerRadius: isMobile ? 42 : isTablet ? 44 : 54,
                        outerRadius: isMobile ? 60 : isTablet ? 72 : 88,
                        paddingAngle: 2,
                        dataKey: "value",
                        stroke: "rgba(255,255,255,0.9)",
                        strokeWidth: 2,
                        isAnimationActive: true,
                        animationDuration: 800,
                        animationBegin: 0
                      }

                        , React.createElement(RechartsLabel, {
                          content: ({ viewBox }) => {
                            const cx = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _33 => _33.cx]), () => (0));
                            const cy = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _34 => _34.cy]), () => (0));
                            const valueText = `${overallActualPct.toFixed(1)}%`;
                            return (
                              React.createElement('g', {}
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy - (isMobile ? 2 : 3),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-heading font-bold tabular-nums fill-foreground",
                                  style: { fontSize: isMobile ? 14 : 18 }
                                }

                                  , valueText
                                )
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy + (isMobile ? 12 : 14),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-medium uppercase tracking-wider fill-muted-foreground",
                                  style: { fontSize: isMobile ? 9 : 10 }
                                }
                                  , "Actual"

                                )
                              )
                            );
                          }
                        }
                        )
                        , ["#2F8F6C", "#8BC34A", "#ef4444"].map((fill, index) => (
                          React.createElement(Cell, {
                            key: `cell-o-${index}`,
                            fill: fill,
                            stroke: "rgba(255,255,255,0.9)",
                            strokeWidth: 2
                          }
                          )
                        ))
                      )
                      , React.createElement(Tooltip, {
                        contentStyle: {
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: isMobile ? "11px" : "13px",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                        },
                        formatter: (
                          value,
                          name,
                          props,
                        ) => {
                          const originalValue =
                            _nullishCoalesce(_optionalChain([props, 'access', _35 => _35.payload, 'optionalAccess', _36 => _36.originalValue]), () => (value));
                          return [`${originalValue.toFixed(1)}%`, name];
                        }
                      }
                      )
                      , React.createElement(Legend, {
                        verticalAlign: "bottom",
                        align: "center",
                        layout: "horizontal",
                        wrapperStyle: {
                          paddingTop: 6,
                          fontSize: isMobile ? "10px" : "11px",
                        },
                        iconType: "circle",
                        iconSize: 8,
                        formatter: (value) => {
                          let itemValue = 0;
                          if (value === "Planned") itemValue = overallPlannedPct;
                          else if (value === "Actual") itemValue = overallActualPct;
                          else if (value === "Variance") itemValue = overallVariancePct;
                          return (
                            React.createElement('span', { className: "text-muted-foreground font-medium" }
                              , value, " "
                              , React.createElement('span', { className: "font-semibold text-foreground" }
                                , itemValue.toFixed(1), "%"
                              )
                            )
                          );
                        }
                      }
                      )
                    )
                  )
                )
              )
            )
          )
        )

        /* Table + Map side-by-side (Table left, Map right) â€” ONLY for /?view=divisions */
        , viewType === "divisions" && !selectedItemName && !selectedItemType ? (
          (() => {
            const total = projectsForTable.length;
            const totalPages = Math.max(1, Math.ceil(total / PROJECTS_TABLE_PAGE_SIZE));
            const safePage = Math.min(totalPages, Math.max(1, projectsTablePage));
            const start = (safePage - 1) * PROJECTS_TABLE_PAGE_SIZE;
            const pageRows = projectsForTable.slice(start, start + PROJECTS_TABLE_PAGE_SIZE);
            const canPrev = safePage > 1;
            const canNext = safePage < totalPages;

            return (
              React.createElement('div', { className: "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch" }
                , React.createElement(Card, { className: "rounded-xl border border-[#e2e8f0] shadow-[0_4px_24px_-8px_rgba(5,67,50,0.10)] overflow-hidden min-h-[420px] h-[55vh] max-h-[720px] flex flex-col bg-white" }
                  , React.createElement(CardHeader, { className: "py-3 px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#f0fdf4] to-white border-b border-[#dcfce7]" }
                    , React.createElement('div', {}
                      , React.createElement(CardTitle, { className: "text-base font-heading text-[#054332]" }, "Latest Projects")
                      , React.createElement('p', { className: "text-xs text-[#6b7280]" }, "Sorted by highest overall progress")
                    )
                    , React.createElement('div', { className: "flex items-center gap-1 justify-end" }
                      , React.createElement('span', { className: "text-[10px] font-semibold text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-full" }, safePage, "/", totalPages)
                      , React.createElement(Button, { variant: "ghost", size: "sm", disabled: !canPrev, onClick: () => setProjectsTablePage((p) => Math.max(1, p - 1)), className: "h-6 w-6 p-0 text-[13px] text-[#054332] hover:bg-[#dcfce7] rounded-full disabled:opacity-30" }, "<")
                      , React.createElement(Button, { variant: "ghost", size: "sm", disabled: !canNext, onClick: () => setProjectsTablePage((p) => Math.min(totalPages, p + 1)), className: "h-6 w-6 p-0 text-[13px] text-[#054332] hover:bg-[#dcfce7] rounded-full disabled:opacity-30" }, ">")
                    )
                  )
                  , React.createElement(CardContent, { className: "pt-0 px-0 flex-1 min-h-0" }
                    , React.createElement('div', { className: "w-full h-full overflow-auto" }
                      , React.createElement('table', { className: "w-full text-sm" }
                        , React.createElement('thead', { className: "bg-[#f8fafc] sticky top-0 z-10 border-b border-[#e2e8f0]" }
                          , React.createElement('tr', {}
                            , React.createElement('th', { className: "text-left text-[10px] font-bold tracking-wider uppercase text-[#64748b] px-3 py-2.5" }
                              , React.createElement('div', { className: "flex items-center gap-1.5 select-none" }
                                , "Project"
                                , React.createElement(ChevronDown, { className: "h-3 w-3 opacity-50" })
                              )
                            )
                            , React.createElement('th', { className: "text-left text-[10px] font-bold tracking-wider uppercase text-[#64748b] px-3 py-2.5" }
                              , React.createElement('div', { className: "flex items-center gap-1.5 select-none" }
                                , "Overall Progress"
                                , React.createElement(ChevronDown, { className: "h-3 w-3 opacity-50" })
                              )
                            )
                            , React.createElement('th', { className: "text-left text-[10px] font-bold tracking-wider uppercase text-[#64748b] px-3 py-2.5" }
                              , React.createElement('div', { className: "flex items-center gap-1.5 select-none" }
                                , "Zone / Circle / Tehsil"
                                , React.createElement(ChevronDown, { className: "h-3 w-3 opacity-50" })
                              )
                            )
                          )
                        )
                        , React.createElement('tbody', {}
                          , pageRows.map((row) => {
                            const pct = Math.max(0, Math.min(100, Number(row.progressPct) || 0));
                            const iconSet = [
                              FolderKanban,
                              Building2,
                              Zap,
                              Camera,
                              Radio,
                              ClipboardCheck,
                              TrendingUp,
                              Home,
                            ];
                            const colorSet = [
                              "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
                              "bg-emerald-50 text-emerald-600 border-emerald-200",
                              "bg-sky-50 text-sky-600 border-sky-200",
                              "bg-amber-50 text-amber-600 border-amber-200",
                              "bg-rose-50 text-rose-600 border-rose-200",
                              "bg-violet-50 text-violet-600 border-violet-200",
                              "bg-cyan-50 text-cyan-600 border-cyan-200",
                              "bg-lime-50 text-lime-600 border-lime-200",
                            ];
                            const rowKey = Number(row.id) || 0;
                            const iconIdx = Math.abs(rowKey) % iconSet.length;
                            const colorIdx = Math.abs(rowKey) % colorSet.length;
                            const RowIcon = iconSet[iconIdx];
                            const colorClass = colorSet[colorIdx];
                            const progressColor = pct >= 75 ? "from-[#16a34a] to-[#054332]" : pct >= 40 ? "from-[#3b82f6] to-[#1d4ed8]" : "from-[#f59e0b] to-[#d97706]";
                            const badgeColor = pct >= 75 ? "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]" : pct >= 40 ? "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]" : "bg-[#fef3c7] text-[#b45309] border-[#fde68a]";
                            const dotColor = pct >= 75 ? "bg-[#16a34a]" : pct >= 40 ? "bg-[#3b82f6]" : "bg-[#f59e0b]";
                            return (
                              React.createElement('tr', {
                                key: row.id,
                                className: "border-b border-[#f1f5f9] even:bg-[#fafafa]"
                              }
                                , React.createElement('td', { className: "px-3 py-2.5 font-semibold text-[#1e293b]" }
                                  , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                                    , React.createElement('div', {
                                      className: `h-9 w-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${colorClass}`
                                    }
                                      , React.createElement(RowIcon, { className: "h-4 w-4" })
                                    )
                                    , React.createElement('div', { className: "min-w-0" }
                                      , React.createElement('div', { className: "truncate font-semibold text-[13px] text-[#1e293b]" }, row.name)
                                      , React.createElement('div', { className: "text-[10px] text-[#94a3b8] truncate font-medium" }, "ID: ", row.id)
                                    )
                                  )
                                )
                                , React.createElement('td', { className: "px-3 py-2.5" }
                                  , React.createElement('div', { className: "flex items-center gap-2.5" }
                                    , React.createElement('span', { className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums border ${badgeColor}` }
                                      , React.createElement('span', { className: `h-1.5 w-1.5 rounded-full ${dotColor}` })
                                      , pct.toFixed(2), "%"
                                    )
                                    , React.createElement('div', { className: "flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden" }
                                      , React.createElement('div', { className: `h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700`, style: { width: `${pct}%` } })
                                    )
                                  )
                                )
                                , React.createElement('td', { className: "px-3 py-2.5 text-[11px] text-[#64748b] font-medium" }, row.locationLabel)
                              )
                            );
                          })
                        )
                      )
                    )
                    , total === 0 && (
                      React.createElement('div', { className: "p-8 text-center text-sm text-[#94a3b8]" }, "No projects found.")
                    )
                  )
                )

                , React.createElement('div', { className: "w-full min-h-[420px] h-[55vh] max-h-[720px] rounded-lg overflow-hidden border border-border/60 shadow-sm" }
                  , React.createElement(CityMap, {
                    city: "lahore",
                    activeLayers: new Set(),
                    searchQuery: "",
                    showStats: false,
                    showSurveillanceLayers: false,
                    showLegend: false,
                    legendProjects: mapScopeProjects,
                    geoData: dashboardMapGeoData,
                    showGeoBoundary: false,
                    projectMarkerVariant: "green",
                    onProjectSelect: (projectId) => {
                      const p = apiProjects.find((x) => Number(x.id) === Number(projectId));
                      if (p) setSelectedProjectForDetails(p);
                    }
                  }
                  )
                )
              )
            );
          })()
        ) : null

        /* Division-wise completion chart â€” beneath Latest Projects + Map */
        , viewType === "divisions" && !selectedItemName && !selectedItemType ? (
          React.createElement('div', { className: "mt-4" }
            , React.createElement(CityCompletionChart, { cityData: divisionCompletionData, description: "Zone Wise Progress" })
          )
        ) : null

        /* Milestone details should appear beneath Overall Progress (and replace the old charts when selected) */
        , selectedMilestoneKey &&
        selectedPhaseMeta &&
        selectedProgress &&
        hasDetailedProgress(selectedProgress) && (
          React.createElement('div', { className: "space-y-4" }
            /* Header with Toggle - Right side where charts are shown */
            , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0" }
              , React.createElement('div', { className: "min-w-0" }
                , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1" }
                  , progressType === "financial"
                    ? `${selectedPhaseMeta.title} - Financial Progress`
                    : `${selectedPhaseMeta.title} - Milestone KPIs`
                )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }
                  , progressType === "financial"
                    ? "Financial progress charts and analysis"
                    : "Gantt chart and WBS breakdown"
                )
              )
              /* Progress Type Toggle - Right side */
              , React.createElement('div', { className: "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg border-2 border-primary/20 bg-background shadow-sm hover:border-primary/40 transition-colors flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start" }
                , React.createElement(TrendingUp, {
                  className: `h-4 w-4 ${progressType === "physical" ? "text-primary" : "text-muted-foreground"}`
                }
                )
                , React.createElement('span', {
                  className: `text-sm font-semibold ${progressType === "physical" ? "text-foreground" : "text-muted-foreground"}`
                }
                  , "Physical"

                )
                , React.createElement('button', {
                  type: "button",
                  onClick: () =>
                    setProgressType((prev) =>
                      prev === "physical" ? "financial" : "physical",
                    )
                  ,
                  className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${progressType === "financial" ? "bg-primary" : "bg-muted"
                    }`,
                  'aria-label': "Toggle between Physical and Financial Progress"
                }

                  , React.createElement('span', {
                    className: `inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${progressType === "financial"
                      ? "translate-x-6"
                      : "translate-x-1"
                      }`
                  }
                  )
                )
                , React.createElement(DollarSign, {
                  className: `h-4 w-4 ${progressType === "financial" ? "text-primary" : "text-muted-foreground"}`
                }
                )
                , React.createElement('span', {
                  className: `text-sm font-semibold ${progressType === "financial" ? "text-foreground" : "text-muted-foreground"}`
                }
                  , "Financial"

                )
              )
            )
            , React.createElement(MilestoneDetailsPanel, {
              milestoneTitle:
                progressType === "financial"
                  ? `${selectedPhaseMeta.title} - Financial Progress`
                  : selectedPhaseMeta.title
              ,
              phase:
                progressType === "financial"
                  ? convertToFinancialProgress({
                    actual: selectedProgress.actual,
                    planned: selectedProgress.planned,
                    subProjects: selectedProgress.subProjects,
                    timeline: selectedProgress.timeline,
                  })
                  : {
                    actual: selectedProgress.actual,
                    planned: selectedProgress.planned,
                    subProjects: selectedProgress.subProjects,
                    timeline: selectedProgress.timeline,
                  }
              ,
              phaseColor: colorMap[selectedPhaseMeta.color] || "#6b7280",
              onClear: () => setSelectedMilestoneKey(null)
            }
            )
          )
        )

        /* Charts Grid (drilldown only; hide in All Divisions/Districts/Tehsils views and when a single project is selected) */
        , !selectedMilestoneKey && !isAggregatedView && !isSelectedProjectInThisScope && (
          React.createElement('div', { className: "space-y-4" }
            , React.createElement('div', {}
              , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1" }, "Analytics & Insights"

              )
              , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Detailed progress analysis for "
                , title
              )
            )

            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12" }
              /* (Removed) Installation Progress Timeline + Phase Breakdown charts */
            )

            /* Phase Distribution Pie Chart */
            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12" }
              , React.createElement('div', { className: "lg:col-span-12" }
                , React.createElement(PhaseDistributionChart, {
                  title: _optionalChain([distributionChart, 'optionalAccess', _37 => _37.title]),
                  description: _optionalChain([distributionChart, 'optionalAccess', _38 => _38.description]),
                  data:
                    _nullishCoalesce(_optionalChain([distributionChart, 'optionalAccess', _39 => _39.data]), () => (
                      installationPhases.map((phase) => ({
                        phase: phase.title,
                        percentage: getProgressValue(data[phase.key]),
                      }))))
                  
                }
                )
              )
            )

            /* Planned vs Actual Charts for Each Phase - Only show when specific item is selected (not aggregated view) */
            , title.startsWith("All Punjab") ? null : (
              React.createElement('div', { className: "space-y-4" }
                , React.createElement('div', {}
                  , React.createElement('h3', { className: "text-lg font-bold font-heading mb-2" }, "Planned vs Actual Progress"

                  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Compare actual progress against planned milestones for each project phase"


                  )
                )
                , React.createElement('div', { className: "grid gap-4 lg:grid-cols-2" }
                  , installationPhases.map((phase) => {
                    const progress = data[phase.key];
                    if (!hasDetailedProgress(progress) || !progress.timeline)
                      return null;

                    const colorMap = {
                      blue: "#2F8F6C",
                      green: "#2E7D32",
                      orange: "#f59e0b",
                      purple: "#a855f7",
                      red: "#ef4444",
                      yellow: "#eab308",
                    };

                    return (
                      React.createElement(PlannedVsActualChart, {
                        key: `planned-actual-${phase.key}`,
                        phaseName: phase.title,
                        timelineData: progress.timeline,
                        color: colorMap[phase.color] || "#6b7280"
                      }
                      )
                    );
                  })
                )
              )
            )

            /* Phase Timeline Chart */
            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12" }
              , React.createElement('div', { className: "lg:col-span-12" }
                , React.createElement(PhaseTimelineChart, {
                  timelineData: data.timeline,
                  cityKey: title
                }
                )
              )
            )
          )
        )
      )
    );
  };

  const installationPhases = [
    {
      key: "surveys",
      title: "Surveys",
      icon: ClipboardCheck,
      color: "blue",
    },
    {
      key: "foundations",
      title: "Foundations Pole Installations",
      icon: Building2,
      color: "green",
    },
    {
      key: "cabinet",
      title: "Cabinet Cameras Installation",
      icon: Camera,
      color: "orange",
    },
    {
      key: "cable",
      title: "Cable Laying & Power Connections",
      icon: Zap,
      color: "purple",
    },
    {
      key: "controlRoom",
      title: "Control Room Renovations",
      icon: Home,
      color: "red",
    },
    {
      key: "ppic3",
      title: "PPIC3 Go Live",
      icon: Radio,
      color: "yellow",
    },
  ];

  return (
    React.createElement(Layout, { title: "PHPD Progress Dashboard", showHeader: false }
      , React.createElement('div', {
        className: "flex flex-col gap-4",
        style: {
          // Page-level theme variables (used by chart cards, headers, etc.)
          ["--progress-accent"]: contextTheme.accent,
          ["--progress-accent-soft"]: contextTheme.accentSoft,
          ["--progress-accent-border"]: contextTheme.accentBorder,
          ["--progress-accent-glow"]: contextTheme.accentGlow,
        }
      }

        /* Top Header Section - Enhanced Design with Filter Bar */
        , <div className="flex flex-col gap-6 w-full mb-6 mt-2">
          {/* FILTER BAR ROW (placed above title/progress) */}
          {isFilterBarExpanded ? (
            <div className="w-full bg-[#f6faf7] rounded-[18px] p-1.5 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-0.5 scrollbar-hide">
                {/* Expand/Collapse toggle (left) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterBarExpanded(false)}
                  aria-label="Collapse filters"
                  className="h-[40px] w-[40px] shrink-0 rounded-lg bg-white/70 hover:bg-white text-[#344054] border border-white/60 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.10)]"
                >
                  <Filter className="h-4 w-4" />
                </Button>

                <RadioGroup
                  value={viewType}
                  onValueChange={(value) => {
                    setViewType(value);
                    setSelectedItemName(null);
                    setSelectedItemType(null);
                    setExpandedDivisions(false);
                    setExpandedDistricts(false);
                    if (value === "tehsils") {
                      const DEFAULT_DISTRICTS = ["Lahore", "Sheikhupura"];
                      const defaultState = {};
                      DEFAULT_DISTRICTS.forEach((districtName) => {
                        defaultState[districtName] = true;
                      });
                      setExpandedTehsilGroups(defaultState);
                      setAllTehsilGroupsExpanded(false);
                    } else {
                      setExpandedTehsilGroups({});
                      setAllTehsilGroupsExpanded(false);
                    }
                    setTehsilSearchQuery("");
                  }}
                  className="flex items-center gap-3 flex-nowrap"
                >
                  {[
                    { val: "divisions", label: "All Zones" },
                    { val: "districts", label: "All Circles" },
                    { val: "tehsils", label: "All Districts" },
                    { val: "projects", label: "All Projects" },
                  ].map((item) => (
                    <div key={item.val} className="relative shrink-0">
                      <RadioGroupItem value={item.val} id={item.val} className="peer sr-only" />
                      <Label
                        htmlFor={item.val}
                        className="flex items-center justify-center px-3 py-2 bg-white text-[#054332] font-semibold text-[12px] sm:text-[13px] rounded-lg cursor-pointer border border-[#e5efe9] hover:bg-[#054332] hover:text-white peer-data-[state=checked]:bg-[#054332] peer-data-[state=checked]:text-white peer-data-[state=checked]:border-[#054332] transition-all whitespace-nowrap select-none min-w-[120px]"
                      >
                        <span>{item.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

            </div>
          ) : (
            <div className="w-full flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterBarExpanded(true)}
                aria-label="Expand filters"
                className="h-[40px] w-[40px] rounded-lg bg-white/70 hover:bg-white text-[#344054] border border-white/60 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.10)]"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* TITLE & PROGRESS ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
            <div className="flex flex-col">
              {(() => {
                const titleText =
                  selectedItemName && selectedItemType === "zone" ? `${selectedItemName} Zone`
                    : selectedItemName && selectedItemType === "division" ? `${selectedItemName} Circle`
                      : selectedItemName && selectedItemType === "district" ? `${selectedItemName} District`
                      : selectedItemName && selectedItemType === "tehsil" ? `${selectedItemName} Tehsil`
                        : viewType === "divisions" ? "All Punjab Zones"
                          : viewType === "districts" ? "All Punjab Circles"
                            : viewType === "tehsils" ? "All Punjab Districts"
                              : viewType === "projects" ? "All Projects"
                                : "PHPD Progress Dashboard";

                if (isLoading) return <Skeleton className="h-12 w-80" />;

                // Title mimicking the exact branding of the First image
                return (
                  <div className="flex flex-col space-y-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#101828] leading-[1.08]">
                      PHPD Progress
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#054332] leading-[1.08]">
                      Dashboard
                    </h2>
                  </div>
                );
              })()}
            </div>

            {/* Summary Cards (Physical + Financial) */}
            {(((selectedItemName && singleItemData) || aggregatedData)) && (() => {
              if (isLoading) {
                return (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Skeleton className="h-28 w-72 rounded-2xl" />
                    <Skeleton className="h-28 w-72 rounded-2xl" />
                  </div>
                );
              }

              const overall =
                selectedItemName && singleItemData ? singleItemData.overall
                  : viewType === "projects" && !selectedItemName && !selectedItemType ? allProjectsOverallFromGantt
                    : viewType === "tehsils" && !selectedItemName && !selectedItemType ? allDistrictsOverall
                      : viewType === "divisions" && !selectedItemName && !selectedItemType ? allDivisionsOverall
                        : viewType === "districts" && !selectedItemName && !selectedItemType ? allCirclesOverall
                          : aggregatedData?.overall || 0;

              const overallLabel =
                (viewType === "projects" || viewType === "tehsils" || viewType === "divisions" || viewType === "districts") && !selectedItemName && !selectedItemType
                  ? overall.toFixed(2)
                  : Math.round(overall).toString();

              const financialPct =
                selectedItemName && selectedItemType
                  ? calcOverallProgress(projectsInSelectedGeography)
                  : viewType === "divisions"
                    ? allZonesFinancialOverall
                    : viewType === "districts"
                      ? allCirclesFinancialOverall
                      : viewType === "tehsils"
                        ? allDistrictsFinancialOverall
                        : calcOverallProgress(apiProjects);
              const financialLabel =
                !selectedItemName && !selectedItemType ? financialPct.toFixed(2) : financialPct.toFixed(1);

              return (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Overall Progress Card */}
                  <div className="bg-gradient-to-br from-[#f0fdf4] to-white rounded-xl p-4 shadow-[0_6px_28px_-12px_rgba(5,67,50,0.18)] border border-[#bbf7d0] min-w-[240px] shrink-0 transform transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-10px_rgba(5,67,50,0.22)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-[#166534] font-semibold tracking-wide uppercase">Overall Progress</span>
                      <span className="text-[10px] bg-[#dcfce7] text-[#15803d] font-bold tracking-wide px-2 py-0.5 rounded-full">+0.00% Today</span>
                    </div>
                    <div className="text-[24px] sm:text-[28px] font-extrabold text-[#054332] tracking-tight mb-2.5">{overallLabel}%</div>
                    <div className="h-2 w-full bg-[#dcfce7] rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#054332] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, overall))}%` }} />
                    </div>
                  </div>

                  {/* Financial Progress Card */}
                  <div className="bg-gradient-to-br from-[#eff6ff] to-white rounded-xl p-4 shadow-[0_6px_28px_-12px_rgba(29,78,216,0.18)] border border-[#bfdbfe] min-w-[240px] shrink-0 transform transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-10px_rgba(29,78,216,0.22)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-[#1e40af] font-semibold tracking-wide uppercase">Financial Progress</span>
                      <span className="text-[10px] bg-[#dbeafe] text-[#1d4ed8] font-bold tracking-wide px-2 py-0.5 rounded-full">Budget Utilization</span>
                    </div>
                    <div className="text-[24px] sm:text-[28px] font-extrabold text-[#1e3a8a] tracking-tight mb-2.5">{financialLabel}%</div>
                    <div className="h-2 w-full bg-[#dbeafe] rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, financialPct))}%` }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        /* Map moved beneath donut charts */

        /* Zone Selected - Show Circles */
        , selectedItemName &&
        selectedItemType === "zone" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex items-center gap-4" }
              , React.createElement(Skeleton, { className: "h-10 w-32" })
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-64" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : singleItemData ? (
          (() => {
            // API-driven: filter circles belonging to this zone
            const zoneCirclesData = divisionsData.filter(
              (d) => Number(d.zoneId) === Number(selectedItemId),
            );

            return (
              React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0" }
                  , React.createElement('div', { className: "min-w-0" }
                    , React.createElement('h2', { className: "text-lg sm:text-2xl font-bold font-heading break-words" }, "Circles in "
                      , selectedItemName, " Zone"
                    )
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }
                      , selectedItemName, " Zone"
                    )
                  )

                  , React.createElement('div', { className: "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap justify-start sm:justify-end" }
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold",
                      onClick: () => {
                        setViewType("divisions");
                        setSelectedItemType(null);
                        setSelectedItemId(null);
                        setSelectedItemName(null);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , "All Zones")
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement('span', { className: "font-semibold text-[#344054]" }
                      , selectedItemName, " Zone"
                    )
                  )
                )

                /* Circle Cards */
                , zoneCirclesData.length > 0 ? (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                      , zoneCirclesData.map((circle) => (
                        React.createElement(HierarchyCard, {
                          key: circle.id,
                          title: circle.name,
                          overallProgress: circle.overall,
                          color: circle.color,
                          onClick: () => {
                            setParentDivisionId(selectedItemId);
                            setParentDivisionName(selectedItemName);
                            setSelectedItemId(circle.id);
                            setSelectedItemName(circle.name);
                            setSelectedItemType("division");
                          }
                        }
                        )
                      ))
                    )

                    /* Charts for Division */
                    , renderAggregatedCharts(
                      selectedItemName + " Zone",
                      singleItemData,
                      projectsInSelectedGeography,
                      false,
                    )
                  )
                ) : (
                  React.createElement(Card, { className: "border-border/50" }
                    , React.createElement(CardContent, { className: "p-8 text-center" }
                    , React.createElement('p', { className: "text-muted-foreground" }, "No circles found for "
                        , selectedItemName, " Zone."
                      )
                    )
                  )
                )
              )
            );
          })()
        ) : null)

        /* Circle Selected - Show Districts */
        , selectedItemName &&
        selectedItemType === "division" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex items-center gap-4" }
              , React.createElement(Skeleton, { className: "h-10 w-32" })
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-64" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : singleItemData ? (
          (() => {
            // API-driven: get districts for this circle by selectedItemId
            const circleDistrictsData = apiDistricts
              .filter((d) => Number(d.division) === Number(selectedItemId))
              .map((dist, index) => {
                const projects = apiProjects.filter((p) => p.district === dist.id);
                const overall = calcProjectsOverall(projects);
                return {
                  id: dist.id,
                  name: dist.district_name,
                  overall,
                  color: CARD_COLORS[index % CARD_COLORS.length],
                };
              })
              .sort((a, b) => b.overall - a.overall);

            return (
              React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0" }
                  , React.createElement('div', { className: "min-w-0" }
                    , React.createElement('h2', { className: "text-lg sm:text-2xl font-bold font-heading break-words" }, "Districts in "
                      , selectedItemName, " Circle"

                    )
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }
                      , selectedItemName, " Circle"
                    )
                  )

                  , React.createElement('div', { className: "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap justify-start sm:justify-end" }
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold",
                      onClick: () => {
                        setViewType("divisions");
                        setSelectedItemType(null);
                        setSelectedItemId(null);
                        setSelectedItemName(null);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , "All Zones")
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      disabled: !parentDivisionId || !parentDivisionName,
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold disabled:opacity-50 disabled:hover:bg-transparent",
                      onClick: () => {
                        if (!parentDivisionId || !parentDivisionName) return;
                        setViewType("divisions");
                        setSelectedItemType("zone");
                        setSelectedItemId(parentDivisionId);
                        setSelectedItemName(parentDivisionName);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , _nullishCoalesce(parentDivisionName, () => ("Zone")))
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement('span', { className: "font-semibold text-[#344054]" }
                      , selectedItemName, " Circle"
                    )
                  )
                )

                /* District Cards */
                , circleDistrictsData.length > 0 ? (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                      , circleDistrictsData.map((dist) => (
                        React.createElement(HierarchyCard, {
                          key: dist.id,
                          title: dist.name,
                          overallProgress: dist.overall,
                          color: dist.color,
                          onClick: () => {
                            setParentDivisionId(selectedItemId);
                            setParentDivisionName(selectedItemName);
                            setParentDistrictId(null);
                            setParentDistrictName(null);
                            setSelectedItemId(dist.id);
                            setSelectedItemName(dist.name);
                            setSelectedItemType("district");
                          }
                        }
                        )
                      ))
                    )

                    /* Charts for District */
                    , renderAggregatedCharts(
                      selectedItemName + " Circle",
                      singleItemData,
                      projectsInSelectedGeography,
                      false,
                    )
                  )
                ) : (
                  React.createElement(Card, { className: "border-border/50" }
                    , React.createElement(CardContent, { className: "p-8 text-center" }
                      , React.createElement('p', { className: "text-muted-foreground" }, "No districts found for "
                        , selectedItemName, " Circle."
                      )
                    )
                  )
                )
              )
            );
          })()
        ) : null)

        /* District Selected - Show Tehsils */
        , selectedItemName &&
        selectedItemType === "district" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex items-center gap-4" }
              , React.createElement(Skeleton, { className: "h-10 w-32" })
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-64" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : singleItemData ? (
          (() => {
            const districtTehsilsData = apiTehsils
              .filter((t) => Number(t.district) === Number(selectedItemId))
              .map((teh, index) => {
                const projects = apiProjects.filter((p) => Number(p.tehsil) === Number(teh.id));
                const overall = calcProjectsOverall(projects);
                return {
                  id: teh.id,
                  name: teh.tehsil_name,
                  overall,
                  color: CARD_COLORS[index % CARD_COLORS.length],
                };
              })
              .sort((a, b) => b.overall - a.overall);

            return (
              React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0" }
                  , React.createElement('div', { className: "min-w-0" }
                    , React.createElement('h2', { className: "text-lg sm:text-2xl font-bold font-heading break-words" }, "Tehsils in "
                      , selectedItemName, " District"
                    )
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }
                      , selectedItemName, " District"
                    )
                  )

                  , React.createElement('div', { className: "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap justify-start sm:justify-end" }
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold",
                      onClick: () => {
                        setViewType("divisions");
                        setSelectedItemType(null);
                        setSelectedItemId(null);
                        setSelectedItemName(null);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , "All Zones")
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      disabled: !parentDivisionId || !parentDivisionName,
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold disabled:opacity-50 disabled:hover:bg-transparent",
                      onClick: () => {
                        if (!parentDivisionId || !parentDivisionName) return;
                        setViewType("divisions");
                        setSelectedItemType("division");
                        setSelectedItemId(parentDivisionId);
                        setSelectedItemName(parentDivisionName);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , _nullishCoalesce(parentDivisionName, () => ("Circle")))
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement('span', { className: "font-semibold text-[#344054]" }
                      , selectedItemName, " District"
                    )
                  )
                )
                , districtTehsilsData.length > 0 ? (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                      , districtTehsilsData.map((teh) => (
                        React.createElement(HierarchyCard, {
                          key: teh.id,
                          title: teh.name,
                          overallProgress: teh.overall,
                          color: teh.color,
                          onClick: () => {
                            setParentDistrictId(selectedItemId);
                            setParentDistrictName(selectedItemName);
                            setSelectedItemId(teh.id);
                            setSelectedItemName(teh.name);
                            setSelectedItemType("tehsil");
                          }
                        }
                        )
                      ))
                    )
                    , renderAggregatedCharts(
                      selectedItemName + " District",
                      singleItemData,
                      projectsInSelectedGeography,
                      false,
                    )
                  )
                ) : (
                  React.createElement(Card, { className: "border-border/50" }
                    , React.createElement(CardContent, { className: "p-8 text-center" }
                      , React.createElement('p', { className: "text-muted-foreground" }, "No tehsils found for "
                        , selectedItemName, " District."
                      )
                    )
                  )
                )
              )
            );
          })()
        ) : null)

        /* Tehsil Selected - Show Detail View */
        , selectedItemName &&
        selectedItemType === "tehsil" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex items-center gap-4" }
              , React.createElement(Skeleton, { className: "h-10 w-32" })
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-64" })
              )
            )
            , renderSkeletonLoader()
          )
        ) : singleItemData ? (
          (() => {
            // API-driven: use parent tracking state for back navigation
            const tehsilProjects = apiProjects.filter(
              (p) => p.tehsil === selectedItemId,
            );
            const tehsilSlug =
              _optionalChain([selectedItemName, 'optionalAccess', _41 => _41.toLowerCase, 'call', _42 => _42(), 'access', _43 => _43.replace, 'call', _44 => _44(/\s+/g, "")]) || "";

            return (
              React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0" }
                  , React.createElement('div', { className: "min-w-0" }
                    /* Title removed per request (avoid duplicate tehsil text). */
                  )

                  , React.createElement('div', { className: "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap justify-start sm:justify-end w-full sm:w-auto" }
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold",
                      onClick: () => {
                        setViewType("divisions");
                        setSelectedItemType(null);
                        setSelectedItemId(null);
                        setSelectedItemName(null);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , "All Zones")
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      disabled: !parentDivisionId || !parentDivisionName,
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold disabled:opacity-50 disabled:hover:bg-transparent",
                      onClick: () => {
                        if (!parentDivisionId || !parentDivisionName) return;
                        setViewType("divisions");
                        setSelectedItemType("division");
                        setSelectedItemId(parentDivisionId);
                        setSelectedItemName(parentDivisionName);
                        setParentDivisionId(null);
                        setParentDivisionName(null);
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , _nullishCoalesce(parentDivisionName, () => ("Zone")))
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement(Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      disabled: !parentDistrictId || !parentDistrictName,
                      className: "h-8 px-2 text-[#054332] hover:text-[#032d21] hover:bg-[#eaf5ef] font-semibold disabled:opacity-50 disabled:hover:bg-transparent",
                      onClick: () => {
                        if (!parentDistrictId || !parentDistrictName) return;
                        setViewType("divisions");
                        setSelectedItemType("district");
                        setSelectedItemId(parentDistrictId);
                        setSelectedItemName(parentDistrictName);
                        // keep division parent so district header can show "(Division)"
                        setParentDistrictId(null);
                        setParentDistrictName(null);
                        setSelectedProjectForDetails(null);
                      }
                    }
                      , _nullishCoalesce(parentDistrictName, () => ("Circle")))
                    , React.createElement('span', { className: "text-[#98a2b3]" }, "â€º")
                    , React.createElement('span', { className: "font-semibold text-[#344054]" }
                      , selectedItemName, " Tehsil"
                    )
                  )
                )

                /* Project Cards from API */
                , React.createElement('div', { className: "w-full" }
                  , React.createElement('div', { className: "mb-4" }

                  )

                  /* dropdown to pick project for KPI/Gantt */
                  , tehsilProjects.length > 0 && (
                    React.createElement('div', { className: "mb-4 w-full max-w-md sm:w-64 sm:max-w-none" }
                      , React.createElement(Select, {
                        value: selectedProjectForDetails ? String(selectedProjectForDetails.id) : "",
                        onValueChange: (val) => {
                          const p = tehsilProjects.find((x) => String(x.id) === val) || null;
                          setSelectedProjectForDetails(p);
                        }
                      }

                        , React.createElement(SelectTrigger, {}
                          , React.createElement(SelectValue, { placeholder: "Choose project" })
                        )
                        , React.createElement(SelectContent, {}
                          , tehsilProjects.map((project) => (
                            React.createElement(SelectItem, { key: project.id, value: String(project.id) }
                              , project.project_name || `Project ${project.id}`
                            )
                          ))
                        )
                      )
                    )
                  )

                  , tehsilProjects.length > 0 ? (
                    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                      , tehsilProjects.map((project, index) => {
                        const progress = Math.round(
                          _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => (0)),
                        );
                        return (
                          React.createElement(HierarchyCard, {
                            key: project.id,
                            title:
                              project.project_name || `Project ${project.id}`
                            ,
                            overallProgress: progress,
                            onClick: () => {
                              // instead of navigating off-dashboard, show details inline
                              setSelectedProjectForDetails((prev) =>
                                _optionalChain([prev, 'optionalAccess', _45 => _45.id]) === project.id ? null : project,
                              );
                            },
                            color: CARD_COLORS[index % CARD_COLORS.length]
                          }
                          )
                        );
                      })
                    )
                  ) : (
                    React.createElement(Card, { className: "border-border/50" }
                      , React.createElement(CardContent, { className: "p-8 text-center" }
                        , React.createElement('p', { className: "text-muted-foreground" }, "No projects found for "
                          , selectedItemName, " Tehsil."
                        )
                      )
                    )
                  )

                  /* details/pseudo-gantt for selected project */
                  , selectedProjectForDetails && (
                    React.createElement(MilestoneDetailsPanel, {
                      milestoneTitle: `${selectedProjectForDetails.project_name} - Project Gantt`,
                      phase: selectedProjectPhase,
                      phaseColor: "#054332",
                      flatGanttTasks: selectedProjectGanttTasks,
                      ganttProjectId: selectedProjectForDetails.id,
                      onProjectGanttRefresh: refetchSelectedProjectGantt,
                      onClear: () => setSelectedProjectForDetails(null)
                    }
                    )
                  )
                )
              )
            );
          })()
        ) : null)

        /* Hierarchy Cards View with Charts */
        , !selectedItemName &&
        viewType === "divisions" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-80" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : aggregatedData ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement('h2', { className: "text-lg font-bold font-heading mb-1" }, "All Punjab Zones"

                )
              )

              /* Show More/Less Button */
              , zonesData.length > 4 && (
                React.createElement(Button, {
                  variant: "default",
                  onClick: () => setExpandedDivisions(!expandedDivisions),
                  className: "rounded-xl h-9 whitespace-nowrap bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer text-[12px]"
                }

                  , expandedDivisions ? (
                    React.createElement(React.Fragment, null
                      , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white" }), "Show Less ("
                      , zonesData.length - 4, " hidden)"
                    )
                  ) : (
                    React.createElement(React.Fragment, null
                      , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white" }), "Show More ("
                      , zonesData.length - 4, " more)"
                    )
                  )
                )
              )
            )

            /* Division Cards */
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , (expandedDivisions
                ? zonesData
                : zonesData.slice(0, 4)
              ).map((zone) => (
                React.createElement(HierarchyCard, {
                  key: zone.id,
                  title: zone.name,
                  overallProgress: zone.overall,
                  color: zone.color,
                  onClick: () => {
                    setSelectedItemId(zone.id);
                    setSelectedItemName(zone.name);
                    setSelectedItemType("zone");
                    setParentDivisionId(null);
                    setParentDivisionName(null);
                    setParentDistrictId(null);
                    setParentDistrictName(null);
                  }
                }
                )
              ))
            )

            /* Aggregated Charts Section - Same as detail view */
            , renderAggregatedCharts(
              "All Punjab Zones",
              aggregatedData,
              topProjectsForAggregateViews.length > 0
                ? topProjectsForAggregateViews
                : undefined,
              false,
            )
          )
        ) : null)

        , !selectedItemName &&
        viewType === "districts" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-80" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : aggregatedData ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement('h2', { className: "text-lg font-bold font-heading mb-1" }, "All Punjab Circles"

                )
              )

              /* Show More/Less Button */
              , divisionsData.length > 4 && (
                React.createElement(Button, {
                  variant: "default",
                  onClick: () => setExpandedDistricts(!expandedDistricts),
                  className: "rounded-xl h-9 whitespace-nowrap bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer text-[12px]"
                }

                  , expandedDistricts ? (
                    React.createElement(React.Fragment, null
                      , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white" }), "Show Less ("
                      , divisionsData.length - 4, " hidden)"
                    )
                  ) : (
                    React.createElement(React.Fragment, null
                      , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white" }), "Show More ("
                      , divisionsData.length - 4, " more)"
                    )
                  )
                )
              )
            )

            /* Circle Cards */
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , (expandedDistricts
                ? divisionsData
                : divisionsData.slice(0, 4)
              ).map((circle) => (
                React.createElement(HierarchyCard, {
                  key: circle.id,
                  title: circle.name,
                  overallProgress: circle.overall,
                  color: circle.color
                }
                )
              ))
            )

            /* Aggregated Charts Section */
            , renderAggregatedCharts(
              "All Punjab Circles",
              aggregatedData,
              topProjectsForAggregateViews.length > 0
                ? topProjectsForAggregateViews
                : undefined,
              false,
            )
          )
        ) : null)

        , !selectedItemName &&
        viewType === "tehsils" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-80" })
              )
            )
            , React.createElement('div', { className: "space-y-4" }
              , Array.from({ length: 2 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-4" })
                  , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                    , Array.from({ length: 4 }).map((_, j) => (
                      React.createElement(Card, { key: j, className: "p-4" }
                        , React.createElement(Skeleton, { className: "h-5 w-24 mb-3" })
                        , React.createElement(Skeleton, { className: "h-8 w-16 mb-2" })
                        , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                      )
                    ))
                  )
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : aggregatedData ? (
          (() => {
            const filteredDistrictCards = districtsData.filter((d) => {
              if (!tehsilSearchQuery.trim()) return true;
              return d.name.toLowerCase().includes(tehsilSearchQuery.toLowerCase());
            });

            return (
              React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
                  , React.createElement('div', {}
                    , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1" }, "All Punjab Districts"

                    )
                    , React.createElement('p', { className: "text-sm text-muted-foreground" }, "District cards from district API, sorted by progress"

                    )
                  )

                  , React.createElement('div', { className: "relative flex-1 sm:max-w-[320px]" }
                    , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" })
                    , React.createElement(Input, {
                      type: "text",
                      placeholder: "Search by district name...",
                      value: tehsilSearchQuery,
                      onChange: (e) => setTehsilSearchQuery(e.target.value),
                      className: "pl-9 h-9 rounded-xl border-border/50 bg-background"
                    }
                    )
                  )
                )
                , filteredDistrictCards.length === 0 ? (
                  React.createElement(Card, { className: "border-border/50" }
                    , React.createElement(CardContent, { className: "p-8 text-center" }
                      , React.createElement('p', { className: "text-muted-foreground" }, "No districts found matching \""
                        , tehsilSearchQuery, "\". Please try a different search term."

                      )
                    )
                  )
                ) : (
                  React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
                    , filteredDistrictCards.map((dist) => (
                      React.createElement(HierarchyCard, {
                        key: dist.id,
                        title: dist.name,
                        overallProgress: dist.overall,
                        color: dist.color
                      }
                      )
                    ))
                  )
                )

                /* Aggregated Charts Section */
                , renderAggregatedCharts(
                  "All Punjab Districts",
                  aggregatedData,
                  topProjectsForAggregateViews.length > 0
                    ? topProjectsForAggregateViews
                    : undefined,
                  false,
                )
              )
            );
          })()
        ) : null)

        , !selectedItemName &&
        viewType === "projects" &&
        (isLoading ? (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement(Skeleton, { className: "h-7 w-48 mb-2" })
                , React.createElement(Skeleton, { className: "h-4 w-80" })
              )
            )
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , Array.from({ length: 4 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "p-6" }
                  , React.createElement(Skeleton, { className: "h-6 w-32 mb-3" })
                  , React.createElement(Skeleton, { className: "h-10 w-20 mb-2" })
                  , React.createElement(Skeleton, { className: "h-2 w-full rounded-full" })
                )
              ))
            )
            , renderSkeletonLoader()
          )
        ) : (
          React.createElement('div', { className: "space-y-6" }
            , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }
              , React.createElement('div', {}
                , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1" }, "All Projects"

                )
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Select a project to view its Gantt chart and details"

                )
              )

              , (() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(apiProjects.length / PROJECTS_PAGE_SIZE),
                );
                const canPrev = projectsPage > 1;
                const canNext = projectsPage < totalPages;
                return (
                  React.createElement('div', { className: "flex items-center gap-2" }
                    , React.createElement('span', { className: "text-xs text-muted-foreground hidden sm:inline" }, "Page "
                      , projectsPage, " / ", totalPages
                    )
                    , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      disabled: !canPrev,
                      onClick: () =>
                        setProjectsPage((p) => Math.max(1, p - 1))
                      
                    }
                      , "Prev"

                    )
                    , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      disabled: !canNext,
                      onClick: () =>
                        setProjectsPage((p) =>
                          Math.min(totalPages, p + 1),
                        )
                      
                    }
                      , "Next"

                    )
                  )
                );
              })()
            )

            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }
              , (() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(apiProjects.length / PROJECTS_PAGE_SIZE),
                );
                const safePage = Math.min(
                  Math.max(1, projectsPage),
                  totalPages,
                );
                const start = (safePage - 1) * PROJECTS_PAGE_SIZE;
                const pageProjects = apiProjects.slice(
                  start,
                  start + PROJECTS_PAGE_SIZE,
                );

                return pageProjects.map((project, index) => {
                  const progress = Math.round(
                    _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => (0)),
                  );
                  return (
                    React.createElement(HierarchyCard, {
                      key: project.id,
                      title: project.project_name || `Project ${project.id}`,
                      overallProgress: progress,
                      onClick: () =>
                        setSelectedProjectForDetails((prev) =>
                          _optionalChain([prev, 'optionalAccess', _50 => _50.id]) === project.id ? null : project,
                        )
                      ,
                      color: CARD_COLORS[(start + index) % CARD_COLORS.length]
                    }
                    )
                  );
                });
              })()
            )

            , selectedProjectForDetails && (
              React.createElement(MilestoneDetailsPanel, {
                milestoneTitle: `${selectedProjectForDetails.project_name} - Project Gantt`,
                phase: selectedProjectPhase,
                phaseColor: "#054332",
                flatGanttTasks: selectedProjectGanttTasks,
                ganttProjectId: selectedProjectForDetails.id,
                onProjectGanttRefresh: refetchSelectedProjectGantt,
                onClear: () => setSelectedProjectForDetails(null)
              }
              )
            )
          )
        ))
      )

    )
  );
}
