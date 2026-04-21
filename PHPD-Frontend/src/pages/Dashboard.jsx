import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Layout } from "@/components/layout/Layout";
import { InstallationCard } from "@/components/dashboard/InstallationCard";

import { PhaseDistributionChart } from "@/components/dashboard/PhaseDistributionChart";
import { PhaseTimelineChart } from "@/components/dashboard/PhaseTimelineChart";
import { PlannedVsActualChart } from "@/components/dashboard/PlannedVsActualChart";
import { HierarchyCard } from "@/components/dashboard/HierarchyCard";

import { MilestoneDetailsPanel } from "@/components/dashboard/MilestoneDetailsPanel";
import { exportDashboardToPPTX } from "@/utils/exportToPPTX";
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
  FileDown,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

// Enhanced installation progress data with sub-projects and planned vs actual









































const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] ;

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
    labels.push(_nullishCoalesce(MONTH_LABELS[cursor.getMonth()], () => ( "Jan")));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return labels;
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function diffDaysInclusive(start, end) {
  const s = safeParseDate(_nullishCoalesce(start, () => ( null)));
  const e = safeParseDate(_nullishCoalesce(end, () => ( null)));
  if (!s || !e) return 1;
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

function buildPhaseFromProjectGantt(
  tasks,
  options,
)




 {
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
      progress: clamp01(Number(_nullishCoalesce(t.progress, () => ( 0)))),
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
      const list = _nullishCoalesce(childrenByParent.get(pid), () => ( []));
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
        const kids = _nullishCoalesce(childrenByParent.get(cur), () => ( []));
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
      const kids = _nullishCoalesce(childrenByParent.get(cur), () => ( []));
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
      const kids = _nullishCoalesce(groupMap.get(cur), () => ( []));
      for (const k of kids) {
        if (!depthById.has(k.id)) {
          depthById.set(k.id, (_nullishCoalesce(depthById.get(cur), () => ( 0))) + 1);
          stack.push(k.id);
        }
      }
    }
  }

  for (const [parentId, rows] of Array.from(groupMap.entries())) {
    const realParent = datedById.get(parentId);
    const header = _nullishCoalesce(realParent, () => ( rows[0]));
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
    const id = String(_nullishCoalesce(_optionalChain([tasks, 'access', _3 => _3[i], 'optionalAccess', _4 => _4.id]), () => ( "")));
    if (!id) continue;
    if (!apiIndex.has(id)) apiIndex.set(id, i);
  }
  groups.sort((a, b) => (_nullishCoalesce(apiIndex.get(a.header.id), () => ( 0))) - (_nullishCoalesce(apiIndex.get(b.header.id), () => ( 0))));

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
      actualProgress: clamp01(Number(_nullishCoalesce(g.header.progress, () => ( 0)))),
      plannedProgress: planned,
      // Weight is derived from total duration of direct children (data-driven, not hardcoded).
      weight: Math.max(
        0,
        milestones.reduce((sum, m) => sum + (Number(m.duration) || 0), 0),
      ),
      startDate,
      finishDate,
      milestones: milestones ,
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
    const s = safeParseDate(_nullishCoalesce(sp.startDate, () => ( null)));
    const e = safeParseDate(_nullishCoalesce(sp.finishDate, () => ( null)));
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

// Generate sub-projects for a phase
const generateSubProjects = (
  phaseKey,
  actualProgress,
  plannedProgress,
  division,
  district,
  tehsil,
) => {
  // Backend progress logic not implemented yet — show 0% everywhere (no synthetic subprojects).
  return [];
  const subProjectTemplates


 = {
    surveys: {
      names: [
        "Site Survey & Assessment",
        "Technical Feasibility Study",
        "Site Selection & Approval",
        "Environmental Clearance",
      ],
      weights: [0.3, 0.25, 0.25, 0.2],
    },
    foundations: {
      names: [
        "Excavation Work",
        "Foundation Pouring",
        "Curing & Quality Check",
        "Backfilling & Compaction",
      ],
      weights: [0.25, 0.35, 0.2, 0.2],
    },
    cabinet: {
      names: [
        "Cabinet Installation",
        "Electrical Connections",
        "Network Setup",
        "Equipment Mounting",
      ],
      weights: [0.3, 0.25, 0.25, 0.2],
    },
    cable: {
      names: [
        "Cable Trenching",
        "Fiber Optic Laying",
        "Power Cable Installation",
        "Cable Termination & Testing",
      ],
      weights: [0.25, 0.3, 0.25, 0.2],
    },
    controlRoom: {
      names: [
        "Room Renovation",
        "Server Installation",
        "Display Systems",
        "Control Systems Integration",
      ],
      weights: [0.25, 0.3, 0.25, 0.2],
    },
    ppic3: {
      names: [
        "System Integration",
        "Software Deployment",
        "Testing & Commissioning",
        "Go-Live Preparation",
      ],
      weights: [0.3, 0.25, 0.25, 0.2],
    },
  };

  const template = subProjectTemplates[phaseKey] || {
    names: ["Sub-Project 1", "Sub-Project 2", "Sub-Project 3"],
    weights: [0.33, 0.33, 0.34],
  };

  // Generate sub-projects with variance based on parent progress (only for non-Bahawalpur)
  const variance = actualProgress - plannedProgress;

  return template.names.map((name, index) => {
    const weight = template.weights[index];
    const baseActual = actualProgress * (0.8 + Math.random() * 0.4); // Vary around parent
    const basePlanned = plannedProgress * (0.8 + Math.random() * 0.4);

    return {
      id: `${phaseKey}-${index}`,
      name,
      actualProgress: Math.min(100, Math.max(0, baseActual)),
      plannedProgress: Math.min(100, Math.max(0, basePlanned)),
      weight,
    };
  });
};

