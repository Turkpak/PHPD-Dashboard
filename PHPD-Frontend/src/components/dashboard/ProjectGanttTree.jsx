const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreVertical,
  Plus,

  FileText,
  FolderKanban,
  ListChecks,
  CornerDownRight,

  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateTaskActual, createProgressImage, addDelayLog, listStakeholders } from "@/api";


























/**
 * Delay log API expects the backend ProjectActivity `id` (nested gantt `id`).
 * We store that as `db_id` on each row.
 */
function parseDelayLogActivityId(row) {
  const n = row.db_id;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseISODateParts(s) {
  if (!s) return null;
  // Expect "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]); // 1..12
  const d = Number(m[3]); // 1..31
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

function parseISOToLocalMidnight(s) {
  const p = parseISODateParts(s);
  if (!p) return null;
  // Local midnight (avoids timezone shifting that happens with new Date("YYYY-MM-DD"))
  return new Date(p.y, p.m - 1, p.d, 0, 0, 0, 0);
}

function buildMonthsArray(rangeStart, rangeEnd) {
  const months = [];
  const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export function ProjectGanttTree({
  tasks,
  projectName,
  projectId,
  onOpenAddDocument,
  onDelayLogSaved,
  onProgressSaved,
  readOnly = false,
}










) {
  const expandedStorageKey = useMemo(() => `safecity:ganttExpanded:${_nullishCoalesce(projectId, () => ( "unknown"))}`, [projectId]);
  const [expanded, setExpanded] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`safecity:ganttExpanded:${_nullishCoalesce(projectId, () => ( "unknown"))}`);
      const ids = raw ? (JSON.parse(raw) ) : null;
      if (Array.isArray(ids)) return new Set(ids.map(String));
    } catch (e2) {
      // ignore
    }
    return new Set();
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Restore expanded state when project changes (tab switching can remount the component).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(expandedStorageKey);
      const ids = raw ? (JSON.parse(raw) ) : null;
      if (Array.isArray(ids)) {
        setExpanded(new Set(ids.map(String)));
        return;
      }
    } catch (e3) {
      // ignore
    }
    setExpanded(new Set());
  }, [expandedStorageKey]);

  // Persist expanded state so switching tabs doesn't collapse WBS.
  useEffect(() => {
    try {
      sessionStorage.setItem(expandedStorageKey, JSON.stringify(Array.from(expanded)));
    } catch (e4) {
      // ignore
    }
  }, [expanded, expandedStorageKey]);

  const [progressOpen, setProgressOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDate, setProgressDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [progressImages, setProgressImages] = useState([]);
  const [progressCaption, setProgressCaption] = useState("");
  const [uploadingProgressImages, setUploadingProgressImages] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const [delayOpen, setDelayOpen] = useState(false);
  const [delayRow, setDelayRow] = useState(null);
  const [delayStartDate, setDelayStartDate] = useState("");
  const [delayEndDate, setDelayEndDate] = useState("");
  const [delayCategory, setDelayCategory] = useState("");
  const [delayOriginator, setDelayOriginator] = useState("");
  const [delayIssue, setDelayIssue] = useState("");
  const [delayRecommendedAction, setDelayRecommendedAction] = useState("");
  // Stakeholder id (as string for Select component)
  const [delayActionBy, setDelayActionBy] = useState("");
  const [savingDelay, setSavingDelay] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholdersLoaded, setStakeholdersLoaded] = useState(false);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(false);

  const loadStakeholders = async () => {
    if (stakeholdersLoading) return;
    try {
      setStakeholdersLoading(true);
      const list = await listStakeholders();
      setStakeholders(Array.isArray(list) ? list : []);
      setStakeholdersLoaded(true);
    } catch (err) {
      setStakeholders([]);
      setStakeholdersLoaded(false); // allow retry on next open
      toast({
        title: "Failed to load stakeholders",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setStakeholdersLoading(false);
    }
  };

  const delayDays = useMemo(() => {
    if (!delayStartDate || !delayEndDate) return 0;
    const s = new Date(delayStartDate);
    const e = new Date(delayEndDate);
    const ms = e.getTime() - s.getTime();
    if (!Number.isFinite(ms)) return 0;
    // inclusive day difference (min 0)
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [delayStartDate, delayEndDate]);

  const normalized = useMemo(() => {
    return (tasks || []).map((t) => ({
      ...t,
      id: String(t.id),
      parent: t.parent ? String(t.parent) : undefined,
      progress:
        typeof t.progress === "number" && Number.isFinite(t.progress)
          ? clamp(t.progress, 0, 100)
          : 0,
    }));
  }, [tasks]);

  const { byId, childrenByParent, roots } = useMemo(() => {
    const byId = new Map();
    const childrenByParent = new Map();
    for (const t of normalized) {
      byId.set(String(t.id), t);
      const pid = t.parent ? String(t.parent) : undefined;
      const list = _nullishCoalesce(childrenByParent.get(pid), () => ( []));
      list.push(t);
      childrenByParent.set(pid, list);
    }
    // IMPORTANT: preserve API/XER ordering exactly.
    // If an explicit `order` is provided, use it; otherwise keep insertion order.
    for (const [k, list] of Array.from(childrenByParent.entries())) {
      const hasOrder = list.some((x) => typeof x.order === "number" && Number.isFinite(x.order ));
      if (hasOrder) {
        list.sort((a, b) => (Number(_nullishCoalesce(a.order, () => ( 0))) - Number(_nullishCoalesce(b.order, () => ( 0)))));
      }
      childrenByParent.set(k, list);
    }
    const roots = _nullishCoalesce(childrenByParent.get(undefined), () => ( []));
    return { byId, childrenByParent, roots };
  }, [normalized]);

  const dateRange = useMemo(() => {
    const dates = [];
    for (const t of normalized) {
      const s = parseDate(t.start);
      const e = parseDate(t.end);
      if (s) dates.push(s);
      if (e) dates.push(e);
    }
    if (!dates.length) {
      const now = new Date();
      return { start: now, end: now };
    }
    return {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [normalized]);

  const totalDays = useMemo(() => {
    const ms = dateRange.end.getTime() - dateRange.start.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
  }, [dateRange]);

  const monthsArray = useMemo(() => buildMonthsArray(dateRange.start, dateRange.end), [dateRange]);

  // Month columns are fixed width (120px). Use pixel positioning to avoid drift.
  const MONTH_COL_PX = 120;
  const timelineWidthPx = useMemo(() => Math.max(1, monthsArray.length) * MONTH_COL_PX, [monthsArray.length]);
  const tableMinWidthPx = useMemo(() => {
    const wbsCol = 520; // wide enough to show full project names
    const durationCol = 112; // w-28
    const startCol = 144; // w-36
    const endCol = 144; // w-36
    const optionsCol = readOnly ? 0 : 80; // w-20
    return wbsCol + durationCol + startCol + endCol + timelineWidthPx + optionsCol;
  }, [timelineWidthPx, readOnly]);

  const monthScalePx = useMemo(() => {
    const startMonth = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), 1);
    const startKey = startMonth.getFullYear() * 12 + startMonth.getMonth(); // month index

    const daysInMonth = (y, m1) => new Date(y, m1, 0).getDate(); // m1: 1..12

    const posPx = (iso, edge) => {
      const p = parseISODateParts(iso);
      if (!p) return 0;
      const key = p.y * 12 + (p.m - 1);
      const idx = key - startKey; // 0..months-1
      const dim = daysInMonth(p.y, p.m);
      const frac = edge === "start" ? (p.d - 1) / dim : p.d / dim;
      const raw = (idx + frac) * MONTH_COL_PX;
      // clamp inside timeline
      return Math.max(0, Math.min(timelineWidthPx, raw));
    };

    return { posPx };
  }, [dateRange.start, timelineWidthPx]);

  const getTaskLeftPx = (start) => monthScalePx.posPx(start, "start");
  const getTaskRightPx = (end) => monthScalePx.posPx(end, "end");
  const getTaskWidthPx = (start, end) => {
    const l = getTaskLeftPx(start);
    const r = getTaskRightPx(end);
    // keep visible even for same-day tasks
    return Math.max(6, r - l);
  };

  
  const displayRows = useMemo(() => {
    const out = [];
    const visit = (node, depth) => {
      const kids = _nullishCoalesce(childrenByParent.get(node.id), () => ( []));
      const hasChildren = kids.length > 0;
      out.push({ ...(node ), depth, hasChildren });
      if (hasChildren && expanded.has(node.id)) {
        for (const k of kids) visit(k, depth + 1);
      }
    };
    for (const r of roots) visit(r, 0);
    return out;
  }, [roots, childrenByParent, expanded]);

  if (!normalized.length) {
    return React.createElement('div', { className: "py-6 text-center text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 336}}, "No schedule tasks found for this project."      );
  }

  const selectedActionByStakeholder = useMemo(() => {
    const idNum = Number(delayActionBy);
    if (!Number.isFinite(idNum)) return null;
    return _nullishCoalesce(stakeholders.find((s) => s.id === idNum), () => ( null));
  }, [delayActionBy, stakeholders]);

  const todayT = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  const scrollRef = useRef(null);

  return (
    React.createElement('div', {
      ref: scrollRef,
      className: "overflow-x-auto focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg"    ,
      tabIndex: 0,
      role: "region",
      'aria-label': "Gantt chart timeline (use left/right arrow keys to scroll)"        ,
      onKeyDown: (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const el = scrollRef.current;
        if (!el) return;
        e.preventDefault();
        const base = 120; // ~1 month column
        const step = (e.shiftKey ? base * 4 : base) * (e.key === "ArrowRight" ? 1 : -1);
        el.scrollBy({ left: step, behavior: "smooth" });
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 354}}

      , React.createElement('div', { style: { minWidth: Math.max(1200, tableMinWidthPx) }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 370}}
        /* Header */
        , React.createElement('div', { className: "flex border-b mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 372}}
          , React.createElement('div', { className: "w-[280px] sm:w-[520px] font-semibold text-sm bg-muted/40 border-r border-border/60 px-3 py-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 373}}, "WBS Subprocess"

          )
          , React.createElement('div', { className: "w-28 font-semibold text-sm bg-muted/40 border-r border-border/60 px-3 py-2 text-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 376}}, "Duration"

          )
          , React.createElement('div', { className: "w-36 font-semibold text-sm bg-muted/40 border-r border-border/60 px-3 py-2 text-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 379}}, "Start_Date"

          )
          , React.createElement('div', { className: "w-36 font-semibold text-sm bg-muted/40 border-r border-border/60 px-3 py-2 text-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 382}}, "End_Date"

          )
          , React.createElement('div', { className: "shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 385}}
            , React.createElement('div', { className: "grid grid-flow-col auto-cols-[120px] text-xs text-center"    , style: { width: timelineWidthPx }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}}
              , monthsArray.map((d, i) => (
                React.createElement('div', { key: i, className: "border-l py-2 font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 388}}
                  , d.toLocaleDateString("en-US", { month: "short" })
                  , React.createElement('div', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 390}}, d.getFullYear())
                )
              ))
            )
          )
          , !readOnly && (
            React.createElement('div', { className: "w-20 font-semibold text-sm bg-muted/40 border-l border-border/60 px-3 py-2 text-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 396}}, "Options"

            )
          )
        )

        /* Rows */
        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 403}}
          , displayRows.map((t) => {
            const leftPx = getTaskLeftPx(t.start);
            const widthPx = getTaskWidthPx(t.start, t.end);
            const actualWidthPx = widthPx * (clamp(_nullishCoalesce(t.progress, () => ( 0)), 0, 100) / 100);
            const depthFont =
              t.depth === 0
                ? "text-sm font-bold"
                : t.depth === 1
                  ? "text-xs font-semibold"
                  : "text-xs font-medium";

            const levelMeta =
              t.depth === 0
                ? {
                    Icon: FolderKanban,
                    iconWrap: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
                  }
                : t.depth === 1
                  ? {
                      Icon: ListChecks,
                      iconWrap: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    }
                  : {
                      Icon: CornerDownRight,
                      iconWrap: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    };

            return (
              React.createElement('div', { key: t.id, className: "flex items-stretch gap-0 rounded-lg border border-border/60 bg-card/50"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 432}}
                , React.createElement('div', {
                  className: "w-[280px] min-w-[280px] sm:w-[520px] sm:min-w-[520px] border-r border-border/60 px-3 py-2 flex items-start gap-2"          ,
                  style: { paddingLeft: `${12 + t.depth * 18}px` },
                  title: t.label, __self: this, __source: {fileName: _jsxFileName, lineNumber: 433}}

                  , React.createElement('div', {
                    className: `h-7 w-7 rounded-lg flex items-center justify-center border ${levelMeta.iconWrap}`,
                    title: t.depth === 0 ? "Project" : t.depth === 1 ? "Task" : "Subtask", __self: this, __source: {fileName: _jsxFileName, lineNumber: 438}}

                    , React.createElement(levelMeta.Icon, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 442}} )
                  )
                  , t.hasChildren ? (
                    React.createElement('button', {
                      type: "button",
                      onClick: () => {
                        setExpanded((prev) => {
                          const next = new Set(prev);
                          next.has(t.id) ? next.delete(t.id) : next.add(t.id);
                          return next;
                        });
                      },
                      className: "h-5 w-5 flex items-center justify-center rounded border border-border/60 bg-background hover:bg-muted/60"         ,
                      'aria-label': expanded.has(t.id) ? "Collapse" : "Expand", __self: this, __source: {fileName: _jsxFileName, lineNumber: 445}}

                      , expanded.has(t.id) ? "▾" : "▸"
                    )
                  ) : (
                    React.createElement('span', { className: "inline-block w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 460}} )
                  )
                  , React.createElement('div', { className: "min-w-0 flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 462}}
                    , React.createElement('div', { className: depthFont, __self: this, __source: {fileName: _jsxFileName, lineNumber: 463}}
                      , React.createElement('div', { className: "flex items-center gap-2 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 464}}
                        , React.createElement('span', { className: "whitespace-normal break-words leading-snug"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 465}}, t.label)
                        , t.has_delay ? (
                          React.createElement('span', {
                            className: "inline-flex items-center gap-0.5 shrink-0 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200"             ,
                            title: "A delay log exists for this activity"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 467}}

                            , React.createElement(AlertTriangle, { className: "h-3 w-3" , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 471}} ), "Delay"

                          )
                        ) : null
                      )
                    )
                    , React.createElement('div', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 477}}
                      , (() => {
                        const prog = typeof t.progress === "number" && Number.isFinite(t.progress) ? t.progress : 0;
                        const completed = prog >= 100 || !!t.actual_end;
                        const started = prog > 0 || !!t.actual_start;
                        const startT = _nullishCoalesce(_optionalChain([parseISOToLocalMidnight, 'call', _ => _(t.start), 'optionalAccess', _2 => _2.getTime, 'call', _3 => _3()]), () => ( null));
                        const endT = _nullishCoalesce(_optionalChain([parseISOToLocalMidnight, 'call', _4 => _4(t.end), 'optionalAccess', _5 => _5.getTime, 'call', _6 => _6()]), () => ( null));

                        let label = "Pending";
                        let cls = "text-muted-foreground font-semibold";

                        if (completed) {
                          label = "Completed";
                          cls = "text-emerald-600 font-semibold";
                        } else if (endT != null && endT < todayT) {
                          label = "Behind";
                          cls = "text-red-600 font-semibold";
                        } else if (started) {
                          label = "In Progress";
                          cls = "text-emerald-700 font-semibold";
                        } else if (startT != null && startT > todayT) {
                          label = "Pending";
                          cls = "text-amber-600 font-semibold";
                        }

                        return React.createElement('span', { className: cls, __self: this, __source: {fileName: _jsxFileName, lineNumber: 502}}, "• " , label);
                      })()
                    )
                  )
                )

                , React.createElement('div', {
                  className: "w-28 border-r border-border/60 px-3 py-2 flex items-center justify-center text-xs tabular-nums text-muted-foreground"          ,
                  title: _nullishCoalesce(t.duration_display, () => ( (typeof t.duration === "number" ? `${t.duration}` : "—"))), __self: this, __source: {fileName: _jsxFileName, lineNumber: 508}}

                  , _nullishCoalesce(t.duration_display, () => ( (typeof t.duration === "number" ? t.duration : "—")))
                )

                , React.createElement('div', {
                  className: "w-36 border-r border-border/60 px-3 py-2 flex items-center justify-center text-xs tabular-nums text-muted-foreground"          ,
                  title: _nullishCoalesce(t.start, () => ( "—")), __self: this, __source: {fileName: _jsxFileName, lineNumber: 515}}

                  , _nullishCoalesce(t.start, () => ( "—"))
                )

                , React.createElement('div', {
                  className: "w-36 border-r border-border/60 px-3 py-2 flex items-center justify-center text-xs tabular-nums text-muted-foreground"          ,
                  title: _nullishCoalesce(t.end, () => ( "—")), __self: this, __source: {fileName: _jsxFileName, lineNumber: 522}}

                  , _nullishCoalesce(t.end, () => ( "—"))
                )

                , React.createElement('div', { className: "shrink-0 bg-background/30" , style: { width: timelineWidthPx }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 529}}
                  , React.createElement('div', { className: "relative min-h-12 overflow-visible"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 530}}
                    /* Planned bar (top row) */
                    , React.createElement('div', {
                      className: "absolute h-4 rounded-md top-2 bg-emerald-600"    ,
                      style: { left: `${leftPx}px`, width: `${widthPx}px` },
                      title: `Planned: ${_nullishCoalesce(t.start, () => ( "—"))} → ${_nullishCoalesce(t.end, () => ( "—"))}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 532}}

                      , React.createElement('span', { className: "absolute left-2 top-0.5 text-[10px] font-semibold text-white/90 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 537}}, "Planned"

                      )
                    )
                    /* Actual/progress bar (bottom row) */
                    , React.createElement('div', {
                      className: "absolute h-4 top-7 bg-emerald-300 rounded-l-md rounded-r-md"     ,
                      style: { left: `${leftPx}px`, width: `${actualWidthPx}px` },
                      title: `Actual: ${Math.round(_nullishCoalesce(t.progress, () => ( 0)))}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 542}}

                      , React.createElement('span', { className: "absolute left-2 top-0.5 text-[10px] font-semibold text-slate-900/70 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 547}}, "A:"
                        , Math.round(clamp(_nullishCoalesce(t.progress, () => ( 0)), 0, 100)), "%"
                      )
                    )
                    /* Late progress overrun (red) when progress_date exceeds planned end */
                    , !t.hasChildren && t.progress_date && t.end ? (() => {
                      const plannedEndPx = getTaskRightPx(t.end);
                      const progressDatePx = getTaskRightPx(t.progress_date);
                      const rawOverrun = progressDatePx - plannedEndPx;
                      if (!Number.isFinite(rawOverrun) || rawOverrun <= 0) return null;
                      // Slight overlap removes any visible seam between blue and red.
                      const overlapPx = 1;
                      const left = Math.max(0, Math.min(timelineWidthPx, plannedEndPx - overlapPx));
                      const width = Math.max(0, Math.min(timelineWidthPx - left, rawOverrun + overlapPx));
                      if (width <= 0) return null;
                      return (
                        React.createElement('div', {
                          className: "absolute h-4 top-7 bg-red-500/90 rounded-r-md"    ,
                          style: { left: `${left}px`, width: `${width}px` },
                          title: `Late progress date: ${t.progress_date} (planned end: ${t.end})`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 563}}
                        )
                      );
                    })() : null
                  )
                )

                , !readOnly && (
                  React.createElement('div', { className: "w-20 border-l border-border/60 flex items-center justify-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 574}}
                    /* Show options only for leaf subtasks (not parent WBS rows). */
                    , !t.hasChildren && t.depth >= 2 ? (
                      React.createElement(DropdownMenu, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 577}}
                        , React.createElement(DropdownMenuTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 578}}
                          , React.createElement('button', {
                            type: "button",
                            className: "h-9 w-9 rounded-lg border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center"         ,
                            'aria-label': "Options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 579}}

                            , React.createElement(MoreVertical, { className: "h-4 w-4 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 584}} )
                          )
                        )
                        , React.createElement(DropdownMenuContent, { align: "end", __self: this, __source: {fileName: _jsxFileName, lineNumber: 587}}
                          , React.createElement(DropdownMenuItem, {
                            onSelect: (e) => {
                              e.preventDefault();
                              setDelayRow(t);
                              setDelayStartDate(_nullishCoalesce(t.start, () => ( "")));
                              setDelayEndDate(_nullishCoalesce(_nullishCoalesce(t.end, () => ( t.start)), () => ( "")));
                              setDelayCategory("");
                              const role = _nullishCoalesce(_nullishCoalesce(_optionalChain([user, 'optionalAccess', _7 => _7.role]), () => ( _optionalChain([user, 'optionalAccess', _8 => _8.stakeholder_type]))), () => ( ""));
                              setDelayOriginator(role ? String(role) : "—");
                              // Default "Action by" to the logged-in user's stakeholder id if available.
                              const sid = _optionalChain([(user ), 'optionalAccess', _9 => _9.stakeholder_id]);
                              setDelayActionBy(sid != null ? String(sid) : "");
                              setDelayIssue("");
                              setDelayRecommendedAction("");
                              setDelayOpen(true);
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 588}}

                            , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 605}} ), "Add Delay"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onSelect: (e) => {
                              e.preventDefault();
                              if (!onOpenAddDocument) {
                                toast({
                                  title: "Documents not available here",
                                  description:
                                    "Open the Photos & Docs tab to add documents for this project.",
                                });
                                return;
                              }
                              if (!t.db_id || !Number.isFinite(t.db_id)) {
                                toast({
                                  title: "Cannot attach document",
                                  description:
                                    "Missing activity id from API. Please refresh and try again.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              onOpenAddDocument(t.id, t.label, t.db_id);
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 608}}

                            , React.createElement(FileText, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 631}} ), "Add documents"

                          )
                          , React.createElement(DropdownMenuItem, {
                            onSelect: (e) => {
                              e.preventDefault();
                              setActiveRow(t);
                              setProgressValue(
                                typeof t.progress === "number" && Number.isFinite(t.progress)
                                  ? t.progress
                                  : 0,
                              );
                              setProgressDate(new Date().toISOString().slice(0, 10));
                              setProgressImages([]);
                              setProgressOpen(true);
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 634}}

                            , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 648}} ), "Add progress"

                          )
                        )
                      )
                    ) : (
                      React.createElement('span', { className: "inline-block h-9 w-9"  , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 654}} )
                    )
                  )
                )
              )
            );
          })
        )
      )

      , !readOnly && (
        React.createElement(Dialog, {
          open: delayOpen,
          onOpenChange: (open) => {
            setDelayOpen(open);
            if (open && !stakeholdersLoaded) {
              void loadStakeholders();
            }
            if (!open) {
              setDelayRow(null);
              setDelayStartDate("");
              setDelayEndDate("");
              setDelayCategory("");
              setDelayOriginator("");
              setDelayIssue("");
              setDelayRecommendedAction("");
              setDelayActionBy("");
              setSavingDelay(false);
            }
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 665}}

          , React.createElement(DialogContent, { className: "w-[95vw] max-w-2xl" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 685}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 686}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 687}}, "Add Delay" )
            )

          , React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 690}}
            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 691}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 692}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 693}}, "Project")
                , React.createElement(Input, { value: _nullishCoalesce(projectName, () => ( (projectId != null ? `Project #${projectId}` : "—"))), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 694}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 696}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 697}}, "Activity")
                , React.createElement(Input, { value: _nullishCoalesce(_optionalChain([delayRow, 'optionalAccess', _10 => _10.label]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}} )
              )
            )

            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 702}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 703}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 704}}, "Delay Start date"  )
                , React.createElement(Input, { type: "date", value: delayStartDate, onChange: (e) => setDelayStartDate(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 705}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 707}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 708}}, "Delay End date"  )
                , React.createElement(Input, { type: "date", value: delayEndDate, onChange: (e) => setDelayEndDate(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 709}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 711}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 712}}, "Delay (days)" )
                , React.createElement(Input, { value: String(delayDays), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 713}} )
              )
            )

            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, "Originator")
                , React.createElement(Input, { value: delayOriginator, readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 720}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 722}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 723}}, "Category")
                , React.createElement(Input, {
                  value: delayCategory,
                  onChange: (e) => setDelayCategory(e.target.value),
                  placeholder: "Type category…" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 724}}
                )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 730}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 731}}, "Action by" )
                , stakeholders.length > 0 ? (
                  React.createElement(Select, { value: delayActionBy, onValueChange: setDelayActionBy, __self: this, __source: {fileName: _jsxFileName, lineNumber: 733}}
                    , React.createElement(SelectTrigger, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 734}}
                      , React.createElement(SelectValue, { placeholder: stakeholdersLoading ? "Loading..." : "Select stakeholder", __self: this, __source: {fileName: _jsxFileName, lineNumber: 735}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 737}}
                      , stakeholders.map((s) => (
                        React.createElement(SelectItem, { key: s.id, value: String(s.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 739}}
                          , s.stakeholder_title, " (" , s.stakeholder_type, ")"
                        )
                      ))
                    )
                  )
                ) : (
                  React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 746}}
                    , React.createElement(Input, {
                      value: delayActionBy,
                      onChange: (e) => setDelayActionBy(e.target.value),
                      placeholder: stakeholdersLoading ? "Loading stakeholders..." : "Enter stakeholder id (e.g. 1)",
                      inputMode: "numeric", __self: this, __source: {fileName: _jsxFileName, lineNumber: 747}}
                    )
                    , !stakeholdersLoading && (
                      React.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => void loadStakeholders(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 754}}, "Retry load stakeholders"

                      )
                    )
                  )
                )
              )
            )

            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 763}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 764}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 765}}, "Stakeholder type" )
                , React.createElement(Input, { value: _nullishCoalesce(_optionalChain([selectedActionByStakeholder, 'optionalAccess', _11 => _11.stakeholder_type]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 766}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 768}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 769}}, "Stakeholder title" )
                , React.createElement(Input, { value: _nullishCoalesce(_optionalChain([selectedActionByStakeholder, 'optionalAccess', _12 => _12.stakeholder_title]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 770}} )
              )
            )

            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 774}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 775}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 776}}, "Issue")
                , React.createElement(Textarea, {
                  value: delayIssue,
                  onChange: (e) => setDelayIssue(e.target.value),
                  placeholder: "Describe the issue due to which the delay occurred..."        ,
                  className: "min-h-[110px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 777}}
                )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 784}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 785}}, "Recommended action" )
                , React.createElement(Textarea, {
                  value: delayRecommendedAction,
                  onChange: (e) => setDelayRecommendedAction(e.target.value),
                  placeholder: "Recommended action to address the delay..."     ,
                  className: "min-h-[110px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 786}}
                )
              )
            )
          )

          , React.createElement(DialogFooter, { className: "gap-2 sm:gap-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 796}}
            , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setDelayOpen(false), disabled: savingDelay, __self: this, __source: {fileName: _jsxFileName, lineNumber: 797}}, "Cancel"

            )
            , React.createElement(Button, {
              type: "button",
              disabled: 
                savingDelay ||
                !delayRow ||
                projectId == null ||
                parseDelayLogActivityId(delayRow) == null ||
                !delayStartDate ||
                !delayEndDate ||
                !delayOriginator ||
                !delayCategory ||
                !delayIssue.trim() ||
                !delayRecommendedAction.trim() ||
                !Number.isFinite(Number(delayActionBy))
              ,
              onClick: async () => {
                if (!delayRow) return;
                if (projectId == null) {
                  toast({
                    title: "Cannot save delay log",
                    description: "Missing project id. Please refresh and try again.",
                    variant: "destructive",
                  });
                  return;
                }
                const delayActivityId = parseDelayLogActivityId(delayRow);
                if (delayActivityId == null) {
                  toast({
                    title: "Cannot save delay log",
                    description: "Missing activity id from API. Please refresh and try again.",
                    variant: "destructive",
                  });
                  return;
                }
                const actionById = Number(delayActionBy);
                if (!Number.isFinite(actionById)) {
                  toast({
                    title: "Cannot save delay log",
                    description: "Please select Action by stakeholder.",
                    variant: "destructive",
                  });
                  return;
                }
                try {
                  setSavingDelay(true);
                  await addDelayLog({
                    project: projectId,
                    activity: delayActivityId,
                    delay_start_date: delayStartDate,
                    delay_end_date: delayEndDate,
                    category: delayCategory.trim(),
                    action_by: actionById,
                    issue: delayIssue.trim(),
                    recommended_action: delayRecommendedAction.trim(),
                  });
                  toast({
                    title: "Delay log saved",
                    description: `Delay ${delayDays} day(s) • ${delayCategory} • "${delayRow.label}".`,
                  });
                  setDelayOpen(false);
                  await _optionalChain([onDelayLogSaved, 'optionalCall', _13 => _13()]);
                } catch (err) {
                  toast({
                    title: "Failed to save delay log",
                    description: err instanceof Error ? err.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setSavingDelay(false);
                }
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 800}}

              , savingDelay ? "Saving..." : "Save delay log"
            )
          )
          )
        )
      )

      , !readOnly && (
        React.createElement(Dialog, {
          open: progressOpen,
          onOpenChange: (open) => {
            setProgressOpen(open);
            if (!open) {
              setActiveRow(null);
              setProgressImages([]);
              setProgressCaption("");
              setUploadingProgressImages(false);
              setSavingProgress(false);
            }
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 880}}

          , React.createElement(DialogContent, { className: "w-[95vw] max-w-xl" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 893}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 894}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 895}}, "Add Progress" )
            )

          , React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 898}}
            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 899}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 900}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 901}}, "Project")
                , React.createElement(Input, { value: _nullishCoalesce(projectName, () => ( (projectId != null ? `Project #${projectId}` : "—"))), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 902}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 904}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 905}}, "Activity")
                , React.createElement(Input, { value: _nullishCoalesce(_optionalChain([activeRow, 'optionalAccess', _14 => _14.label]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 906}} )
              )
            )

            , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 910}}
              , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 911}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 912}}, "Progress")
                , React.createElement('span', { className: "text-sm font-semibold tabular-nums"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 913}}, Math.round(progressValue), "%")
              )
              , React.createElement(Slider, {
                value: [progressValue],
                min: 0,
                max: 100,
                step: 1,
                onValueChange: (v) => setProgressValue(_nullishCoalesce(_optionalChain([v, 'optionalAccess', _15 => _15[0]]), () => ( 0))), __self: this, __source: {fileName: _jsxFileName, lineNumber: 915}}
              )
              , React.createElement('div', { className: "flex justify-between text-[11px] text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 922}}
                , [0, 20, 40, 60, 80, 100].map((m) => (
                  React.createElement('span', { key: m, __self: this, __source: {fileName: _jsxFileName, lineNumber: 924}}, m, "%")
                ))
              )
            )

            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 929}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 930}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 931}}, " Start date"  )
                , React.createElement(Input, { type: "date", value: _nullishCoalesce(_optionalChain([activeRow, 'optionalAccess', _16 => _16.start]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 932}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 934}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 935}}, " End date"  )
                , React.createElement(Input, { type: "date", value: _nullishCoalesce(_optionalChain([activeRow, 'optionalAccess', _17 => _17.end]), () => ( "")), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 936}} )
              )
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 938}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 939}}, "Progress date" )
                , React.createElement(Input, { type: "date", value: progressDate, onChange: (e) => setProgressDate(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 940}} )
              )
            )

            , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 944}}
              , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 945}}, "Picture (optional)" )
              , React.createElement('div', {
                className: `relative border-2 border-dashed rounded-lg p-5 flex items-center justify-between gap-4 transition-all ${
                  progressImages.length > 0
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 hover:border-primary/50 cursor-pointer"
                }`,
                onClick: () => _optionalChain([document, 'access', _18 => _18.getElementById, 'call', _19 => _19("gantt-progress-image-input"), 'optionalAccess', _20 => _20.click, 'call', _21 => _21()]),
                role: "button",
                tabIndex: 0,
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    _optionalChain([document, 'access', _22 => _22.getElementById, 'call', _23 => _23("gantt-progress-image-input"), 'optionalAccess', _24 => _24.click, 'call', _25 => _25()]);
                  }
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 946}}

                , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 962}}
                  , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 963}}
                    , progressImages.length > 0
                      ? `${progressImages.length} file(s) selected`
                      : "Click to upload progress picture(s)"
                  )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 968}}
                    , progressImages.length > 0
                      ? progressImages.map((f) => f.name).join(", ")
                      : "PNG, JPG, JPEG"
                  )
                  , uploadingProgressImages ? (
                    React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 974}}, "Uploading…")
                  ) : null
                )

                , progressImages.length > 0 ? (
                  React.createElement(Button, {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: (e) => {
                      e.stopPropagation();
                      setProgressImages([]);
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 979}}
, "Remove"

                  )
                ) : (
                  React.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: (e) => e.preventDefault(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 991}}, "Choose file"

                  )
                )

                , React.createElement(Input, {
                  id: "gantt-progress-image-input",
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  className: "hidden",
                  onChange: (e) => {
                    const files = Array.from(_nullishCoalesce(e.target.files, () => ( [])));
                    setProgressImages(files);
                    e.target.value = "";
                    if (!files.length) return;
                    if (!_optionalChain([activeRow, 'optionalAccess', _26 => _26.db_id]) || !Number.isFinite(activeRow.db_id)) {
                      toast({
                        title: "Cannot upload image",
                        description: "Missing activity id. Please refresh and try again.",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (projectId == null) {
                      toast({
                        title: "Cannot upload image",
                        description: "Missing project id. Please reopen this project and try again.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const imageDate = progressDate || new Date().toISOString().slice(0, 10);
                    const fallbackCaption = `Progress update • Activity: ${activeRow.label} • ${Math.round(progressValue)}%`;
                    const caption = (progressCaption || fallbackCaption).trim();

                    (async () => {
                      try {
                        setUploadingProgressImages(true);
                        for (const img of files) {
                          await createProgressImage({
                            project: projectId,
                            activity: activeRow.db_id,
                            image: img,
                            image_date: imageDate,
                            caption,
                          });
                        }
                        toast({
                          title: "Image uploaded",
                          description: files.length === 1 ? "Progress image uploaded successfully." : `${files.length} images uploaded successfully.`,
                        });
                      } catch (err) {
                        toast({
                          title: "Failed to upload image",
                          description: err instanceof Error ? err.message : "Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setUploadingProgressImages(false);
                      }
                    })();
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 996}}
                )
              )
              , React.createElement('div', { className: "mt-2 space-y-1.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1057}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1058}}, "Caption (optional)" )
                , React.createElement(Input, {
                  placeholder: "e.g., Site survey completed"   ,
                  value: progressCaption,
                  onChange: (e) => setProgressCaption(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1059}}
                )
              )
            )
          )

          , React.createElement(DialogFooter, { className: "gap-2 sm:gap-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1068}}
            , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setProgressOpen(false), disabled: savingProgress, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1069}}, "Cancel"

            )
            , React.createElement(Button, {
              type: "button",
              disabled: savingProgress || !activeRow,
              onClick: async () => {
                if (!activeRow) return;
                if (!activeRow.db_id || !Number.isFinite(activeRow.db_id)) {
                  toast({
                    title: "Cannot update this activity",
                    description: "Missing activity id from API. Please refresh and try again.",
                    variant: "destructive",
                  });
                  return;
                }
                try {
                  setSavingProgress(true);
                  await updateTaskActual(activeRow.db_id, {
                    progress: Math.max(0, Math.min(100, Number(progressValue))),

                    actual_start:
                      progressValue > 0 && !activeRow.actual_start
                        ? progressDate
                        : undefined,

                    actual_end:
                      progressValue === 100
                        ? (progressDate || new Date().toISOString().slice(0,10))
                        : undefined,

                    // ✅ ADD THIS
                    progress_date: progressDate,
                  });

                  toast({
                    title: "Progress saved",
                    description:
                      progressImages.length > 0 ? "Progress updated. (Images upload when you select them.)" : "Progress updated successfully.",
                  });
                  setProgressOpen(false);
                  await _optionalChain([onProgressSaved, 'optionalCall', _27 => _27()]);
                } catch (err) {
                  toast({
                    title: "Failed to save progress",
                    description: err instanceof Error ? err.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setSavingProgress(false);
                }
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1072}}

              , savingProgress ? "Saving..." : "Save progress"
            )
          )
          )
        )
      )
    )
  );
}