// Helper to convert legacy data to new format
const convertToPhaseProgress = (
  currentValue,
  phaseKey,
  timelineData,
  division,
  district,
  tehsil,
) => {
  // Backend progress logic not implemented yet — keep everything at 0%.
  const plannedProgress = 0;

  // Generate timeline if not provided
  const timeline =
    _optionalChain([timelineData, 'optionalAccess', _5 => _5.map, 'call', _6 => _6((point) => {
      const actual = 0;
      const planned = 0;
      return {
        month: point.month ,
        actual,
        planned,
      };
    })]) || [];

  return {
    actual: 0,
    planned: plannedProgress,
    subProjects: generateSubProjects(
      phaseKey,
      0,
      plannedProgress,
      division,
      district,
      tehsil,
    ),
    timeline: timeline.length > 0 ? timeline : undefined,
  };
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
    (acc, p) => acc + num(_optionalChain([(p ), 'optionalAccess', _7 => _7.total_budget_allocated])),
    0,
  );
  const utilized = projects.reduce(
    (acc, p) => acc + num(_optionalChain([(p ), 'optionalAccess', _8 => _8.budget_utilized])),
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

export default function Dashboard() {
  const { isCollapsed, setCollapsed } = useSidebar();
  const sidebarPrevCollapsedRef = useRef(null);
  const [location, setLocation] = useLocation();
  const [viewType, setViewType] = useState

("divisions");
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState

(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
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

  // API queries
  const { data: apiDivisions = [] } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => listDivisions(),
  });
  const { data: apiDistricts = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: () => listDistricts(),
  });
  const { data: apiTehsils = [] } = useQuery({
    queryKey: ["tehsils"],
    queryFn: () => listTehsils(),
  });
  const { data: apiProjects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  // Fetch all gantt schedules once and use root task progress for each project card.
  const { data: apiProjectGanttAll = [] } = useQuery({
    queryKey: ["project-gantt-all"],
    queryFn: () => getProjectGanttAll(),
  });

  const ganttProgressByProjectId = useMemo(() => {
    const findNodeById = (
      nodes,
      targetId,
    ) => {
      for (const n of nodes) {
        if (String(_nullishCoalesce(_nullishCoalesce(_optionalChain([n, 'optionalAccess', _9 => _9._id]), () => ( _optionalChain([n, 'optionalAccess', _10 => _10.id]))), () => ( ""))) === targetId) return n;
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
    for (const s of apiProjectGanttAll ) {
      const pid = Number(_optionalChain([s, 'optionalAccess', _12 => _12._id]));
      if (!Number.isFinite(pid)) continue;
      const tasks = Array.isArray(_optionalChain([s, 'optionalAccess', _13 => _13.tasks])) ? s.tasks : [];
      const root = _nullishCoalesce(_nullishCoalesce(findNodeById(tasks, "1"), () => ( tasks[0])), () => ( null));
      map.set(pid, toPct(_optionalChain([root, 'optionalAccess', _14 => _14.progress])));
    }
    return map;
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

  const toSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // Hydrate dashboard hierarchy state from clean URL query params (slug-based, no IDs).
  useEffect(() => {
    if (apiDivisions.length === 0 || apiDistricts.length === 0 || apiTehsils.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get("level");
    const viewParam = urlParams.get("view");
    if (viewParam === "divisions" || viewParam === "districts" || viewParam === "tehsils" || viewParam === "projects") {
      setViewType(viewParam);
    }

    const divisionSlug = urlParams.get("division");
    const districtSlug = urlParams.get("district");
    const tehsilSlug = urlParams.get("tehsil");

    if (level === "tehsil" && tehsilSlug) {
      const foundTehsil = apiTehsils.find((t) => {
        if (toSlug(t.tehsil_name) !== tehsilSlug) return false;
        if (districtSlug && toSlug(t.district_name) !== districtSlug) return false;
        if (divisionSlug && toSlug(t.division_name) !== divisionSlug) return false;
        return true;
      });
      if (foundTehsil) {
        skipNextUrlSyncRef.current = true;
        setSelectedItemType("tehsil");
        setSelectedItemId(foundTehsil.id);
        setSelectedItemName(foundTehsil.tehsil_name);
        setParentDistrictId(foundTehsil.district);
        setParentDistrictName(foundTehsil.district_name);
        setParentDivisionId(foundTehsil.division);
        setParentDivisionName(foundTehsil.division_name);
      }
      return;
    }

    if (level === "district" && districtSlug) {
      const foundDistrict = apiDistricts.find((d) => {
        if (toSlug(d.district_name) !== districtSlug) return false;
        if (divisionSlug && toSlug(d.division_name) !== divisionSlug) return false;
        return true;
      });
      if (foundDistrict) {
        skipNextUrlSyncRef.current = true;
        setSelectedItemType("district");
        setSelectedItemId(foundDistrict.id);
        setSelectedItemName(foundDistrict.district_name);
        setParentDivisionId(foundDistrict.division);
        setParentDivisionName(foundDistrict.division_name);
        setParentDistrictId(null);
        setParentDistrictName(null);
      }
      return;
    }

    if (level === "division" && divisionSlug) {
      const foundDivision = apiDivisions.find((d) => toSlug(d.division_name) === divisionSlug);
      if (foundDivision) {
        skipNextUrlSyncRef.current = true;
        setSelectedItemType("division");
        setSelectedItemId(foundDivision.id);
        setSelectedItemName(foundDivision.division_name);
        setParentDivisionId(null);
        setParentDivisionName(null);
        setParentDistrictId(null);
        setParentDistrictName(null);
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
        skipNextUrlSyncRef.current = true;
        setSelectedItemName(found.tehsil_name);
        setSelectedItemType("tehsil");
        setSelectedItemId(found.id);
        setParentDistrictId(found.district);
        setParentDistrictName(found.district_name);
        setParentDivisionId(found.division);
        setParentDivisionName(found.division_name);
      }
    }
  }, [location, apiDivisions, apiDistricts, apiTehsils]);

  // Keep URL in sync with drilldown selection.
  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (viewType) params.set("view", viewType);

    if (selectedItemType === "division" && selectedItemId && selectedItemName) {
      params.set("level", "division");
      params.set("division", toSlug(selectedItemName));
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
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
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
    if (viewType === "projects") setProjectsPage(1);
  }, [viewType, apiProjects.length]);

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
        label: "All Divisions",
        clickable: selectedItemType !== null,
      },
    ];

    if (selectedItemType === "division" && selectedItemName) {
      flow.push({
        key: "division",
        label: `${selectedItemName} Division`,
        clickable: false,
      });
    } else if (selectedItemType === "district" && selectedItemName) {
      if (parentDivisionName) {
        flow.push({
          key: "division",
          label: `${parentDivisionName} Division`,
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
          label: `${parentDivisionName} Division`,
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

    if (selectedItemType === "division") {
      const divDistricts = apiDistricts.filter((d) => d.division === selectedItemId);
      const rows = divDistricts.map((d) => ({
        phase: d.district_name,
        percentage: roundPct(districtOverallFromTehsils(d.id)),
      }));
      return {
        title: "District Progress Distribution",
        description: "Progress % of all districts within the selected division",
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
        description: "Progress % of all tehsils within the selected district",
        data: rows.sort((a, b) => b.percentage - a.percentage),
      };
    }

    return null;
  }, [
    selectedItemType,
    selectedItemId,
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
    if (itemType === "division") {
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

  // Projects in the currently selected geography (division / district / tehsil) for "Best Performing Projects" cards
  const projectsInSelectedGeography = useMemo(() => {
    if (!selectedItemId || !selectedItemType) return [];
    if (selectedItemType === "division") {
      return apiProjects.filter((p) => p.division === selectedItemId);
    }
    if (selectedItemType === "district") {
      return apiProjects.filter((p) => p.district === selectedItemId);
    }
    return apiProjects.filter((p) => p.tehsil === selectedItemId);
  }, [selectedItemId, selectedItemType, apiProjects]);

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

  // Overall for All Punjab Divisions (average of division overalls)
  const allDivisionsOverall = useMemo(() => {
    if (apiDivisions.length === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const div of apiDivisions) {
      const projects = apiProjects.filter((p) => p.division === div.id);
      sum += calcProjectsOverall(projects);
      count++;
    }
    return count > 0 ? sum / count : 0;
  }, [apiDivisions, apiProjects]);

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

  // Context theme: follow the currently visible/selected area overall %
  const contextOverall = useMemo(() => {
    if (selectedItemName && singleItemData) return _nullishCoalesce(singleItemData.overall, () => ( 0));
    if (viewType === "projects" && !selectedItemName && !selectedItemType)
      return allProjectsOverallFromGantt;
    if (viewType === "tehsils" && !selectedItemName && !selectedItemType)
      return allProjectsOverallFromGantt;
    if (viewType === "divisions" && !selectedItemName && !selectedItemType)
      return allDivisionsOverall;
    if (viewType === "districts" && !selectedItemName && !selectedItemType)
      return allDistrictsOverall;
    return _nullishCoalesce(_optionalChain([aggregatedData, 'optionalAccess', _21 => _21.overall]), () => ( 0));
  }, [
    selectedItemName,
    singleItemData,
    aggregatedData,
    viewType,
    selectedItemType,
    allProjectsOverallFromGantt,
    allDivisionsOverall,
    allDistrictsOverall,
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

  // Divisions data for cards view (API-driven)
  const divisionsData = useMemo(() => {
    return apiDivisions
      .map((div, index) => {
        const projects = apiProjects.filter((p) => p.division === div.id);
        const overall = calcProjectsOverall(projects);
        return {
          id: div.id,
          name: div.division_name,
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
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1379}}
      /* Installation Phase Cards Skeleton */
      , React.createElement('div', { className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1381}}
        , React.createElement('div', { className: "mb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1382}}
          , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1383}} )
          , React.createElement(Skeleton, { className: "h-4 w-64" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1384}} )
        )
        , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1386}}
          , Array.from({ length: 6 }).map((_, i) => (
            React.createElement(Card, { key: i, className: "p-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1388}}
              , React.createElement(Skeleton, { className: "h-5 w-24 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1389}} )
              , React.createElement(Skeleton, { className: "h-8 w-16 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1390}} )
              , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1391}} )
            )
          ))
        )
      )

      /* Overall Progress Card Skeleton */
      , React.createElement(Card, { className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1398}}
        , React.createElement('div', { className: "flex flex-col md:flex-row md:items-center justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1399}}
          , React.createElement('div', { className: "space-y-3 flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1400}}
            , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1401}}
              , React.createElement(Skeleton, { className: "h-14 w-14 rounded-xl"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1402}} )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1403}}
                , React.createElement(Skeleton, { className: "h-7 w-48" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1404}} )
                , React.createElement(Skeleton, { className: "h-4 w-64" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1405}} )
              )
            )
          )
          , React.createElement('div', { className: "text-center md:text-right" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1409}}
            , React.createElement(Skeleton, { className: "h-16 w-24 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1410}} )
            , React.createElement(Skeleton, { className: "h-8 w-32 rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1411}} )
          )
        )
        , React.createElement('div', { className: "mt-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1414}}
          , React.createElement(Skeleton, { className: "h-5 w-full rounded-full mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1415}} )
          , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1416}}
            , React.createElement(Skeleton, { className: "h-3 w-8" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1417}} )
            , React.createElement(Skeleton, { className: "h-3 w-20" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1418}} )
            , React.createElement(Skeleton, { className: "h-3 w-8" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1419}} )
          )
        )
      )

      /* Pie Charts Skeleton */
      , React.createElement('div', { className: "grid gap-6 md:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1425}}
        , Array.from({ length: 2 }).map((_, i) => (
          React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1427}}
            , React.createElement(Skeleton, { className: "h-6 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1428}} )
            , React.createElement(Skeleton, { className: "h-4 w-64 mb-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1429}} )
            , React.createElement(Skeleton, { className: "h-80 w-full rounded-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1430}} )
          )
        ))
      )

      /* Phase Distribution Chart Skeleton (drilldown only) */
      , selectedItemName && selectedItemType ? (
        React.createElement(Card, { className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1437}}
          , React.createElement(Skeleton, { className: "h-6 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1438}} )
          , React.createElement(Skeleton, { className: "h-4 w-64 mb-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1439}} )
          , React.createElement(Skeleton, { className: "h-80 w-full rounded-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1440}} )
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
    /** When false (division/district drill-down), project cards are display-only — no Gantt fetch. */
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
      clamp01(num(_nullishCoalesce(_nullishCoalesce(_optionalChain([a, 'optionalAccess', _22 => _22.progress]), () => ( _optionalChain([a, 'optionalAccess', _23 => _23.percent_complete]))), () => ( 0))));

    // Financial utilization % (All divisions / scoped)
    const sumBudgetAllocated = scopeProjects.reduce(
      (acc, p) => acc + num(_optionalChain([(p ), 'optionalAccess', _24 => _24.total_budget_allocated])),
      0,
    );
    const sumBudgetUtilized = scopeProjects.reduce(
      (acc, p) => acc + num(_optionalChain([(p ), 'optionalAccess', _25 => _25.budget_utilized])),
      0,
    );
    const utilizationPct =
      sumBudgetAllocated > 0 ? clamp01((sumBudgetUtilized / sumBudgetAllocated) * 100) : 0;

    // Physical progress %: average of activity progresses (project-level avg, then avg across projects)
    const physicalPct = (() => {
      if (!scopeProjects.length) return 0;
      let sum = 0;
      for (const p of scopeProjects) {
        const acts = Array.isArray(_optionalChain([(p ), 'optionalAccess', _26 => _26.activities])) ? (p ).activities : [];
        if (acts.length === 0) {
          sum += 0;
          continue;
        }
        const projAvg =
          acts.reduce((acc, a) => acc + getActivityProgress(a), 0) / Math.max(1, acts.length);
        sum += projAvg;
      }
      return clamp01(sum / Math.max(1, scopeProjects.length));
    })();

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
          React.createElement('div', { className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1662}}
          , React.createElement('div', { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 min-w-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1663}}
            , React.createElement('div', { className: "min-w-0 flex-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1664}}
              , React.createElement('h2', { className: "text-xl font-bold font-heading text-[#0f172a] dark:text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1665}}, "Best Performing Projects"

              )

            )
            , React.createElement('button', { className: "text-[13px] font-bold text-[#054332] dark:text-emerald-400 hover:opacity-80 transition-opacity flex items-center shrink-0 pr-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1668}}, "View All Projects →"
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
                className: "h-8 px-3 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 border-0 transition-colors whitespace-nowrap flex-shrink-0"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1671}}
, "Clear"

              )
            )
          )
          , React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1685}}
            , useProjectCards
              ? projectsInGeography.map((project, index) => {
                  const percentage = Math.round(
                    _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => ( 0)),
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
                      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1694}}
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
                      color: phase.color ,
                      actualProgress: hasDetails ? progress.actual : undefined,
                      plannedProgress: hasDetails ? progress.planned : undefined,
                      selected: selectedMilestoneKey === phase.key,
                      onClick: () => {
                        setSelectedMilestoneKey((prev) =>
                          prev === phase.key ? null : phase.key,
                        );
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1729}}
                    )
                  );
                })
          )

          /* Selected project details (Gantt / WBS) for Division/District views */
          , isSelectedProjectInThisScope && (
            React.createElement('div', { className: "mt-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1750}}
              , React.createElement(MilestoneDetailsPanel, {
                milestoneTitle: `${selectedProjectForDetails.project_name || `Project ${selectedProjectForDetails.id}`} - Project Gantt`,
                phase: selectedProjectPhase,
                phaseColor: "#054332",
                flatGanttTasks: selectedProjectGanttTasks ,
                ganttProjectId: selectedProjectForDetails.id,
                onProjectGanttRefresh: refetchSelectedProjectGantt,
                onClear: () => setSelectedProjectForDetails(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1751}}
              )
            )
          )
          )
        )

        /* Financial Progress Pie Charts (hide when a milestone KPI or a single project is selected) */
        , !selectedMilestoneKey && !isSelectedProjectInThisScope && (
          React.createElement('div', { className: "grid gap-4 md:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1767}}
            /* Financial Progress Donut Chart */
            , React.createElement(Card, { className: "overflow-hidden border border-border/80 bg-card shadow-lg shadow-primary/5 transition-shadow hover:shadow-xl hover:shadow-primary/10"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1769}}
              , React.createElement(CardHeader, { className: "py-3 px-4 pb-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1770}}
                , React.createElement(CardTitle, { className: "text-base font-heading" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1771}}, "Financial Progress Overview"

                )
              )
              , React.createElement(CardContent, { className: "pt-0 px-4 pb-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1775}}
                , React.createElement('div', {
                  className: "relative w-full" ,
                  style: {
                    height: isMobile ? "200px" : isTablet ? "220px" : "260px",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1776}}

                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1782}}
                    , React.createElement(PieChart, {
                      margin: { top: 2, right: 2, bottom: 32, left: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1783}}

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
                        animationBegin: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1786}}

                        , React.createElement(RechartsLabel, {
                          content: ({ viewBox }) => {
                            const cx = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _29 => _29.cx]), () => ( 0));
                            const cy = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _30 => _30.cy]), () => ( 0));
                            const valueText = `${financialActual.toFixed(1)}%`;
                            return (
                              React.createElement('g', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1825}}
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy - (isMobile ? 2 : 3),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-heading font-bold tabular-nums fill-foreground"   ,
                                  style: { fontSize: isMobile ? 14 : 18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1826}}

                                  , valueText
                                )
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy + (isMobile ? 12 : 14),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-medium uppercase tracking-wider fill-muted-foreground"   ,
                                  style: { fontSize: isMobile ? 9 : 10 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1836}}
, "Actual"

                                )
                              )
                            );
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1819}}
                        )
                        , ["#2F8F6C", "#8BC34A", "#ef4444"].map((fill, index) => (
                          React.createElement(Cell, {
                            key: `cell-f-${index}`,
                            fill: fill,
                            stroke: "rgba(255,255,255,0.9)",
                            strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1851}}
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
                            _nullishCoalesce(_optionalChain([props, 'access', _31 => _31.payload, 'optionalAccess', _32 => _32.originalValue]), () => ( value));
                          return [`${originalValue.toFixed(1)}%`, name];
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1859}}
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
                            React.createElement('span', { className: "text-muted-foreground font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1895}}
                              , value, " "
                              , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1897}}
                                , itemValue.toFixed(1), "%"
                              )
                            )
                          );
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1877}}
                      )
                    )
                  )
                )
              )
            )

            /* Overall Progress Donut Chart */
            , React.createElement(Card, { className: "overflow-hidden border border-border/80 bg-card shadow-lg shadow-primary/5 transition-shadow hover:shadow-xl hover:shadow-primary/10"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1911}}
              , React.createElement(CardHeader, { className: "py-3 px-4 pb-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1912}}
                , React.createElement(CardTitle, { className: "text-base font-heading" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1913}}, "Overall Progress"

                )
              )
              , React.createElement(CardContent, { className: "pt-0 px-4 pb-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1917}}
                , React.createElement('div', {
                  className: "relative w-full" ,
                  style: {
                    height: isMobile ? "200px" : isTablet ? "220px" : "260px",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1918}}

                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1924}}
                    , React.createElement(PieChart, {
                      margin: { top: 2, right: 2, bottom: 32, left: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1925}}

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
                        animationBegin: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1928}}

                        , React.createElement(RechartsLabel, {
                          content: ({ viewBox }) => {
                            const cx = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _33 => _33.cx]), () => ( 0));
                            const cy = _nullishCoalesce(_optionalChain([viewBox, 'optionalAccess', _34 => _34.cy]), () => ( 0));
                            const valueText = `${overallActualPct.toFixed(1)}%`;
                            return (
                              React.createElement('g', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1967}}
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy - (isMobile ? 2 : 3),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-heading font-bold tabular-nums fill-foreground"   ,
                                  style: { fontSize: isMobile ? 14 : 18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1968}}

                                  , valueText
                                )
                                , React.createElement('text', {
                                  x: cx,
                                  y: cy + (isMobile ? 12 : 14),
                                  textAnchor: "middle",
                                  dominantBaseline: "central",
                                  className: "font-medium uppercase tracking-wider fill-muted-foreground"   ,
                                  style: { fontSize: isMobile ? 9 : 10 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1978}}
, "Actual"

                                )
                              )
                            );
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1961}}
                        )
                        , ["#2F8F6C", "#8BC34A", "#ef4444"].map((fill, index) => (
                          React.createElement(Cell, {
                            key: `cell-o-${index}`,
                            fill: fill,
                            stroke: "rgba(255,255,255,0.9)",
                            strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1993}}
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
                            _nullishCoalesce(_optionalChain([props, 'access', _35 => _35.payload, 'optionalAccess', _36 => _36.originalValue]), () => ( value));
                          return [`${originalValue.toFixed(1)}%`, name];
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2001}}
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
                            React.createElement('span', { className: "text-muted-foreground font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2035}}
                              , value, " "
                              , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2037}}
                                , itemValue.toFixed(1), "%"
                              )
                            )
                          );
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2019}}
                      )
                    )
                  )
                )
              )
            )
          )
        )

        /* Milestone details should appear beneath Overall Progress (and replace the old charts when selected) */
        , selectedMilestoneKey &&
          selectedPhaseMeta &&
          selectedProgress &&
          hasDetailedProgress(selectedProgress) && (
            React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2057}}
              /* Header with Toggle - Right side where charts are shown */
              , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2059}}
                , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2060}}
                  , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2061}}
                    , progressType === "financial"
                      ? `${selectedPhaseMeta.title} - Financial Progress`
                      : `${selectedPhaseMeta.title} - Milestone KPIs`
                  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2066}}
                    , progressType === "financial"
                      ? "Financial progress charts and analysis"
                      : "Gantt chart and WBS breakdown"
                  )
                )
                /* Progress Type Toggle - Right side */
                , React.createElement('div', { className: "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg border-2 border-primary/20 bg-background shadow-sm hover:border-primary/40 transition-colors flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2073}}
                  , React.createElement(TrendingUp, {
                    className: `h-4 w-4 ${progressType === "physical" ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2074}}
                  )
                  , React.createElement('span', {
                    className: `text-sm font-semibold ${progressType === "physical" ? "text-foreground" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2077}}
, "Physical"

                  )
                  , React.createElement('button', {
                    type: "button",
                    onClick: () =>
                      setProgressType((prev) =>
                        prev === "physical" ? "financial" : "physical",
                      )
                    ,
                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      progressType === "financial" ? "bg-primary" : "bg-muted"
                    }`,
                    'aria-label': "Toggle between Physical and Financial Progress"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2082}}

                    , React.createElement('span', {
                      className: `inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        progressType === "financial"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2094}}
                    )
                  )
                  , React.createElement(DollarSign, {
                    className: `h-4 w-4 ${progressType === "financial" ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2102}}
                  )
                  , React.createElement('span', {
                    className: `text-sm font-semibold ${progressType === "financial" ? "text-foreground" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2105}}
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
                onClear: () => setSelectedMilestoneKey(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2112}}
              )
            )
          )

        /* Charts Grid (drilldown only; hide in All Divisions/Districts/Tehsils views and when a single project is selected) */
        , !selectedMilestoneKey && !isAggregatedView && !isSelectedProjectInThisScope && (
          React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2141}}
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2142}}
              , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2143}}, "Analytics & Insights"

              )
              , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2146}}, "Detailed progress analysis for "
                    , title
              )
            )

            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2151}}
              /* (Removed) Installation Progress Timeline + Phase Breakdown charts */
            )

            /* Phase Distribution Pie Chart */
            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2156}}
              , React.createElement('div', { className: "lg:col-span-12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2157}}
                , React.createElement(PhaseDistributionChart, {
                  title: _optionalChain([distributionChart, 'optionalAccess', _37 => _37.title]),
                  description: _optionalChain([distributionChart, 'optionalAccess', _38 => _38.description]),
                  data: 
                    _nullishCoalesce(_optionalChain([distributionChart, 'optionalAccess', _39 => _39.data]), () => (
                    installationPhases.map((phase) => ({
                      phase: phase.title,
                      percentage: getProgressValue(data[phase.key]),
                    }))))
                  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2158}}
                )
              )
            )

            /* Planned vs Actual Charts for Each Phase - Only show when specific item is selected (not aggregated view) */
            , title.startsWith("All Punjab") ? null : (
              React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2174}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2175}}
                  , React.createElement('h3', { className: "text-lg font-bold font-heading mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2176}}, "Planned vs Actual Progress"

                  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2179}}, "Compare actual progress against planned milestones for each project phase"


                  )
                )
                , React.createElement('div', { className: "grid gap-4 lg:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2184}}
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
                        color: colorMap[phase.color] || "#6b7280", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2200}}
                      )
                    );
                  })
                )
              )
            )

            /* Phase Timeline Chart */
            , React.createElement('div', { className: "grid gap-4 lg:grid-cols-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2213}}
              , React.createElement('div', { className: "lg:col-span-12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2214}}
                , React.createElement(PhaseTimelineChart, {
                  timelineData: data.timeline,
                  cityKey: title, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2215}}
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
      key: "surveys" ,
      title: "Surveys",
      icon: ClipboardCheck,
      color: "blue" ,
    },
    {
      key: "foundations" ,
      title: "Foundations Pole Installations",
      icon: Building2,
      color: "green" ,
    },
    {
      key: "cabinet" ,
      title: "Cabinet Cameras Installation",
      icon: Camera,
      color: "orange" ,
    },
    {
      key: "cable" ,
      title: "Cable Laying & Power Connections",
      icon: Zap,
      color: "purple" ,
    },
    {
      key: "controlRoom" ,
      title: "Control Room Renovations",
      icon: Home,
      color: "red" ,
    },
    {
      key: "ppic3" ,
      title: "PPIC3 Go Live",
      icon: Radio,
      color: "yellow" ,
    },
  ];

  return (
    React.createElement(Layout, { title: "PHPD Progress Dashboard"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2267}}
      , React.createElement('div', {
        className: "flex flex-col gap-4"  ,
        style: {
          // Page-level theme variables (used by chart cards, headers, etc.)
          ["--progress-accent" ]: contextTheme.accent,
          ["--progress-accent-soft" ]: contextTheme.accentSoft,
          ["--progress-accent-border" ]: contextTheme.accentBorder,
          ["--progress-accent-glow" ]: contextTheme.accentGlow,
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2268}}

        /* Top Header Section - Enhanced Design with Filter Bar */
        , React.createElement('div', {
          className: "relative overflow-hidden rounded-[2.5rem] bg-white border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] flex flex-col mb-2 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"          ,
          style: {
            borderColor: "rgba(255,255,255,0.8)",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2279}}

          , React.createElement('div', { className: "absolute inset-0 bg-grid-pattern opacity-[0.02]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2286}})
          /* soft tint overlay so the page feels \"on track\" based on context */
          , React.createElement('div', {
            className: "absolute inset-0 pointer-events-none"  ,
            style: {
              backgroundImage: [
                // stronger radial tint
                `radial-gradient(900px circle at 18% 22%, var(--progress-accent-soft), transparent 55%)`,
                // subtle top-to-bottom wash
                `linear-gradient(180deg, var(--progress-accent-soft), transparent 55%)`,
              ].join(", "),
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2288}}
          )

          /* Filter Bar Section - Radio Buttons */
          , React.createElement('div', {
            className: `relative transition-all duration-300 order-2 md:order-1 ${
              isFilterBarExpanded
                ? "border-b border-border/30 pb-3 px-3 sm:px-6 pt-3 sm:pt-4"
                : "pb-2 px-3 sm:px-4 pt-2 sm:pt-3"
            }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2301}}

            , React.createElement('div', { className: "flex items-start justify-between gap-2 sm:gap-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2308}}
              , React.createElement('div', { className: "flex items-center gap-2 sm:gap-4 flex-1 min-w-0 overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2309}}
                /* Filters Label / Toggle */
                , React.createElement('div', {
                  className: "flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"       ,
                  onClick: () => setShowFilters(!showFilters), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2311}}

                  , React.createElement(Filter, {
                    className: `h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2315}}
                  )
                  , React.createElement('span', { className: "text-xs sm:text-sm font-semibold text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2318}}
                    , showFilters ? "View:" : navigationFlow.length > 1 ? "Path:" : "View:"
                  )
                )

                /* Radio Button Group with Animation */
                , React.createElement(AnimatePresence, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2324}}
                  , showFilters && (
                    React.createElement(motion.div, {
                      initial: { width: 0, opacity: 0, x: -20 },
                      animate: { width: "auto", opacity: 1, x: 0 },
                      exit: { width: 0, opacity: 0, x: -20 },
                      transition: { duration: 0.4, ease: "circOut" },
                      className: "overflow-hidden flex items-center min-w-0 w-full pb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2326}}

                      , React.createElement(RadioGroup, {
                        value: viewType,
                        onValueChange: (value) => {
                          setViewType(
                            value ,
                          );
                          setSelectedItemName(null);
                          setSelectedItemType(null);
                          setExpandedDivisions(false);
                          setExpandedDistricts(false);
                          // Initialize default districts (Lahore and Sheikhupura) when switching to tehsils view
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
                        },
                        className: "grid grid-cols-2 gap-2 pl-1 sm:pl-2 sm:flex sm:items-center sm:gap-4 md:gap-6 sm:whitespace-nowrap"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2333}}

                        , React.createElement('div', { className: "flex items-center space-x-1.5 sm:space-x-2 rounded-md bg-background/40 px-2 py-1"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2360}}
                          , React.createElement(RadioGroupItem, {
                            value: "divisions",
                            id: "divisions",
                            className: "h-4 w-4 sm:h-5 sm:w-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2361}}
                          )
                          , React.createElement(Label, {
                            htmlFor: "divisions",
                            className: "text-xs sm:text-sm font-medium text-foreground cursor-pointer"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2366}}

                            , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2370}}, "All Divisions"

                            )
                            , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2373}}, "Divisions")
                          )
                        )
                        , React.createElement('div', { className: "flex items-center space-x-1.5 sm:space-x-2 rounded-md bg-background/40 px-2 py-1"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2376}}
                          , React.createElement(RadioGroupItem, {
                            value: "districts",
                            id: "districts",
                            className: "h-4 w-4 sm:h-5 sm:w-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2377}}
                          )
                          , React.createElement(Label, {
                            htmlFor: "districts",
                            className: "text-xs sm:text-sm font-medium text-foreground cursor-pointer"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2382}}

                            , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2386}}, "All Districts"

                            )
                            , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2389}}, "Districts")
                          )
                        )
                        , React.createElement('div', { className: "flex items-center space-x-1.5 sm:space-x-2 rounded-md bg-background/40 px-2 py-1"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2392}}
                          , React.createElement(RadioGroupItem, {
                            value: "tehsils",
                            id: "tehsils",
                            className: "h-4 w-4 sm:h-5 sm:w-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2393}}
                          )
                          , React.createElement(Label, {
                            htmlFor: "tehsils",
                            className: "text-xs sm:text-sm font-medium text-foreground cursor-pointer"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2398}}

                            , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2402}}, "All Tehsils"

                            )
                            , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2405}}, "Tehsils")
                          )
                        )
                        , React.createElement('div', { className: "flex items-center space-x-1.5 sm:space-x-2 rounded-md bg-background/40 px-2 py-1"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2408}}
                          , React.createElement(RadioGroupItem, {
                            value: "projects",
                            id: "projects",
                            className: "h-4 w-4 sm:h-5 sm:w-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2409}}
                          )
                          , React.createElement(Label, {
                            htmlFor: "projects",
                            className: "text-xs sm:text-sm font-medium text-foreground cursor-pointer"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2414}}

                            , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2418}}, "All Projects"

                            )
                            , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2421}}, "Projects")
                          )
                        )
                      )
                    )
                  )
                )

                /* Compact breadcrumb on same row when filters are collapsed */
                , !showFilters && navigationFlow.length > 1 && (
                  React.createElement('div', { className: "grid grid-cols-2 gap-2 text-xs sm:text-sm min-w-0 sm:flex sm:flex-wrap sm:items-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2431}}
                    , navigationFlow.map((step, idx) => (
                      React.createElement('button', {
                        key: `${step.key}-compact-${idx}`,
                        type: "button",
                        onClick: () =>
                          step.clickable && handleNavigateToLevel(step.key)
                        ,
                        disabled: !step.clickable,
                        className: `flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors min-w-0 justify-center sm:justify-start ${
                          step.clickable
                            ? "border-primary bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-sm hover:shadow-md"
                            : "border-secondary bg-secondary text-white cursor-default shadow-sm"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2433}}

                        , idx > 0 && (
                          React.createElement('span', { className: "text-white/80", 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2447}}
                            , "->"
                          )
                        )
                        , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2451}}, step.label)
                      )
                    ))
                  )
                )
              )

              /* Expand/Collapse Button */
              , React.createElement(Button, {
                variant: "outline",
                size: "icon",
                onClick: () => setIsFilterBarExpanded(!isFilterBarExpanded),
                className: "rounded-xl w-9 h-9 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm flex-shrink-0"        ,
                title: isFilterBarExpanded ? "Collapse" : "Expand", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2459}}

                , isFilterBarExpanded ? (
                  React.createElement(ChevronUp, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2467}} )
                ) : (
                  React.createElement(ChevronDown, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2469}} )
                )
              )
            )

            /* Drilldown navigation flow (shown in header bar) */
            , showFilters && navigationFlow.length > 1 && (
              React.createElement('div', { className: "mt-2 ml-1 sm:ml-2 text-xs sm:text-sm"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2476}}
                , React.createElement('span', { className: "font-medium text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2477}}, "Navigation:"

                )
                , React.createElement('div', { className: "mt-2 grid grid-cols-2 gap-2 sm:mt-0 sm:ml-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2480}}
                  , navigationFlow.map((step, idx) => (
                    React.createElement('button', {
                      key: `${step.key}-${idx}`,
                      type: "button",
                      onClick: () =>
                        step.clickable && handleNavigateToLevel(step.key)
                      ,
                      disabled: !step.clickable,
                      className: `flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors min-w-0 justify-center sm:justify-start ${
                        step.clickable
                          ? "border-primary bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-sm hover:shadow-md"
                          : "border-secondary bg-secondary text-white cursor-default shadow-sm"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2482}}

                      , idx > 0 && (
                        React.createElement('span', { className: "text-white/80", 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2496}}
                          , "->"
                        )
                      )
                      , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2500}}, step.label)
                    )
                  ))
                )
              )
            )
          )

          /* Header Content Section - Collapsible */
          , React.createElement('div', {
            className: `relative flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all duration-300 ease-in-out overflow-hidden order-1 md:order-2 ${
              isFilterBarExpanded
                ? "max-h-[500px] opacity-100 px-4 md:px-6 pt-2 pb-4 md:pb-5"
                : "max-h-0 opacity-0 p-0"
            }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2509}}

            , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2516}}
              , (() => {
                const titleText =
                  selectedItemName && selectedItemType === "division"
                    ? `${selectedItemName} Division`
                    : selectedItemName && selectedItemType === "district"
                      ? `${selectedItemName} District`
                      : selectedItemName && selectedItemType === "tehsil"
                        ? `${selectedItemName} Tehsil`
                        : viewType === "divisions"
                          ? "All Punjab Divisions"
                          : viewType === "districts"
                            ? "All Punjab Districts"
                            : viewType === "tehsils"
                              ? "All Punjab Tehsils"
                              : viewType === "projects"
                                ? "All Projects"
                                : "PHPD Progress Dashboard";

                if (isLoading) {
                  return (
                    React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2537}}
                      , React.createElement('div', { className: "flex items-center justify-between gap-2 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2538}}
                        , React.createElement('h1', { className: "text-xl sm:text-3xl md:text-4xl font-bold font-heading bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate sm:whitespace-normal"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2539}}
                          , titleText
                        )
                        , React.createElement(Skeleton, { className: "h-7 w-28 rounded-full shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2542}} )
                      )
                    )
                  );
                }

                if (!((selectedItemName && singleItemData) || aggregatedData)) {
                  return (
                    React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2550}}
                      , React.createElement('div', { className: "flex items-center justify-between gap-2 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2551}}
                        , React.createElement('h1', { className: "text-xl sm:text-3xl md:text-4xl font-bold font-heading bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate sm:whitespace-normal"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2552}}
                          , titleText
                        )
                      )
                    )
                  );
                }

                return (() => {
                  const overall =
                    selectedItemName && singleItemData
                      ? singleItemData.overall
                      : viewType === "projects" &&
                          !selectedItemName &&
                          !selectedItemType
                        ? allProjectsOverallFromGantt
                        : viewType === "tehsils" &&
                            !selectedItemName &&
                            !selectedItemType
                          ? allProjectsOverallFromGantt
                          : viewType === "divisions" &&
                              !selectedItemName &&
                              !selectedItemType
                            ? allDivisionsOverall
                          : viewType === "districts" &&
                              !selectedItemName &&
                              !selectedItemType
                            ? allDistrictsOverall
                        : _optionalChain([aggregatedData, 'optionalAccess', _40 => _40.overall]) || 0;
                  const meta = getProgressRangeMeta(overall);
                  const overallLabel =
                    viewType === "projects" && !selectedItemName && !selectedItemType
                      ? `${overall.toFixed(2)}`
                      : viewType === "tehsils" && !selectedItemName && !selectedItemType
                        ? `${overall.toFixed(2)}`
                        : viewType === "divisions" && !selectedItemName && !selectedItemType
                          ? `${overall.toFixed(2)}`
                        : viewType === "districts" && !selectedItemName && !selectedItemType
                          ? `${overall.toFixed(2)}`
                      : `${Math.round(overall)}`;

                  // Map color to Tailwind classes
                  const getBadgeClasses = (color) => {
                    if (color === "#ef4444") {
                      // red - Low
                      return "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors";
                    } else if (color === "#f59e0b") {
                      // orange/amber - Moderate
                      return "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors";
                    } else if (color === "#2F8F6C") {
                      // blue - Good
                      return "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors";
                    } else if (color === "#8BC34A" || color === "#2E7D32") {
                      // green/emerald - High/Fully Completed
                      return "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors";
                    }
                    return "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors";
                  };

                  const getIconClasses = (color) => {
                    if (color === "#ef4444")
                      return "h-3.5 w-3.5 mr-1.5 text-red-600 dark:text-red-400";
                    else if (color === "#f59e0b")
                      return "h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400";
                    else if (color === "#2F8F6C")
                      return "h-3.5 w-3.5 mr-1.5 text-emerald-700 dark:text-emerald-300";
                    else if (color === "#8BC34A" || color === "#2E7D32")
                      return "h-3.5 w-3.5 mr-1.5 text-green-600 dark:text-green-400";
                    return "h-3.5 w-3.5 mr-1.5 text-red-600 dark:text-red-400";
                  };

                  return (
                    React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2624}}
                      , React.createElement('div', { className: "flex items-center justify-between gap-2 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2625}}
                        , React.createElement('h1', { className: "text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate sm:whitespace-normal"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2626}}
                          , titleText
                        )
                        , React.createElement('div', { className: "flex items-center gap-1.5 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2629}}
                          , React.createElement(Badge, {
                            className: cn(
                              getBadgeClasses(meta.color),
                              "flex items-center gap-1.5 pr-1",
                            ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2630}}

                            , React.createElement(TrendingUp, { className: getIconClasses(meta.color), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2636}} )
                            , React.createElement('span', { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2637}}, "Overall: "
                               , overallLabel, "%"
                            )
                            , React.createElement('button', {
                              type: "button",
                              className: cn(
                                "ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md",
                                "bg-white/60 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15",
                                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              ),
                              'aria-expanded': progressLegendOpen,
                              'aria-controls': "dashboard-progress-color-legend",
                              'aria-label': 
                                progressLegendOpen
                                  ? "Hide progress color guide"
                                  : "Show progress color guide"
                              ,
                              onClick: (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setProgressLegendOpen((open) => !open);
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2640}}

                              , React.createElement(Info, {
                                className: "h-3.5 w-3.5" ,
                                style: { color: meta.color },
                                'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2660}}
                              )
                            )
                          )
                          /* Mobile: icon-only export button in the same header row */
                          , ((selectedItemName && singleItemData) || aggregatedData) &&
                            viewType && (
                              React.createElement(Button, {
                                type: "button",
                                variant: "outline",
                                size: "icon",
                                className: "sm:hidden h-8 w-8 rounded-lg border-emerald-600/60 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 shadow-sm"         ,
                                'aria-label': "Export PPTX" ,
                                onClick: async () => {
                                  try {
                                    const dataToExport =
                                      selectedItemName && singleItemData
                                        ? singleItemData
                                        : aggregatedData;
                                    const exportName =
                                      selectedItemName &&
                                      selectedItemType === "division"
                                        ? `${selectedItemName} Division`
                                        : selectedItemName &&
                                            selectedItemType === "district"
                                          ? `${selectedItemName} District`
                                          : selectedItemName &&
                                              selectedItemType === "tehsil"
                                            ? `${selectedItemName} Tehsil`
                                            : viewType === "divisions"
                                              ? "All Punjab Divisions"
                                              : viewType === "districts"
                                                ? "All Punjab Districts"
                                                : "All Punjab Tehsils";

                                    if (!dataToExport) {
                                      setShowErrorDialog(true);
                                      return;
                                    }

                                    await exportDashboardToPPTX({
                                      cityName: exportName,
                                      cityData: dataToExport ,
                                      installationPhases:
                                        installationPhases.map((phase) => ({
                                          key: phase.key,
                                          title: phase.title,
                                          percentage: getProgressValue(
                                            dataToExport[phase.key],
                                          ),
                                        })),
                                    });
                                    setShowSuccessDialog(true);
                                  } catch (error) {
                                    console.error(
                                      "Error exporting to PPTX:",
                                      error,
                                    );
                                    setShowErrorDialog(true);
                                  }
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2670}}

                                , React.createElement(FileDown, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2725}} )
                              )
                            )
                        )
                      )
                      , React.createElement(AnimatePresence, { initial: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2730}}
                        , progressLegendOpen ? (
                          React.createElement(motion.div, {
                            id: "dashboard-progress-color-legend",
                            key: "legend",
                            initial: { opacity: 0, height: 0 },
                            animate: { opacity: 1, height: "auto" },
                            exit: { opacity: 0, height: 0 },
                            transition: { duration: 0.2 },
                            className: "overflow-hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2732}}

                            , React.createElement('div', { className: "flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-2 text-xs text-muted-foreground"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2741}}
                              , [
                                { label: "0–25% Low", color: "#ef4444" },
                                { label: "25–50% Moderate", color: "#f59e0b" },
                                { label: "50–75% Good", color: "#2F8F6C" },
                                { label: "75–100% High", color: "#8BC34A" },
                              ].map((it) => (
                                React.createElement('div', {
                                  key: it.label,
                                  className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2748}}

                                  , React.createElement('span', {
                                    className: "inline-block h-2.5 w-2.5 shrink-0 rounded-full"    ,
                                    style: { backgroundColor: it.color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2752}}
                                  )
                                  , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2756}}, it.label)
                                )
                              ))
                            )
                          )
                        ) : null
                      )
                    )
                  );
                })();
              })()
            )

            , React.createElement('div', { className: "flex items-center gap-2 sm:gap-3 flex-shrink-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2769}}
              , ((selectedItemName && singleItemData) || aggregatedData) &&
                viewType && (
                  React.createElement(Button, {
                    className: "hidden sm:inline-flex rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm font-semibold"         ,
                    onClick: async () => {
                      try {
                        const dataToExport =
                          selectedItemName && singleItemData
                            ? singleItemData
                            : aggregatedData;
                        const exportName =
                          selectedItemName && selectedItemType === "division"
                            ? `${selectedItemName} Division`
                            : selectedItemName &&
                                selectedItemType === "district"
                              ? `${selectedItemName} District`
                              : selectedItemName &&
                                  selectedItemType === "tehsil"
                                ? `${selectedItemName} Tehsil`
                                : viewType === "divisions"
                                  ? "All Punjab Divisions"
                                  : viewType === "districts"
                                    ? "All Punjab Districts"
                                    : "All Punjab Tehsils";

                        if (!dataToExport) {
                          setShowErrorDialog(true);
                          return;
                        }

                        // Pass the full data structure including PhaseProgress objects with timeline
                        await exportDashboardToPPTX({
                          cityName: exportName,
                          cityData: dataToExport , // Type assertion needed due to PhaseProgress union type
                          installationPhases: installationPhases.map(
                            (phase) => ({
                              key: phase.key,
                              title: phase.title,
                              percentage: getProgressValue(
                                dataToExport[phase.key],
                              ),
                            }),
                          ),
                        });
                        setShowSuccessDialog(true);
                      } catch (error) {
                        console.error("Error exporting to PPTX:", error);
                        setShowErrorDialog(true);
                      }
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2772}}

                    , React.createElement(FileDown, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2821}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2822}}, "Export Operation pptx"  )
                  )
                )
            )
          )
        )

        /* Division Selected - Show Districts */
        , selectedItemName &&
          selectedItemType === "division" &&
          (isLoading ? (
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2833}}
              , React.createElement('div', { className: "flex items-center gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2834}}
                , React.createElement(Skeleton, { className: "h-10 w-32" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2835}} )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2836}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2837}} )
                  , React.createElement(Skeleton, { className: "h-4 w-64" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2838}} )
                )
              )
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2841}}
                , Array.from({ length: 4 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2843}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2844}} )
                    , React.createElement(Skeleton, { className: "h-10 w-20 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2845}} )
                    , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2846}} )
                  )
                ))
              )
              , renderSkeletonLoader()
            )
          ) : singleItemData ? (
            (() => {
              // API-driven: filter districts belonging to this division
              const divisionDistrictsData = districtsData.filter(
                (d) => d.divisionId === selectedItemId,
              );

              return (
                React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2860}}
                  , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2861}}
                    , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2862}}
                      , React.createElement('h2', { className: "text-lg sm:text-2xl font-bold font-heading break-words"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2863}}, "Districts in "
                          , selectedItemName, " Division"
                      )
                      , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2866}}
                        , selectedItemName, " Division"
                      )
                    )

                    /* Breadcrumb removed (keep header navigation only) */
                  )

                  /* District Cards */
                  , divisionDistrictsData.length > 0 ? (
                    React.createElement(React.Fragment, null
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2877}}
                        , divisionDistrictsData.map((dist) => (
                          React.createElement(HierarchyCard, {
                            key: dist.id,
                            title: dist.name,
                            overallProgress: dist.overall,
                            color: dist.color,
                            onClick: () => {
                              setParentDivisionId(selectedItemId);
                              setParentDivisionName(selectedItemName);
                              setSelectedItemId(dist.id);
                              setSelectedItemName(dist.name);
                              setSelectedItemType("district");
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2879}}
                          )
                        ))
                      )

                      /* Charts for Division */
                      , renderAggregatedCharts(
                        selectedItemName + " Division",
                        singleItemData,
                        projectsInSelectedGeography,
                        false,
                      )
                    )
                  ) : (
                    React.createElement(Card, { className: "border-border/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2904}}
                      , React.createElement(CardContent, { className: "p-8 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2905}}
                        , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2906}}, "No districts found for "
                              , selectedItemName, " Division."
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
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2921}}
              , React.createElement('div', { className: "flex items-center gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2922}}
                , React.createElement(Skeleton, { className: "h-10 w-32" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2923}} )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2924}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2925}} )
                  , React.createElement(Skeleton, { className: "h-4 w-64" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2926}} )
                )
              )
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2929}}
                , Array.from({ length: 4 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2931}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2932}} )
                    , React.createElement(Skeleton, { className: "h-10 w-20 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2933}} )
                    , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2934}} )
                  )
                ))
              )
              , renderSkeletonLoader()
            )
          ) : singleItemData ? (
            (() => {
              // API-driven: get tehsils for this district by selectedItemId
              const districtTehsilsData = apiTehsils
                .filter((t) => t.district === selectedItemId)
                .map((teh, index) => {
                  const projects = apiProjects.filter(
                    (p) => p.tehsil === teh.id,
                  );
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
                React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2960}}
                  , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2961}}
                    , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2962}}
                      , React.createElement('h2', { className: "text-lg sm:text-2xl font-bold font-heading break-words"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2963}}, "Tehsils in "
                          , selectedItemName, " District ("  , parentDivisionName, " ", "Division)"

                      )
                      , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2967}}
                        , selectedItemName, " District"
                      )
                    )

                    /* Breadcrumb removed (keep header navigation only) */
                  )

                  /* Tehsil Cards */
                  , districtTehsilsData.length > 0 ? (
                    React.createElement(React.Fragment, null
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2978}}
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
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2980}}
                          )
                        ))
                      )

                      /* Charts for District */
                      , renderAggregatedCharts(
                        selectedItemName + " District",
                        singleItemData,
                        projectsInSelectedGeography,
                        false,
                      )
                    )
                  ) : (
                    React.createElement(Card, { className: "border-border/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3005}}
                      , React.createElement(CardContent, { className: "p-8 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3006}}
                        , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3007}}, "No tehsils found for "
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
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3022}}
              , React.createElement('div', { className: "flex items-center gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3023}}
                , React.createElement(Skeleton, { className: "h-10 w-32" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3024}} )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3025}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3026}} )
                  , React.createElement(Skeleton, { className: "h-4 w-64" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3027}} )
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
                React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3042}}
                  , React.createElement('div', { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3043}}
                    , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3044}}
                      /* Title removed per request (avoid duplicate tehsil text). */
                    )

                    /* Breadcrumb removed (keep header navigation only) */
                  )

                  /* Project Cards from API */
                  , React.createElement('div', { className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3052}}
                    , React.createElement('div', { className: "mb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3053}}

                    )

                    /* dropdown to pick project for KPI/Gantt */
                    , tehsilProjects.length > 0 && (
                      React.createElement('div', { className: "mb-4 w-full max-w-md sm:w-64 sm:max-w-none"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3059}}
                        , React.createElement(Select, {
                          value: selectedProjectForDetails ? String(selectedProjectForDetails.id) : "",
                          onValueChange: (val) => {
                            const p = tehsilProjects.find((x) => String(x.id) === val) || null;
                            setSelectedProjectForDetails(p);
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3060}}

                          , React.createElement(SelectTrigger, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3067}}
                            , React.createElement(SelectValue, { placeholder: "Choose project" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3068}} )
                          )
                          , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3070}}
                            , tehsilProjects.map((project) => (
                              React.createElement(SelectItem, { key: project.id, value: String(project.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3072}}
                                , project.project_name || `Project ${project.id}`
                              )
                            ))
                          )
                        )
                      )
                    )

                    , tehsilProjects.length > 0 ? (
                      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3082}}
                        , tehsilProjects.map((project, index) => {
                          const progress = Math.round(
                            _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => ( 0)),
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
                              color: CARD_COLORS[index % CARD_COLORS.length], __self: this, __source: {fileName: _jsxFileName, lineNumber: 3088}}
                            )
                          );
                        })
                      )
                    ) : (
                      React.createElement(Card, { className: "border-border/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3106}}
                        , React.createElement(CardContent, { className: "p-8 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3107}}
                          , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3108}}, "No projects found for "
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
                        flatGanttTasks: selectedProjectGanttTasks ,
                        ganttProjectId: selectedProjectForDetails.id,
                        onProjectGanttRefresh: refetchSelectedProjectGantt,
                        onClear: () => setSelectedProjectForDetails(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3117}}
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
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3137}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3138}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3139}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3140}} )
                  , React.createElement(Skeleton, { className: "h-4 w-80" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3141}} )
                )
              )
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3144}}
                , Array.from({ length: 4 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3146}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3147}} )
                    , React.createElement(Skeleton, { className: "h-10 w-20 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3148}} )
                    , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3149}} )
                  )
                ))
              )
              , renderSkeletonLoader()
            )
          ) : aggregatedData ? (
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3156}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3157}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3158}}
                  , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3159}}, "All Punjab Divisions"

                  )
                )

                /* Show More/Less Button */
                , divisionsData.length > 4 && (
                  React.createElement(Button, {
                    variant: "default",
                    onClick: () => setExpandedDivisions(!expandedDivisions),
                    className: "rounded-xl h-9 whitespace-nowrap bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3166}}

                    , expandedDivisions ? (
                      React.createElement(React.Fragment, null
                        , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3173}} ), "Show Less ("
                          , divisionsData.length - 4, " hidden)"
                      )
                    ) : (
                      React.createElement(React.Fragment, null
                        , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3178}} ), "Show More ("
                          , divisionsData.length - 4, " more)"
                      )
                    )
                  )
                )
              )

              /* Division Cards */
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3187}}
                , (expandedDivisions
                  ? divisionsData
                  : divisionsData.slice(0, 4)
                ).map((div) => (
                  React.createElement(HierarchyCard, {
                    key: div.id,
                    title: div.name,
                    overallProgress: div.overall,
                    color: div.color,
                    onClick: () => {
                      setSelectedItemId(div.id);
                      setSelectedItemName(div.name);
                      setSelectedItemType("division");
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3192}}
                  )
                ))
              )

              /* Aggregated Charts Section - Same as detail view */
              , renderAggregatedCharts(
                "All Punjab Divisions",
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
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3221}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3222}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3223}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3224}} )
                  , React.createElement(Skeleton, { className: "h-4 w-80" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3225}} )
                )
              )
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3228}}
                , Array.from({ length: 4 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3230}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3231}} )
                    , React.createElement(Skeleton, { className: "h-10 w-20 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3232}} )
                    , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3233}} )
                  )
                ))
              )
              , renderSkeletonLoader()
            )
          ) : aggregatedData ? (
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3240}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3241}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3242}}
                  , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3243}}, "All Punjab Districts"

                  )
                )

                /* Show More/Less Button */
                , districtsData.length > 4 && (
                  React.createElement(Button, {
                    variant: "default",
                    onClick: () => setExpandedDistricts(!expandedDistricts),
                    className: "rounded-xl h-9 whitespace-nowrap bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3250}}

                    , expandedDistricts ? (
                      React.createElement(React.Fragment, null
                        , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3257}} ), "Show Less ("
                          , districtsData.length - 4, " hidden)"
                      )
                    ) : (
                      React.createElement(React.Fragment, null
                        , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3262}} ), "Show More ("
                          , districtsData.length - 4, " more)"
                      )
                    )
                  )
                )
              )

              /* District Cards */
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3271}}
                , (expandedDistricts
                  ? districtsData
                  : districtsData.slice(0, 4)
                ).map((dist) => (
                  React.createElement(HierarchyCard, {
                    key: dist.id,
                    title: dist.name,
                    overallProgress: dist.overall,
                    color: dist.color,
                    onClick: () => {
                      const parentDiv = divisionsData.find(
                        (d) => d.id === dist.divisionId,
                      );
                      setParentDivisionId(dist.divisionId);
                      setParentDivisionName(_nullishCoalesce(_optionalChain([parentDiv, 'optionalAccess', _46 => _46.name]), () => ( null)));
                      setSelectedItemId(dist.id);
                      setSelectedItemName(dist.name);
                      setSelectedItemType("district");
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3276}}
                  )
                ))
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
          ) : null)

        , !selectedItemName &&
          viewType === "tehsils" &&
          (isLoading ? (
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3310}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3311}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3312}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3313}} )
                  , React.createElement(Skeleton, { className: "h-4 w-80" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3314}} )
                )
              )
              , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3317}}
                , Array.from({ length: 2 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3319}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3320}} )
                    , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3321}}
                      , Array.from({ length: 4 }).map((_, j) => (
                        React.createElement(Card, { key: j, className: "p-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3323}}
                          , React.createElement(Skeleton, { className: "h-5 w-24 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3324}} )
                          , React.createElement(Skeleton, { className: "h-8 w-16 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3325}} )
                          , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3326}} )
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
              // Default districts to show: Lahore and Sheikhupura
              const DEFAULT_DISTRICTS = ["Lahore", "Sheikhupura"];

              // Filter districts based on search query first
              const allDistricts = Object.entries(tehsilsDataByDistrict).filter(
                ([districtName]) => {
                  if (!tehsilSearchQuery.trim()) return true;
                  return districtName
                    .toLowerCase()
                    .includes(tehsilSearchQuery.toLowerCase());
                },
              );

              // Filter districts to show: by default only Lahore and Sheikhupura, unless all are expanded
              const filteredDistricts = allDistricts.filter(
                ([districtName]) => {
                  // If search query exists, show all matching districts
                  if (tehsilSearchQuery.trim()) return true;
                  // If all expanded, show all districts
                  if (allTehsilGroupsExpanded) return true;
                  // Otherwise, show only default districts
                  return DEFAULT_DISTRICTS.includes(districtName);
                },
              );

              // Toggle all groups expand/collapse
              const handleToggleAllGroups = () => {
                const newState = !allTehsilGroupsExpanded;
                setAllTehsilGroupsExpanded(newState);

                if (newState) {
                  // Expand All: show all districts and expand them
                  const allExpandedGroups = {};
                  allDistricts.forEach(([districtName]) => {
                    allExpandedGroups[districtName] = true;
                  });
                  setExpandedTehsilGroups(allExpandedGroups);
                } else {
                  // Collapse All: collapse to only show default districts
                  const defaultState = {};
                  DEFAULT_DISTRICTS.forEach((districtName) => {
                    if (tehsilsDataByDistrict[districtName]) {
                      defaultState[districtName] = true;
                    }
                  });
                  setExpandedTehsilGroups(defaultState);
                }
              };

              return (
                React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3387}}
                  , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3388}}
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3389}}
                      , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3390}}, "All Punjab Tehsils"

                      )
                      , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3393}}, "Tehsils grouped by district, sorted by progress"

                      )
                    )

                    /* Search and Expand/Collapse Controls */
                    , React.createElement('div', { className: "flex flex-col sm:flex-row gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3399}}
                      /* Search Input */
                      , React.createElement('div', { className: "relative flex-1 sm:min-w-[250px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3401}}
                        , React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3402}} )
                        , React.createElement(Input, {
                          type: "text",
                          placeholder: "Search by district name..."   ,
                          value: tehsilSearchQuery,
                          onChange: (e) => setTehsilSearchQuery(e.target.value),
                          className: "pl-9 h-9 rounded-xl border-border/50 bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3403}}
                        )
                      )

                      /* Expand/Collapse All Button */
                      , filteredDistricts.length > 0 && (
                        React.createElement(Button, {
                          variant: "default",
                          onClick: handleToggleAllGroups,
                          className: "rounded-xl h-9 whitespace-nowrap bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3414}}

                          , allTehsilGroupsExpanded ? (
                            React.createElement(React.Fragment, null
                              , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3421}} ), "Collapse All"

                            )
                          ) : (
                            React.createElement(React.Fragment, null
                              , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3426}} ), "Expand All"

                            )
                          )
                        )
                      )
                    )
                  )

                  /* Tehsil Cards Grouped by District */
                  , filteredDistricts.length === 0 ? (
                    React.createElement(Card, { className: "border-border/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3437}}
                      , React.createElement(CardContent, { className: "p-8 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3438}}
                        , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3439}}, "No districts found matching \""
                              , tehsilSearchQuery, "\". Please try a different search term."

                        )
                      )
                    )
                  ) : (
                    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3446}}
                      , filteredDistricts.map(
                        ([districtName, tehsils]









) => {
                          const isExpanded =
                            _nullishCoalesce(expandedTehsilGroups[districtName], () => ( false));
                          const visibleTehsils = isExpanded
                            ? tehsils
                            : tehsils.slice(0, 4);
                          const hasMore = tehsils.length > 4;

                          return (
                            React.createElement('div', { key: districtName, className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3467}}
                              /* District Header */
                              , React.createElement('div', { className: "flex items-center justify-between pb-2 border-b border-border/50"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3469}}
                                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3470}}
                                  , React.createElement('h3', { className: "text-lg font-bold font-heading"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3471}}
                                    , districtName, " District"
                                  )
                                  , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3474}}
                                    , tehsils.length, " tehsil"
                                    , tehsils.length !== 1 ? "s" : "", " • Max Progress:"
                                    , " "
                                    , Math.max(...tehsils.map((t) => t.overall)), "%"

                                  )
                                )
                              )

                              /* Tehsil Cards for this District */
                              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3485}}
                                , visibleTehsils.map((teh) => (
                                  React.createElement(HierarchyCard, {
                                    key: teh.id,
                                    title: teh.name,
                                    overallProgress: teh.overall,
                                    color: teh.color,
                                    onClick: () => {
                                      const parentDist = districtsData.find(
                                        (d) => d.id === teh.districtId,
                                      );
                                      const parentDiv = divisionsData.find(
                                        (d) => d.id === _optionalChain([parentDist, 'optionalAccess', _47 => _47.divisionId]),
                                      );
                                      setParentDistrictId(teh.districtId);
                                      setParentDistrictName(districtName);
                                      setParentDivisionId(
                                        _nullishCoalesce(_optionalChain([parentDist, 'optionalAccess', _48 => _48.divisionId]), () => ( null)),
                                      );
                                      setParentDivisionName(
                                        _nullishCoalesce(_optionalChain([parentDiv, 'optionalAccess', _49 => _49.name]), () => ( null)),
                                      );
                                      setSelectedItemId(teh.id);
                                      setSelectedItemName(teh.name);
                                      setSelectedItemType("tehsil");
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3487}}
                                  )
                                ))
                              )

                              /* Expand/Collapse Button for this District */
                              , hasMore && (
                                React.createElement('div', { className: "flex justify-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3517}}
                                  , React.createElement(Button, {
                                    variant: "default",
                                    onClick: () => {
                                      setExpandedTehsilGroups((prev) => {
                                        const newState = !isExpanded;
                                        // Update allTehsilGroupsExpanded based on whether all groups are expanded
                                        const updated = {
                                          ...prev,
                                          [districtName]: newState,
                                        };
                                        const allExpanded =
                                          filteredDistricts.every(
                                            ([name]) => _nullishCoalesce(updated[name], () => ( false)),
                                          );
                                        setAllTehsilGroupsExpanded(allExpanded);
                                        return updated;
                                      });
                                    },
                                    className: "rounded-xl bg-primary text-primary-foreground border border-primary hover:bg-primary/90 cursor-pointer"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3518}}

                                    , isExpanded ? (
                                      React.createElement(React.Fragment, null
                                        , React.createElement(ChevronUp, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3540}} ), "Show Less ("
                                          , tehsils.length - 4, " hidden)"
                                      )
                                    ) : (
                                      React.createElement(React.Fragment, null
                                        , React.createElement(ChevronDown, { className: "h-4 w-4 mr-2 text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3545}} ), "Show More ("
                                          , tehsils.length - 4, " more)"
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          );
                        },
                      )
                    )
                  )

                  /* Aggregated Charts Section */
                  , renderAggregatedCharts(
                    "All Punjab Tehsils",
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
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3576}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3577}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3578}}
                  , React.createElement(Skeleton, { className: "h-7 w-48 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3579}} )
                  , React.createElement(Skeleton, { className: "h-4 w-80" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3580}} )
                )
              )
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3583}}
                , Array.from({ length: 4 }).map((_, i) => (
                  React.createElement(Card, { key: i, className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3585}}
                    , React.createElement(Skeleton, { className: "h-6 w-32 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3586}} )
                    , React.createElement(Skeleton, { className: "h-10 w-20 mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3587}} )
                    , React.createElement(Skeleton, { className: "h-2 w-full rounded-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3588}} )
                  )
                ))
              )
              , renderSkeletonLoader()
            )
          ) : (
            React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3595}}
              , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3596}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3597}}
                  , React.createElement('h2', { className: "text-xl font-bold font-heading mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3598}}, "All Projects"

                  )
                  , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3601}}, "Select a project to view its Gantt chart and details"

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
                    React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3614}}
                      , React.createElement('span', { className: "text-xs text-muted-foreground hidden sm:inline"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3615}}, "Page "
                         , projectsPage, " / "  , totalPages
                      )
                      , React.createElement(Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        disabled: !canPrev,
                        onClick: () =>
                          setProjectsPage((p) => Math.max(1, p - 1))
                        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3618}}
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
                        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3629}}
, "Next"

                      )
                    )
                  );
                })()
              )

              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3647}}
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
                    _nullishCoalesce(ganttProgressByProjectId.get(project.id), () => ( 0)),
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
                      color: CARD_COLORS[(start + index) % CARD_COLORS.length], __self: this, __source: {fileName: _jsxFileName, lineNumber: 3668}}
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
                  flatGanttTasks: selectedProjectGanttTasks ,
                  ganttProjectId: selectedProjectForDetails.id,
                  onProjectGanttRefresh: refetchSelectedProjectGantt,
                  onClear: () => setSelectedProjectForDetails(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3685}}
                )
              )
            )
          ))
      )

      /* Success Dialog */
      , React.createElement(Dialog, { open: showSuccessDialog, onOpenChange: setShowSuccessDialog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3700}}
        , React.createElement(DialogContent, { className: "sm:max-w-md", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3701}}
          , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3702}}
            , React.createElement('div', { className: "flex flex-col items-center gap-4 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3703}}
              , React.createElement('img', {
                src: "/Assets/PHPD.png",
                alt: "PHPD Logo" ,
                className: "h-16 w-16 object-contain"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3704}}
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3709}}
                , React.createElement(CheckCircle2, { className: "h-6 w-6 text-emerald-500"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3710}} )
                , React.createElement(DialogTitle, { className: "text-xl font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3711}}, "Export Successful!"

                )
              )
            )
            , React.createElement(DialogDescription, { className: "text-center pt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3716}}, "PowerPoint presentation exported successfully!"

              , React.createElement('br', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3718}} )
              , React.createElement('br', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3719}} ), "The PPTX file includes all KPIs with proper icons and all charts based on your current filter selection."


            )
          )
          , React.createElement(DialogFooter, { className: "sm:justify-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3724}}
            , React.createElement(Button, {
              onClick: () => setShowSuccessDialog(false),
              className: "w-full sm:w-auto" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3725}}
, "OK"

            )
          )
        )
      )

      /* Error Dialog */
      , React.createElement(Dialog, { open: showErrorDialog, onOpenChange: setShowErrorDialog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3736}}
        , React.createElement(DialogContent, { className: "sm:max-w-md", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3737}}
          , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3738}}
            , React.createElement('div', { className: "flex flex-col items-center gap-4 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3739}}
              , React.createElement('img', {
                src: "/Assets/PHPD.png",
                alt: "PHPD Logo" ,
                className: "h-16 w-16 object-contain"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3740}}
              )
              , React.createElement(DialogTitle, { className: "text-xl font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3745}}, "Export Error"

              )
            )
            , React.createElement(DialogDescription, { className: "text-center pt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3749}}
              , !viewType
                ? "Please select a view type (All Divisions, All Districts, or All Tehsils) to export the presentation."
                : "Error exporting presentation. Please try again."
            )
          )
          , React.createElement(DialogFooter, { className: "sm:justify-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3755}}
            , React.createElement(Button, {
              onClick: () => setShowErrorDialog(false),
              className: "w-full sm:w-auto" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3756}}
, "OK"

            )
          )
        )
      )
    )
  );
}
