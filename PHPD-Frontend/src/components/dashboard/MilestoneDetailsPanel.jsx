const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";


import { useWindowSize } from "@/hooks/use-window-size";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Trash2, Edit2, Calendar, AlertTriangle, Clock, Image as ImageIcon, MoreVertical, Upload, FileText, Download, Tag, User, Building2, CalendarRange } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectGanttTree } from "@/components/dashboard/ProjectGanttTree";
import { listDelayLogs, updateDelayLog } from "@/api/delayLog";
import { listProgressImages, updateProgressImage } from "@/api/progressImage";
import { createProjectDocument, listProjectDocuments, updateProjectDocument } from "@/api/projectDocument";
import { mediaUrl } from "@/api/config";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";














const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Simple deterministic hash -> 0..1
const hash01 = (input) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned -> 0..1
  return (h >>> 0) / 0xffffffff;
};

function buildDeterministicSubprojectTimeline(
  sub,
  parentTimeline
) {
  const n = parentTimeline.length;
  if (n === 0) return [];

  // stable factor per subproject, gives different curve "speed" but deterministic
  const factor = 0.75 + hash01(sub.id + "|factor") * 0.5; // 0.75..1.25
  const plannedFactor = 0.8 + hash01(sub.id + "|pf") * 0.4; // 0.8..1.2

  // Base series derived from parent points
  const base = parentTimeline.map((p) => ({
    month: p.month,
    actual: clamp(p.actual * factor, 0, 100),
    planned: clamp(p.planned * plannedFactor, 0, 100),
  }));

  // Ensure last point matches the provided subproject snapshot (so charts stay consistent)
  const last = base[n - 1];
  const aScale = last.actual > 0 ? sub.actualProgress / last.actual : 1;
  const pScale = last.planned > 0 ? sub.plannedProgress / last.planned : 1;

  return base.map((p, idx) => {
    // light easing toward scaled values, keeps earlier months reasonable
    const t = idx / Math.max(1, n - 1);
    const ease = t * t * (3 - 2 * t); // smoothstep
    return {
      month: p.month,
      actual: clamp(p.actual * (1 + (aScale - 1) * ease), 0, 100),
      planned: clamp(p.planned * (1 + (pScale - 1) * ease), 0, 100),
    };
  });
}









































function generateHardcodedDelayLogs() {
  return [];
}

const CHILD_NAME_TEMPLATES = {
  "Site Survey & Assessment": ["Field Survey", "Data Collection", "Site Measurements", "Survey Report"],
  "Technical Feasibility Study": ["Requirements Review", "Feasibility Analysis", "Risk Assessment", "Approval & Sign-off"],
  "Site Selection & Approval": ["Option Shortlisting", "Stakeholder Review", "Authority Approval", "Final Selection"],
  "Environmental Clearance": ["Documentation", "Submission", "Compliance Review", "Clearance Issuance"],

  "Excavation Work": ["Marking & Layout", "Excavation", "Disposal/Hauling", "Inspection"],
  "Foundation Pouring": ["Rebar Setup", "Formwork", "Concrete Pour", "Finishing"],
  "Curing & Quality Check": ["Curing", "Cube Tests", "QC Inspection", "Punch List"],
  "Backfilling & Compaction": ["Backfilling", "Layer Compaction", "Leveling", "Final Check"],

  "Cabinet Installation": ["Mounting", "Anchoring", "Alignment", "Handover"],
  "Electrical Connections": ["Cabling", "Terminations", "Earthing", "Testing"],
  "Network Setup": ["Fiber Pulling", "Splicing", "Switch Config", "Connectivity Test"],
  "Equipment Mounting": ["Bracket Install", "Device Mount", "Labeling", "Commissioning Prep"],

  "Cable Trenching": ["Route Marking", "Trenching", "Duct Placement", "Backfill"],
  "Fiber Optic Laying": ["Pulling", "Splicing", "OTDR Test", "Documentation"],
  "Power Cable Installation": ["Cable Pull", "Terminations", "Protection", "Load Test"],
  "Cable Termination & Testing": ["Termination", "Continuity Test", "Insulation Test", "Sign-off"],

  "Room Renovation": ["Civil Works", "Electrical Works", "Flooring/Ceiling", "Finishing"],
  "Server Installation": ["Rack Setup", "Server Mount", "Power & Network", "Burn-in Test"],
  "Display Systems": ["Mounting", "Cabling", "Calibration", "Acceptance Test"],
  "Control Systems Integration": ["Integration", "Configuration", "End-to-End Test", "Handover"],

  "System Integration": ["Interface Setup", "Data Mapping", "Integration Test", "UAT Support"],
  "Software Deployment": ["Environment Setup", "Deployment", "Smoke Tests", "Stabilization"],
  "Testing & Commissioning": ["Test Plans", "Commissioning", "Defect Fixes", "Final Verification"],
  "Go-Live Preparation": ["Training", "Runbook", "Cutover Plan", "Go-Live Readiness"],
};

function getChildNames(parentName, childCount) {
  const tpl = CHILD_NAME_TEMPLATES[parentName];
  if (tpl && tpl.length) return tpl.slice(0, childCount);
  // Fallback: derive readable labels from parent
  return Array.from({ length: childCount }).map((_, i) => `${parentName} — Task ${i + 1}`);
}

function buildChildTasks(parent, seed) {
  const span = parent.endIdx - parent.startIdx + 1;
  const childCount = clamp(Math.round(2 + hash01(seed + "|n") * 2), 2, 4); // 2..4
  const weightsRaw = Array.from({ length: childCount }).map((_, i) => 0.6 + hash01(seed + `|w|${i}`) * 0.8);
  const wSum = weightsRaw.reduce((a, b) => a + b, 0) || 1;
  const weights = weightsRaw.map(w => w / wSum);

  // Split parent's window into sequential child windows (with small deterministic overlaps)
  let cursor = parent.startIdx;
  const children = [];
  const childNames = getChildNames(parent.name, childCount);
  for (let i = 0; i < childCount; i++) {
    const remaining = parent.endIdx - cursor + 1;
    const minDur = 1;
    const maxDur = Math.max(minDur, remaining - (childCount - i - 1));
    const ideal = clamp(Math.round(span * weights[i]), minDur, maxDur);
    const overlap = i > 0 ? (hash01(seed + `|o|${i}`) > 0.75 ? 1 : 0) : 0;
    const startIdx = clamp(cursor - overlap, parent.startIdx, parent.endIdx);
    const endIdx = clamp(startIdx + ideal - 1, startIdx, parent.endIdx);

    children.push({
      id: `${parent.id}::${i}`,
      name: _nullishCoalesce(childNames[i], () => ( `${parent.name} — Task ${i + 1}`)),
      startIdx,
      endIdx,
      weight: parent.weight * weights[i],
      status: parent.status,
    });
    cursor = clamp(endIdx + 1, parent.startIdx, parent.endIdx);
  }
  return children;
}

function buildGanttTasks(subProjects, months) {
  const n = months.length;
  if (n === 0) return [];

  const monthIndexFromDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    // months[] entries are short month names ("Jan", "Feb", ...). Match by month number.
    const monthShort = MONTH_NAMES[d.getMonth()];
    const idx = months.findIndex((m) => m.startsWith(monthShort));
    return idx >= 0 ? idx : null;
  };

  return subProjects.map((s) => {
    const childMilestones = _nullishCoalesce(s.milestones, () => ( []));

    // Parent timeline: prefer real date range from milestones if present.
    let startIdx;
    let endIdx;
    if (childMilestones.length > 0) {
      const idxs = childMilestones
        .flatMap((m) => [monthIndexFromDate(m.startDate), monthIndexFromDate(m.finishDate)])
        .filter((v) => typeof v === "number");
      if (idxs.length > 0) {
        startIdx = clamp(Math.min(...idxs), 0, Math.max(0, n - 1));
        endIdx = clamp(Math.max(...idxs), startIdx, Math.max(0, n - 1));
      } else {
        // fallback deterministic
        const r1 = hash01(s.id + "|s");
        const r2 = hash01(s.id + "|d");
        const duration = clamp(Math.round(2 + r2 * 3), 1, Math.max(1, n)); // 2..5 (clamped)
        startIdx = clamp(Math.round(r1 * Math.max(0, n - duration)), 0, Math.max(0, n - 1));
        endIdx = clamp(startIdx + duration - 1, startIdx, Math.max(0, n - 1));
      }
    } else {
      const r1 = hash01(s.id + "|s");
      const r2 = hash01(s.id + "|d");
      const duration = clamp(Math.round(2 + r2 * 3), 1, Math.max(1, n)); // 2..5 (clamped)
      startIdx = clamp(Math.round(r1 * Math.max(0, n - duration)), 0, Math.max(0, n - 1));
      endIdx = clamp(startIdx + duration - 1, startIdx, Math.max(0, n - 1));
    }

    const variance = s.actualProgress - s.plannedProgress;
    const status =
      Math.abs(variance) < 1 ? "ontrack" : variance >= 0 ? "ahead" : "behind";

    const children =
      childMilestones.length > 0
        ? childMilestones.map((m, i) => {
            const cStart = _nullishCoalesce(monthIndexFromDate(m.startDate), () => ( startIdx));
            const cEnd = _nullishCoalesce(monthIndexFromDate(m.finishDate), () => ( cStart));
            const cs = clamp(cStart, 0, Math.max(0, n - 1));
            const ce = clamp(cEnd, cs, Math.max(0, n - 1));
            const rawProgress = (m ).progress;
            const rawPlanned = (m ).plannedProgress;
            const progressOverride =
              typeof rawProgress === "number" && Number.isFinite(rawProgress) ? clamp(rawProgress, 0, 100) : undefined;
            const plannedOverride =
              typeof rawPlanned === "number" && Number.isFinite(rawPlanned) ? clamp(rawPlanned, 0, 100) : undefined;

            // Weight evenly among children by default.
            const w = childMilestones.length > 0 ? s.weight / childMilestones.length : s.weight;
            const childVariance = (_nullishCoalesce(progressOverride, () => ( 0))) - (_nullishCoalesce(plannedOverride, () => ( 100)));
            const childStatus =
              Math.abs(childVariance) < 1 ? "ontrack" : childVariance >= 0 ? "ahead" : "behind";

            return {
              id: m.id || `${s.id}-m-${i}`,
              name: m.name,
              startIdx: cs,
              endIdx: ce,
              weight: w,
              status: childStatus,
              progressOverride,
              plannedOverride,
            };
          })
        : buildChildTasks(
            {
              id: s.id,
              name: s.name,
              startIdx,
              endIdx,
              weight: s.weight,
              status,
            },
            s.id,
          );

    return {
      id: s.id,
      name: s.name,
      startIdx,
      endIdx,
      weight: s.weight,
      status,
      children,
    };
  });
}

function statusColor(status, baseColor) {
  if (status === "ahead") return "#2E7D32";
  if (status === "behind") return "#ef4444";
  return baseColor;
}

// Hex to rgba for light bar background (single color family, no white tone)
function hexToRgba(hex, alpha) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Gantt chart year for date labels
const GANTT_CHART_YEAR = 2026;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthHeaderLabel(monthShort, year) {
  const idx = MONTH_NAMES.findIndex((m) => m.startsWith(monthShort.substring(0, 3)));
  const monthIndex = idx >= 0 ? idx : 0;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return {
    label: `${monthShort} ${year}`,
    dateRange: `1 - ${daysInMonth}`,
  };
}

// Planned timeline date range for a task (startIdx, endIdx = month indices). Returns YYYY-MM-DD for min/max.
function getPlannedDateRange(startIdx, endIdx, year) {
  const minD = new Date(year, startIdx, 1);
  const maxD = new Date(year, endIdx + 1, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    minDate: `${minD.getFullYear()}-${pad(minD.getMonth() + 1)}-${pad(minD.getDate())}`,
    maxDate: `${maxD.getFullYear()}-${pad(maxD.getMonth() + 1)}-${pad(maxD.getDate())}`,
  };
}

// Generate a deterministic "responsible person" name for a task
function getResponsiblePerson(taskId, taskName) {
  const seed = hash01(taskId + "|person");
  const names = ["Team A", "Team B", "Team C", "Project Lead", "Site Manager", "QC Team"];
  return names[Math.floor(seed * names.length)];
}

// Calculate progress percentage for display (actual)
// Note: subProject should already have adjusted progress from adjustedSubProjects
function getProgressPercentage(task, subProject) {
  if (typeof task.progressOverride === "number") {
    return Math.round(task.progressOverride);
  }
  // If we have sub-project data, use actual progress (already adjusted for delays)
  if (subProject) {
    return Math.round(subProject.actualProgress);
  }

  // Fallback: Use a deterministic progress based on task status and position
  const seed = hash01(task.id + "|progress");
  if (task.status === "ahead") return Math.round(60 + seed * 40); // 60-100%
  if (task.status === "behind") return Math.round(20 + seed * 40); // 20-60%
  return Math.round(40 + seed * 40); // 40-80%
}

// Planned progress for display (where we should be)
function getPlannedPercentage(task, subProject) {
  if (typeof task.plannedOverride === "number") {
    return Math.round(Math.min(100, Math.max(0, task.plannedOverride)));
  }
  if (subProject) {
    return Math.round(Math.min(100, Math.max(0, subProject.plannedProgress)));
  }
  const seed = hash01(task.id + "|planned");
  if (task.status === "ahead") return Math.round(50 + seed * 30);
  if (task.status === "behind") return Math.round(60 + seed * 35);
  return Math.round(45 + seed * 40);
}

// Delay Log Form Dialog Component (for adding/editing)
function DelayLogFormDialog({
  open,
  onOpenChange,
  taskName,
  taskId,
  monthIndex,
  monthName,
  months,
  onSave,
  existingLog,
  defaultDate,
  minDate,
  maxDate,
}












) {
  // Get default date: use existing log's delayDate, or defaultDate, clamped to [minDate, maxDate] when provided
  const getDefaultDate = () => {
    let d;
    if (_optionalChain([existingLog, 'optionalAccess', _2 => _2.delayDate])) d = existingLog.delayDate.split('T')[0];
    else if (defaultDate) d = defaultDate.split('T')[0];
    else if (minDate && maxDate) d = minDate;
    else d = new Date().toISOString().split('T')[0];
    if (d && minDate && d < minDate) return minDate;
    if (d && maxDate && d > maxDate) return maxDate;
    return d;
  };

  const [formData, setFormData] = useState({
    loggedBy: _optionalChain([existingLog, 'optionalAccess', _3 => _3.loggedBy]) || "",
    reason: _optionalChain([existingLog, 'optionalAccess', _4 => _4.reason]) || "",
    delayDuration: _optionalChain([existingLog, 'optionalAccess', _5 => _5.delayDuration, 'access', _6 => _6.toString, 'call', _7 => _7()]) || "1",
    delayDate: getDefaultDate(),
    imageFile: null,
    imagePreview: _optionalChain([existingLog, 'optionalAccess', _8 => _8.imageUrl]) || null,
  });

  // Reset form when dialog opens/closes or existingLog changes
  useEffect(() => {
    if (open) {
      setFormData({
        loggedBy: _optionalChain([existingLog, 'optionalAccess', _9 => _9.loggedBy]) || "",
        reason: _optionalChain([existingLog, 'optionalAccess', _10 => _10.reason]) || "",
        delayDuration: _optionalChain([existingLog, 'optionalAccess', _11 => _11.delayDuration, 'access', _12 => _12.toString, 'call', _13 => _13()]) || "1",
        delayDate: getDefaultDate(),
        imageFile: null,
        imagePreview: _optionalChain([existingLog, 'optionalAccess', _14 => _14.imageUrl]) || null,
      });
    }
  }, [open, existingLog, defaultDate, minDate, maxDate]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = _optionalChain([e, 'access', _15 => _15.target, 'access', _16 => _16.files, 'optionalAccess', _17 => _17[0]]);
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageFile: file,
          imagePreview: reader.result ,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.loggedBy.trim() || !formData.reason.trim() || !formData.delayDate) {
      return;
    }

    // Calculate monthIndex from delayDate
    const delayDateObj = new Date(formData.delayDate);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const delayMonthName = monthNames[delayDateObj.getMonth()];
    const calculatedMonthIndex = months.findIndex(m =>
      m.includes(delayMonthName) || m === delayMonthName
    );

    const delayLog = {
      id: _optionalChain([existingLog, 'optionalAccess', _18 => _18.id]) || `${taskId}-${delayDateObj.getTime()}-${Date.now()}`,
      taskId,
      loggedBy: formData.loggedBy.trim(),
      reason: formData.reason.trim(),
      delayDuration: parseInt(formData.delayDuration, 10) || 1,
      loggedAt: _optionalChain([existingLog, 'optionalAccess', _19 => _19.loggedAt]) || new Date().toISOString(),
      delayDate: new Date(formData.delayDate).toISOString(),
      monthIndex: calculatedMonthIndex >= 0 ? calculatedMonthIndex : monthIndex,
      imageUrl: formData.imagePreview || undefined,
    };

    onSave(delayLog);
    setFormData({
      loggedBy: "",
      reason: "",
      delayDuration: "1",
      delayDate: new Date().toISOString().split('T')[0],
      imageFile: null,
      imagePreview: null,
    });
    onOpenChange(false);
  };

  return (
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange, __self: this, __source: {fileName: _jsxFileName, lineNumber: 530}}
      , React.createElement(DialogContent, { className: "sm:max-w-[550px] p-0 overflow-hidden border-2 border-primary/10 shadow-2xl max-h-[90vh] flex flex-col"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 531}}
        , React.createElement(DialogHeader, { className: "p-6 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 532}}
          , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 533}}
            , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 534}}
              , React.createElement(Calendar, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 535}} )
            )
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 537}}
              , React.createElement(DialogTitle, { className: "text-xl font-bold font-heading"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 538}}
                , existingLog ? "Edit" : "Add", " Delay Log"
              )
              , React.createElement(DialogDescription, { className: "text-xs mt-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 541}}
                , taskName.length > 40 ? taskName.substring(0, 40) + "..." : taskName
              )
            )
          )
        )

        , React.createElement('form', { onSubmit: handleSubmit, className: "flex flex-col flex-1 overflow-hidden"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 548}}
          , React.createElement(ScrollArea, { className: "flex-1 max-h-[65vh] px-6 py-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 549}}
            , React.createElement('div', { className: "space-y-5 pb-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 550}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 551}}
                , React.createElement(Label, { htmlFor: "loggedBy", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 552}}, "Logged By "  , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 552}}, "*"))
                , React.createElement('div', { className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 553}}
                  , React.createElement(Input, {
                    id: "loggedBy",
                    placeholder: "Enter your name or ID"    ,
                    value: formData.loggedBy,
                    onChange: (e) => setFormData({ ...formData, loggedBy: e.target.value }),
                    className: "pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all"     ,
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 554}}
                  )
                  , React.createElement(AlertCircle, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 562}} )
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 566}}
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 567}}
                  , React.createElement(Label, { htmlFor: "delayDate", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 568}}, "Delay Date "  , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 568}}, "*"))
                  , React.createElement(Input, {
                    id: "delayDate",
                    type: "date",
                    min: minDate,
                    max: maxDate,
                    value: formData.delayDate,
                    onChange: (e) => setFormData({ ...formData, delayDate: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all"    ,
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 569}}
                  )
                  , minDate && maxDate && (
                    React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 580}}, "Within planned timeline: "   , minDate, " to "  , maxDate)
                  )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 583}}
                  , React.createElement(Label, { htmlFor: "delayDuration", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 584}}, "Duration (Days) "  , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 584}}, "*"))
                  , React.createElement(Input, {
                    id: "delayDuration",
                    type: "number",
                    min: "1",
                    placeholder: "1",
                    value: formData.delayDuration,
                    onChange: (e) => setFormData({ ...formData, delayDuration: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all"    ,
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 585}}
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 598}}
                , React.createElement(Label, { htmlFor: "reason", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 599}}, "Reason for Delay "   , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 599}}, "*"))
                , React.createElement(Textarea, {
                  id: "reason",
                  placeholder: "Describe the reason for the delay in detail..."       ,
                  value: formData.reason,
                  onChange: (e) => setFormData({ ...formData, reason: e.target.value }),
                  rows: 3,
                  className: "bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all resize-none p-3"     ,
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 600}}
                )
              )

              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 611}}
                , React.createElement(Label, { htmlFor: "image", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 612}}, "Evidence Image (Optional)"  )
                , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 613}}
                  , formData.imagePreview ? (
                    React.createElement('div', { className: "relative group rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900 shadow-md"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 615}}
                      , React.createElement('img', {
                        src: formData.imagePreview,
                        alt: "Delay evidence" ,
                        className: "w-full h-40 object-cover"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 616}}
                      )
                      , React.createElement('div', { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 621}}
                        , React.createElement(Button, {
                          type: "button",
                          variant: "destructive",
                          size: "sm",
                          className: "h-8 rounded-full shadow-lg"  ,
                          onClick: handleRemoveImage, __self: this, __source: {fileName: _jsxFileName, lineNumber: 622}}

                          , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 629}} ), " Remove"
                        )
                      )
                    )
                  ) : (
                    React.createElement('div', { className: "relative border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all rounded-xl p-8 text-center group cursor-pointer"           ,
                      onClick: () => _optionalChain([document, 'access', _20 => _20.getElementById, 'call', _21 => _21('image'), 'optionalAccess', _22 => _22.click, 'call', _23 => _23()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 634}}
                      , React.createElement(ImageIcon, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 636}} )
                      , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 637}}
                        , React.createElement('p', { className: "text-sm font-semibold text-foreground/80"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 638}}, "Click to upload image"   )
                        , React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 639}}, "PNG, JPG or JPEG up to 5MB"      )
                      )
                      , React.createElement(Input, {
                        id: "image",
                        type: "file",
                        accept: "image/*",
                        onChange: handleImageChange,
                        className: "hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 641}}
                      )
                    )
                  )
                )
              )
            )
          )

          , React.createElement(DialogFooter, { className: "p-6 pt-2 bg-muted/10 border-t border-border/50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 655}}
            , React.createElement(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), className: "h-11 rounded-xl px-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 656}}, "Cancel"

            )
            , React.createElement(Button, {
              type: "submit",
              disabled: !formData.loggedBy.trim() || !formData.reason.trim(),
              className: "h-11 rounded-xl px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 659}}

              , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 664}} )
              , existingLog ? "Update" : "Add", " Delay Log"
            )
          )
        )
      )
    )
  );
}

// Delay Log Cards Component (displays delay logs as cards beneath Gantt chart)
function DelayLogCards({
  delayLogs,
  ganttTasks,
  subProjects,
  months,
  onDelete,
  isMobile,
  isTablet,
}







) {
  // Get task name from taskId
  const getTaskName = (taskId) => {
    // First check subProjects
    const subProject = _optionalChain([subProjects, 'optionalAccess', _24 => _24.find, 'call', _25 => _25(sp => sp.id === taskId)]);
    if (subProject) return subProject.name;

    // Then check ganttTasks (including children)
    const findTaskInTree = (tasks, id) => {
      for (const task of tasks) {
        if (task.id === id) return task;
        if (task.children) {
          const found = findTaskInTree(task.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const task = findTaskInTree(ganttTasks, taskId);
    return _optionalChain([task, 'optionalAccess', _26 => _26.name]) || taskId;
  };

  if (delayLogs.length === 0) {
    return null;
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...delayLogs].sort((a, b) =>
    new Date(b.delayDate).getTime() - new Date(a.delayDate).getTime()
  );

  return (
    React.createElement('div', { className: "mt-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 724}}
      , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 725}}
        , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 726}} )
        , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 727}}, "Delay Logs ("
            , delayLogs.length, " total)"
        )
      )

      , React.createElement('div', { className: `grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 732}}
        , sortedLogs.map((log) => {
          const taskName = getTaskName(log.taskId);
          const subProject = _optionalChain([subProjects, 'optionalAccess', _27 => _27.find, 'call', _28 => _28(sp => sp.id === log.taskId)]);
          const variance = subProject
            ? Math.max(0, subProject.plannedProgress - subProject.actualProgress)
            : 0;
          const displayDate = log.loggedAt || log.delayDate;

          return (
            React.createElement(Card, { key: log.id, className: "border-amber-200 dark:border-orange-800 bg-amber-50/80 dark:bg-orange-950/20 rounded-xl overflow-hidden shadow-sm"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 742}}
              , React.createElement(CardContent, { className: "p-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 743}}
                , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 744}}
                  /* Task title */
                  , React.createElement('h4', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground truncate`, title: taskName, __self: this, __source: {fileName: _jsxFileName, lineNumber: 746}}
                    , taskName
                  )

                  /* Red status badge: X% behind schedule */
                  , variance > 0 && (
                    React.createElement(Badge, { variant: "destructive", className: "rounded-md px-2.5 py-1 text-xs font-semibold"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 752}}
                      , variance.toFixed(1), "% behind schedule"
                    )
                  )

                  /* Timeline: Month (calendar) + Duration (clock) - button-like */
                  , React.createElement('div', { className: "flex items-center gap-2 flex-wrap"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 758}}
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 759}}
                      , React.createElement(Calendar, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 760}} )
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 763}}
                      , React.createElement(Clock, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 764}} )
                      , log.delayDuration, " day" , log.delayDuration !== 1 ? 's' : ''
                    )
                  )

                  /* Reason for delay */
                  , React.createElement('p', { className: "text-sm text-muted-foreground leading-snug"  , title: log.reason, __self: this, __source: {fileName: _jsxFileName, lineNumber: 770}}
                    , log.reason
                  )

                  /* Image display */
                  , log.imageUrl && (
                    React.createElement('div', { className: "relative rounded-lg overflow-hidden border border-amber-200 dark:border-orange-800"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 776}}
                      , React.createElement('img', {
                        src: log.imageUrl,
                        alt: "Delay evidence" ,
                        className: "w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"     ,
                        onClick: () => {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>Delay Evidence</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                  <img src="${log.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                </body>
                              </html>
                            `);
                          }
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 777}}
                      )
                      , React.createElement('div', { className: "absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 795}}
                        , React.createElement(ImageIcon, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 796}} ), "Evidence"

                      )
                    )
                  )

                  /* Attribution and date */
                  , React.createElement('div', { className: "flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-amber-200/80 dark:border-orange-800/80"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 803}}
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 804}}, "By: " , log.loggedBy)
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 805}}, new Date(displayDate).toLocaleDateString())
                  )

                  /* Delete button beneath each delay log card */
                  , onDelete && (
                    React.createElement('div', { className: "pt-3 mt-2 border-t border-amber-200/80 dark:border-orange-800/80"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 810}}
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        className: "w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"     ,
                        onClick: () => {
                          if (confirm("Delete this delay log?")) {
                            onDelete(log.id);
                          }
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 811}}

                        , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 821}} ), "Delete delay log"

                      )
                    )
                  )
                )
              )
            )
          );
        })
      )
    )
  );
}

// Delay Logs Table Component (shows all logs in a table format)
function DelayLogsTable({
  delayLogs,
  ganttTasks,
  subProjects,
  months,
  onEdit,
  onDelete,
  isMobile,
  isTablet,
}








) {
  // Get task name from taskId
  const getTaskName = (taskId) => {
    // First check subProjects
    const subProject = _optionalChain([subProjects, 'optionalAccess', _29 => _29.find, 'call', _30 => _30(sp => sp.id === taskId)]);
    if (subProject) return subProject.name;

    // Then check ganttTasks (including children)
    const findTaskInTree = (tasks, id) => {
      for (const task of tasks) {
        if (task.id === id) return task;
        if (task.children) {
          const found = findTaskInTree(task.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const task = findTaskInTree(ganttTasks, taskId);
    return _optionalChain([task, 'optionalAccess', _31 => _31.name]) || taskId;
  };

  if (delayLogs.length === 0) {
    return (
      React.createElement('div', { className: "text-center py-12 text-muted-foreground border border-border rounded-lg"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 880}}
        , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 881}} )
        , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 882}}, "No delay logs recorded yet"    )
        , React.createElement('p', { className: "text-xs mt-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 883}}, "Delay logs will appear here when you log delays in the Gantt chart."            )
      )
    );
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...delayLogs].sort((a, b) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  return (
    React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 894}}
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 895}}
        , React.createElement('div', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 896}}
          , delayLogs.length, " delay log"  , delayLogs.length !== 1 ? 's' : '', " recorded"
        )
      )

      , React.createElement('div', { className: "border border-border rounded-lg overflow-hidden"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 901}}
        , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 902}}
          , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 903}}
            , React.createElement(TableHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 904}}
              , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 905}}
                , React.createElement(TableHead, { className: isMobile ? 'w-[120px]' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 906}}, "Task Name" )
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 907}}, "Month")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 908}}, "Logged By" )
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 909}}, "Duration")
                , React.createElement(TableHead, { className: isMobile ? 'hidden' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 910}}, "Reason")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 911}}, "Date")
                , React.createElement(TableHead, { className: "w-[100px] text-right" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 912}}, "Actions")
              )
            )
            , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 915}}
              , sortedLogs.map((log) => (
                React.createElement(TableRow, { key: log.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 917}}
                  , React.createElement(TableCell, { className: `font-medium ${isMobile ? 'text-xs' : ''}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 918}}
                    , React.createElement('div', { className: "max-w-[200px] truncate" , title: getTaskName(log.taskId), __self: this, __source: {fileName: _jsxFileName, lineNumber: 919}}
                      , getTaskName(log.taskId)
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 923}}
                    , React.createElement(Badge, { variant: "outline", className: "gap-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 924}}
                      , React.createElement(Calendar, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 925}} )
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 929}}
                    , log.loggedBy
                  )
                  , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 932}}
                    , React.createElement(Badge, { variant: "secondary", className: "gap-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 933}}
                      , log.delayDuration, " day" , log.delayDuration !== 1 ? 's' : ''
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'hidden' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 937}}
                    , React.createElement('div', { className: "max-w-[300px] truncate text-sm text-muted-foreground"   , title: log.reason, __self: this, __source: {fileName: _jsxFileName, lineNumber: 938}}
                      , log.reason
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : 'text-sm', __self: this, __source: {fileName: _jsxFileName, lineNumber: 942}}
                    , new Date(log.loggedAt).toLocaleDateString()
                  )
                  , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 945}}
                    , React.createElement('div', { className: "flex items-center justify-end gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 946}}
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => onEdit(log),
                        className: "h-8 w-8 p-0"  ,
                        title: "Edit log" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 947}}

                        , React.createElement(Edit2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 954}} )
                      )
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => {
                          if (confirm("Are you sure you want to delete this delay log?")) {
                            onDelete(log.id);
                          }
                        },
                        className: "h-8 w-8 p-0 text-destructive hover:text-destructive"    ,
                        title: "Delete log" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 956}}

                        , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 967}} )
                      )
                    )
                  )
                )
              ))
            )
          )
        )
      )

      /* Mobile view: Show reason in expanded view */
      , isMobile && (
        React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 980}}
          , sortedLogs.map((log) => (
            React.createElement('div', { key: log.id, className: "border border-border rounded-lg p-3 bg-card/50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 982}}
              , React.createElement('div', { className: "flex items-start justify-between gap-2 mb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 983}}
                , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 984}}
                  , React.createElement('div', { className: "font-medium text-sm truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 985}}, getTaskName(log.taskId))
                  , React.createElement('div', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 986}}
                    , months[log.monthIndex] || `Month ${log.monthIndex + 1}`, " • "  , log.loggedBy
                  )
                )
                , React.createElement('div', { className: "flex items-center gap-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 990}}
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => onEdit(log),
                    className: "h-7 w-7 p-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 991}}

                    , React.createElement(Edit2, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 997}} )
                  )
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => {
                      if (confirm("Delete this delay log?")) {
                        onDelete(log.id);
                      }
                    },
                    className: "h-7 w-7 p-0 text-destructive"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 999}}

                    , React.createElement(Trash2, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1009}} )
                  )
                )
              )
              , React.createElement('div', { className: "text-xs text-muted-foreground mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1013}}, log.reason)
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1014}}
                , React.createElement(Badge, { variant: "secondary", className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1015}}
                  , log.delayDuration, " day" , log.delayDuration !== 1 ? 's' : ''
                )
                , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1018}}
                  , new Date(log.loggedAt).toLocaleDateString()
                )
              )
            )
          ))
        )
      )
    )
  );
}

// Delay Logs List Dialog Component (shows all logs and allows adding new ones)
function DelayLogsListDialog({
  open,
  onOpenChange,
  taskName,
  taskId,
  monthIndex,
  monthName,
  months,
  delayLogs,
  onSave,
  onDelete,
}










) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState(undefined);

  const handleAddNew = () => {
    setEditingLog(undefined);
    setShowAddForm(true);
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setShowAddForm(true);
  };

  const handleSave = (log) => {
    onSave(log);
    setShowAddForm(false);
    setEditingLog(undefined);
  };

  const handleDelete = (logId) => {
    if (confirm("Are you sure you want to delete this delay log?")) {
      onDelete(logId);
    }
  };

  if (showAddForm) {
    return (
      React.createElement(DelayLogFormDialog, {
        open: showAddForm,
        onOpenChange: (open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingLog(undefined);
          }
        },
        taskName: taskName,
        taskId: taskId,
        monthIndex: monthIndex,
        monthName: monthName,
        months: months,
        onSave: handleSave,
        existingLog: editingLog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1081}}
      )
    );
  }

  return (
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1101}}
      , React.createElement(DialogContent, { className: "sm:max-w-[600px] max-h-[80vh]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1102}}
        , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1103}}
          , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1104}}, "Delay Logs for "   , taskName)
          , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1105}}, "View and manage delay logs for "
                  , monthName, ". Delay logs are displayed as orange bars in the Gantt chart."
          )
        )
        , React.createElement('div', { className: "space-y-4 py-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1109}}
          , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1110}}
            , React.createElement('div', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1111}}
              , delayLogs.length, " delay log"  , delayLogs.length !== 1 ? 's' : '', " recorded"
            )
            , React.createElement(Button, { onClick: handleAddNew, size: "sm", className: "gap-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1114}}
              , React.createElement(Plus, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1115}} ), "Add New Log"

            )
          )

          , delayLogs.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1121}}
              , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1122}} )
              , React.createElement('p', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1123}}, "No delay logs recorded yet."    )
              , React.createElement('p', { className: "text-xs mt-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1124}}, "Click \"Add New Log\" to record a delay."       )
            )
          ) : (
            React.createElement(ScrollArea, { className: "h-[400px] pr-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1127}}
              , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1128}}
                , delayLogs.map((log) => (
                  React.createElement('div', {
                    key: log.id,
                    className: "border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1130}}

                    , React.createElement('div', { className: "flex items-start justify-between gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1134}}
                      , React.createElement('div', { className: "flex-1 space-y-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1135}}
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1136}}
                          , React.createElement(Badge, { variant: "outline", className: "gap-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1137}}
                            , React.createElement(Calendar, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1138}} )
                            , new Date(log.loggedAt).toLocaleDateString()
                          )
                          , React.createElement(Badge, { variant: "secondary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1141}}
                            , log.delayDuration, " day" , log.delayDuration !== 1 ? 's' : ''
                          )
                        )
                        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1145}}
                          , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1146}}, "Logged by: "  , log.loggedBy)
                          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1147}}, log.reason)
                        )
                      )
                      , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1150}}
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleEdit(log),
                          className: "h-8 w-8 p-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1151}}

                          , React.createElement(Edit2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1157}} )
                        )
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleDelete(log.id),
                          className: "h-8 w-8 p-0 text-destructive hover:text-destructive"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1159}}

                          , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1165}} )
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )
        , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1175}}
          , React.createElement(Button, { variant: "outline", onClick: () => onOpenChange(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1176}}, "Close"

          )
        )
      )
    )
  );
}

function GanttMini({
  tasks,
  months,
  baseColor,
  subProjects,
  delayLogs,
  onAddDelayLog,
  onDeleteDelayLog,
  onOpenAddPhoto,
}








) {
  const n = months.length || 1;
  // Initialize all tasks as expanded by default
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    tasks.forEach(task => {
      if (task.children && task.children.length > 0) {
        initial[task.id] = true;
      }
    });
    return initial;
  });

  // Delay logs list dialog state
  const [delayLogsDialogOpen, setDelayLogsDialogOpen] = useState(false);
  const [selectedTaskForDelay, setSelectedTaskForDelay] = useState




(null);

  // Add delay log form dialog state (for clicking on bars)
  const [addLogDialogOpen, setAddLogDialogOpen] = useState(false);
  const [selectedBarForLog, setSelectedBarForLog] = useState





(null);

  // Add delay log from row options button (restricted to planned timeline)
  const [rowAddLogOpen, setRowAddLogOpen] = useState(false);
  const [selectedRowForDelayLog, setSelectedRowForDelayLog] = useState




(null);


  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const delayLogsDisabled = true;

  // Get delay logs for a specific task and month
  const getDelayLogsForTask = (taskId, monthIndex) => {
    if (delayLogsDisabled) return [];
    if (!delayLogs) return [];
    return delayLogs.filter(log => log.taskId === taskId && log.monthIndex === monthIndex);
  };

  // Calculate position within month cell based on date
  const getDatePositionInMonth = (delayDate, monthIndex) => {
    if (!delayDate) return 0;
    const date = new Date(delayDate);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const dayOfMonth = date.getDate();
    // Return percentage position within the month (0-100%)
    return (dayOfMonth / daysInMonth) * 100;
  };

  // Handle click on Gantt bar to add delay log
  const handleBarClick = (e, taskId, taskName, monthIndex) => {
    if (delayLogsDisabled) return;
    e.stopPropagation();
    // Calculate approximate date from click position within the month cell
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cellWidth = rect.width;
    const clickPercent = (clickX / cellWidth) * 100;

    // Estimate date based on click position
    const monthName = months[monthIndex] || 'Jan';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndexNum = monthNames.findIndex(m => monthName.includes(m));
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, monthIndexNum + 1, 0).getDate();
    const estimatedDay = Math.max(1, Math.min(daysInMonth, Math.round((clickPercent / 100) * daysInMonth)));

    const estimatedDate = new Date(currentYear, monthIndexNum, estimatedDay);

    setSelectedBarForLog({
      taskId,
      taskName,
      monthIndex,
      monthName,
      clickDate: estimatedDate.toISOString(),
    });
    setAddLogDialogOpen(true);
  };

  // Get sub-project data for a task to check if it's delayed
  const getSubProjectForTask = (taskId) => {
    return _optionalChain([subProjects, 'optionalAccess', _32 => _32.find, 'call', _33 => _33(sp => sp.id === taskId)]);
  };

  // Check if task has delay (actual < planned)
  const hasDelay = (task) => {
    const subProject = getSubProjectForTask(task.id);
    if (!subProject) return task.status === "behind";
    return subProject.actualProgress < subProject.plannedProgress;
  };

  const handleOpenDelayLogs = (taskId, taskName, monthIndex) => {
    setSelectedTaskForDelay({
      taskId,
      taskName,
      monthIndex,
      monthName: months[monthIndex] || `Month ${monthIndex + 1}`,
    });
    setDelayLogsDialogOpen(true);
  };

  const handleSaveDelayLog = (log) => {
    if (onAddDelayLog) {
      onAddDelayLog(log);
    }
  };

  const handleDeleteDelayLog = (logId) => {
    if (onDeleteDelayLog) {
      onDeleteDelayLog(logId);
    }
  };

  // Get delay logs for selected task/month
  const getSelectedTaskDelayLogs = () => {
    if (!selectedTaskForDelay || !delayLogs) return [];
    return delayLogs.filter(
      log => log.taskId === selectedTaskForDelay.taskId && log.monthIndex === selectedTaskForDelay.monthIndex
    );
  };

  const toggle = (id, e) => {
    _optionalChain([e, 'optionalAccess', _34 => _34.stopPropagation, 'call', _35 => _35()]);
    _optionalChain([e, 'optionalAccess', _36 => _36.preventDefault, 'call', _37 => _37()]);
    setExpanded((prev) => {
      const currentValue = _nullishCoalesce(prev[id], () => ( true)); // Default to true (expanded)
      return { ...prev, [id]: !currentValue };
    });
  };

  // Calculate grid columns: WBS column + month columns + Actions column
  const labelColWidth = isMobile ? '140px' : isTablet ? '180px' : '240px';
  const actionsColWidth = '48px';
  const monthColWidth = isMobile ? '44px' : '1fr';
  const gridCols = `${labelColWidth} repeat(${n}, ${monthColWidth}) ${actionsColWidth}`;
  const mobileMinChartWidth = isMobile ? `${140 + n * 44 + 48}px` : undefined;

  return (
    React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1358}}
      /* Delay Logs List Dialog */
      , selectedTaskForDelay && (
        React.createElement(DelayLogsListDialog, {
          open: delayLogsDialogOpen,
          onOpenChange: setDelayLogsDialogOpen,
          taskName: selectedTaskForDelay.taskName,
          taskId: selectedTaskForDelay.taskId,
          monthIndex: selectedTaskForDelay.monthIndex,
          monthName: selectedTaskForDelay.monthName,
          months: months,
          delayLogs: getSelectedTaskDelayLogs(),
          onSave: handleSaveDelayLog,
          onDelete: handleDeleteDelayLog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1361}}
        )
      )

      /* Add Delay Log Dialog (from clicking on bar) */
      , selectedBarForLog && (
        React.createElement(DelayLogFormDialog, {
          open: addLogDialogOpen,
          onOpenChange: (open) => {
            if (!open) {
              setAddLogDialogOpen(false);
              setSelectedBarForLog(null);
            }
          },
          taskName: selectedBarForLog.taskName,
          taskId: selectedBarForLog.taskId,
          monthIndex: selectedBarForLog.monthIndex,
          monthName: selectedBarForLog.monthName,
          months: months,
          onSave: handleSaveDelayLog,
          defaultDate: selectedBarForLog.clickDate, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1377}}
        )
      )

      /* Add Delay Log Dialog (from row options button - date restricted to planned timeline) */
      , selectedRowForDelayLog && (() => {
        const { minDate, maxDate } = getPlannedDateRange(
          selectedRowForDelayLog.startIdx,
          selectedRowForDelayLog.endIdx,
          GANTT_CHART_YEAR
        );
        const defaultInRange = minDate; // first day of planned timeline
        return (
          React.createElement(DelayLogFormDialog, {
            open: rowAddLogOpen,
            onOpenChange: (open) => {
              if (!open) {
                setRowAddLogOpen(false);
                setSelectedRowForDelayLog(null);
              }
            },
            taskName: selectedRowForDelayLog.taskName,
            taskId: selectedRowForDelayLog.taskId,
            monthIndex: selectedRowForDelayLog.startIdx,
            monthName: months[selectedRowForDelayLog.startIdx] || "—",
            months: months,
            onSave: (log) => {
              handleSaveDelayLog(log);
              setRowAddLogOpen(false);
              setSelectedRowForDelayLog(null);
            },
            defaultDate: defaultInRange,
            minDate: minDate,
            maxDate: maxDate, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1404}}
          )
        );
      })()

      /* Legend removed (delay logs feature removed) */

      /* Gantt Chart Container with full border */
      , React.createElement('div', { className: "border-2 border-border rounded-lg bg-background overflow-x-auto"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1432}}
        , React.createElement('div', { style: mobileMinChartWidth ? { minWidth: mobileMinChartWidth } : undefined, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1433}}
        /* Header row with month labels */
        , React.createElement('div', { className: "grid border-b-2 border-border bg-muted/30"   , style: { gridTemplateColumns: gridCols }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1435}}
          , React.createElement('div', { className: `${isMobile ? 'p-1.5 text-[10px]' : 'p-2 text-xs'} font-bold text-muted-foreground border-r-2 border-border bg-muted/40`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1436}}, "WBS Subprocess" )
          , months.map((m, idx) => {
            const { label, dateRange } = getMonthHeaderLabel(m, GANTT_CHART_YEAR);
            return (
              React.createElement('div', {
                key: m,
                className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-r-2 border-border bg-muted/40 flex flex-col items-center justify-center gap-0.5`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1440}}

                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1444}}, isMobile ? label.replace(` ${GANTT_CHART_YEAR}`, "'26") : label)
                , React.createElement('span', { className: `font-normal opacity-90 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1445}}, dateRange)
              )
            );
          })
          , React.createElement('div', { className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-border bg-muted/40 flex items-center justify-center`, title: "Add delay log (within planned timeline)"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1449}}, "Options"

          )
        )

        /* Task rows */
        , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1455}}
          , tasks.map((t) => {
            const isExpanded = _nullishCoalesce(expanded[t.id], () => ( true));
            const hasChildren = (_nullishCoalesce(_optionalChain([t, 'access', _38 => _38.children, 'optionalAccess', _39 => _39.length]), () => ( 0))) > 0;
            const subProject = getSubProjectForTask(t.id);
            const progress = getProgressPercentage(t, subProject);
            const plannedPct = getPlannedPercentage(t, subProject);
            const responsible = getResponsiblePerson(t.id, t.name);
            const span = t.endIdx - t.startIdx + 1;

            return (
              React.createElement('div', { key: t.id, className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1466}}
                /* Parent task row */
                , React.createElement('div', { className: "grid border-l-2 border-r-2 border-b-2 border-border relative bg-background overflow-hidden"       , style: { gridTemplateColumns: gridCols }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1468}}
                  /* Left label column */
                  , React.createElement('div', { className: "p-2 border-r-2 border-border flex items-center gap-2 min-w-0 relative z-5 bg-muted/20"         , onClick: (e) => e.stopPropagation(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1470}}
                    , hasChildren && (
                      React.createElement('button', {
                        type: "button",
                        onClick: (e) => toggle(t.id, e),
                        onMouseDown: (e) => e.stopPropagation(),
                        className: "h-5 w-5 rounded border border-border/60 bg-background hover:bg-muted/40 transition-colors flex items-center justify-center flex-shrink-0 relative z-10"             ,
                        title: isExpanded ? "Collapse" : "Expand", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1472}}

                        , React.createElement('span', { className: "text-[10px] font-bold leading-none"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1479}}, isExpanded ? "−" : "+")
                      )
                    )
                    , React.createElement('div', { className: "min-w-0 flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1482}}
                      , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-foreground truncate`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1483}}, t.name)
                      , React.createElement('div', { className: `${isMobile ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1484}}, "Weight "
                         , (t.weight * 100).toFixed(0), "% •" , " "
                        , React.createElement('span', {
                          className: 
                            t.status === "ahead"
                              ? "text-emerald-600"
                              : t.status === "behind"
                                ? "text-red-600"
                                : "text-emerald-700"
                          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1486}}

                          , t.status === "ontrack" ? "On track" : t.status === "ahead" ? "Ahead" : "Behind"
                        )
                      )
                    )
                  )

                  /* Timeline container - month columns only (Actions column is last) */
                  , React.createElement('div', { className: "relative border-r-2 border-border"  , style: { gridColumn: `2 / span ${n}` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1502}}
                    /* Grid cells for timeline - background cells */
                    , React.createElement('div', { className: "grid h-12" , style: { gridTemplateColumns: `repeat(${n}, 1fr)` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1504}}
                      , months.map((m, monthIdx) => {
                        const taskHasDelay = hasDelay(t);
                        const delayLogsForMonth = getDelayLogsForTask(t.id, monthIdx);
                        const isInTaskRange = monthIdx >= t.startIdx && monthIdx <= t.endIdx;

                        return (
                          React.createElement('div', {
                            key: m,
                            className: "border-r-2 border-border last:border-r-0 bg-muted/20 relative"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1511}}

                            /* Clickable area to add delay log - only show if task is in range */
                            , isInTaskRange && (
                              React.createElement('button', {
                                type: "button",
                                onClick: (e) => handleBarClick(e, t.id, t.name, monthIdx),
                                className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer"         ,
                                title: "Click anywhere on this cell to add a delay log"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1517}}
                              )
                            )
                            /* Delay log indicators - positioned based on date within month - more visible with icons */
                            , delayLogsForMonth.length > 0 && (
                              React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-11"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1526}}
                                , delayLogsForMonth.map((log) => {
                                  const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                  return (
                                    React.createElement('div', {
                                      key: log.id,
                                      className: "absolute group" ,
                                      style: {
                                        left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1530}}

                                      /* Indicator bar */
                                      , React.createElement('div', { className: "h-2.5 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-5 min-w-[4px]"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1538}} )
                                      /* Icon badge */
                                      , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1540}}
                                        , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1541}} )
                                      )
                                      /* Tooltip */
                                      , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1544}}
                                        , React.createElement('div', { className: "font-semibold flex items-center gap-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1545}}
                                          , React.createElement(Clock, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1546}} ), "Delay Logged"

                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-90 mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1549}}, log.reason)
                                        , log.imageUrl && (
                                          React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1551}}
                                            , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1552}}
                                              , React.createElement(ImageIcon, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1553}} ), "Evidence Image:"

                                            )
                                            , React.createElement('img', {
                                              src: log.imageUrl,
                                              alt: "Delay evidence" ,
                                              className: "w-full h-24 object-cover rounded mt-1 cursor-pointer hover:opacity-80"      ,
                                              onClick: (e) => {
                                                e.stopPropagation();
                                                const newWindow = window.open();
                                                if (newWindow) {
                                                  newWindow.document.write(`
                                                  <html>
                                                    <head><title>Delay Evidence</title></head>
                                                    <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                                      <img src="${log.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                                    </body>
                                                  </html>
                                                `);
                                                }
                                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1556}}
                                            )
                                          )
                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-75" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1577}}, log.delayDuration, " days • "   , new Date(log.delayDate).toLocaleDateString())
                                        , React.createElement('div', { className: "text-[10px] opacity-75" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1578}}, "By: " , log.loggedBy)
                                        , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1579}} )
                                      )
                                    )
                                  );
                                })
                              )
                            )
                          )
                        );
                      })
                    )

                    /* Task bar spanning across cells - clickable to add delay logs. Planned = blue, Actual = green, Delay = red. */
                    , (() => {
                      const plannedColor = "#2F8F6C"; // azure
                      const actualColor = "#2E7D32"; // forest green
                      const barBgColor = "rgba(59, 130, 246, 0.2)";
                      return (
                    React.createElement('div', {
                      className: "absolute top-1 bottom-1 rounded shadow-sm z-10 overflow-hidden"      ,
                      style: {
                        left: `${(t.startIdx / n) * 100}%`,
                        width: `${(span / n) * 100}%`,
                        maxWidth: `calc(100% - ${(t.startIdx / n) * 100}%)`,
                        backgroundColor: barBgColor,
                      },
                      onClick: (e) => {
                        // Calculate which month was clicked
                        const barRect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - barRect.left;
                        const barWidth = barRect.width;
                        const clickPercent = (clickX / barWidth) * 100;
                        const monthIdx = Math.floor((clickPercent / 100) * span) + t.startIdx;
                        const clampedMonthIdx = Math.max(t.startIdx, Math.min(t.endIdx, monthIdx));
                        handleBarClick(e, t.id, t.name, clampedMonthIdx);
                      },
                      title: "Click on the bar to add a delay log at this position"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1597}}

                      /* Top = Planned (blue), Bottom = Actual (green), Delay stripe = red */
                      , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1618}}
                        /* Top half: Planned progress - blue */
                        , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1620}}
                          , React.createElement('div', {
                            className: "h-full transition-all duration-300"  ,
                            style: { width: `${Math.min(100, Math.max(0, plannedPct))}%`, backgroundColor: plannedColor },
                            title: `Planned: ${plannedPct}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1621}}
                          )
                        )
                        /* Bottom half: Actual progress - green */
                        , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1628}}
                          , React.createElement('div', {
                            className: "h-full transition-all duration-300"  ,
                            style: { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: actualColor },
                            title: `Actual: ${progress}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1629}}
                          )
                          /* Delay impact stripe - red */
                          , subProject && (subProject ).delayImpact > 0 && (subProject ).originalProgress > progress && (
                            React.createElement('div', {
                              className: "absolute top-0 bottom-0 bg-red-500/50 border-r-2 border-red-600/60 transition-all duration-300"       ,
                              style: {
                                left: `${Math.min(100, Math.max(0, progress))}%`,
                                width: `${Math.min(100 - progress, (subProject ).delayImpact)}%`,
                              },
                              title: `Delay impact: ${((subProject ).delayImpact).toFixed(1)}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1636}}
                            )
                          )
                        )
                      )
                      /* Delay log markers on the progress bar - more visible with icons */
                      , delayLogs && delayLogs.filter(log => log.taskId === t.id && log.monthIndex >= t.startIdx && log.monthIndex <= t.endIdx).map((log) => {
                        // Calculate position within the bar based on month index
                        const positionInBar = ((log.monthIndex - t.startIdx) / span) * 100;
                        const clampedPosition = Math.max(0, Math.min(100, positionInBar));

                        return (
                          React.createElement('div', {
                            key: log.id,
                            className: "absolute top-0 bottom-0 z-12 group"    ,
                            style: {
                              left: `${clampedPosition}%`,
                              transform: 'translateX(-50%)',
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1654}}

                            /* Vertical marker line */
                            , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-1 bg-orange-500 shadow-lg border-l border-r border-orange-600"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1663}} )
                            /* Icon indicator at top */
                            , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1665}}
                              , React.createElement(AlertTriangle, { className: "h-2 w-2 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1666}} )
                            )
                            /* Tooltip on hover */
                            , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1669}}
                              , React.createElement('div', { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1670}}, "Delay Logged" )
                              , React.createElement('div', { className: "text-[10px] opacity-90" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1671}}, log.reason)
                              , React.createElement('div', { className: "text-[10px] opacity-75" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1672}}, log.delayDuration, " days • "   , new Date(log.delayDate).toLocaleDateString())
                              , React.createElement('div', { className: "text-[10px] opacity-75" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1673}}, "By: " , log.loggedBy)
                              , log.imageUrl && (
                                React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1675}}
                                  , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1676}}
                                    , React.createElement(ImageIcon, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1677}} ), "Evidence Image:"

                                  )
                                  , React.createElement('img', {
                                    src: log.imageUrl,
                                    alt: "Delay evidence" ,
                                    className: "w-full h-24 object-cover rounded mt-1 cursor-pointer hover:opacity-80"      ,
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      const newWindow = window.open();
                                      if (newWindow) {
                                        newWindow.document.write(`
                                        <html>
                                          <head><title>Delay Evidence</title></head>
                                          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                            <img src="${log.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                          </body>
                                        </html>
                                      `);
                                      }
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1680}}
                                  )
                                )
                              )
                              , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1701}} )
                            )
                          )
                        );
                      })
                      /* Text content */
                      , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} font-semibold text-white truncate flex-1 pointer-events-none relative z-20 px-2 flex items-center h-full`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1707}}
                        , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1708}}
                          , React.createElement('div', { className: "truncate flex items-center gap-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1709}}
                            , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1710}}, responsible)
                          )
                          , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} opacity-95 flex items-center gap-1.5 flex-wrap`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1712}}
                            , React.createElement('span', { title: "Top strip = Planned"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1713}}, React.createElement('span', { className: "opacity-80", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1713}}, "P:"), plannedPct, "%")
                            , React.createElement('span', { className: "opacity-60", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1714}}, "|")
                            , React.createElement('span', { title: "Bottom strip = Actual"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1715}}, React.createElement('span', { className: "opacity-80", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1715}}, "A:"), progress, "%")
                          )
                        )
                      )
                    )
                  ); })()
                  )
                  /* Actions column: options menu (Add delay log / Delete delay log(s)) */
                  , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1723}}
                    /* Delay log options removed */
                  )
                )

                /* Child task rows */
                , hasChildren && isExpanded && (
                  React.createElement('div', { className: "space-y-0.5 pl-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1730}}
                    , t.children.map((c) => {
                      const childSubProject = getSubProjectForTask(c.id);
                      const childProgress = getProgressPercentage(c, childSubProject);
                      const childPlannedPct = getPlannedPercentage(c, childSubProject);
                      const childResponsible = getResponsiblePerson(c.id, c.name);
                      const childSpan = c.endIdx - c.startIdx + 1;

                      return (
                        React.createElement('div', {
                          key: c.id,
                          className: "grid border-l-2 border-r-2 border-b-2 border-border relative bg-background overflow-hidden"       ,
                          style: { gridTemplateColumns: gridCols }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1739}}

                          /* Left label column */
                          , React.createElement('div', { className: "p-1.5 border-r-2 border-border min-w-0 relative z-10 bg-muted/10"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1745}}
                            , React.createElement('div', { className: `${isMobile ? 'text-[11px]' : 'text-xs'} font-medium text-foreground/90 truncate`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1746}}, c.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1747}}, "Weight "
                               , (c.weight * 100).toFixed(0), "%"
                            )
                          )

                          /* Timeline container - month columns only */
                          , React.createElement('div', { className: "relative border-r-2 border-border"  , style: { gridColumn: `2 / span ${n}` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1753}}
                            /* Grid cells for timeline - background cells */
                            , React.createElement('div', { className: "grid h-10" , style: { gridTemplateColumns: `repeat(${n}, 1fr)` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1755}}
                              , months.map((m, monthIdx) => {
                                const childHasDelay = c.status === "behind";
                                const delayLogsForMonth = getDelayLogsForTask(c.id, monthIdx);
                                const isInTaskRange = monthIdx >= c.startIdx && monthIdx <= c.endIdx;

                                return (
                                  React.createElement('div', {
                                    key: m,
                                    className: "border-r-2 border-border last:border-r-0 bg-muted/10 relative"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1762}}

                                    /* Clickable area to add delay log for child tasks */
                                    , isInTaskRange && (
                                      React.createElement('button', {
                                        type: "button",
                                        onClick: (e) => handleBarClick(e, c.id, c.name, monthIdx),
                                        className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer"         ,
                                        title: "Click anywhere on this cell to add a delay log"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1768}}
                                      )
                                    )
                                    /* Delay log indicators for child tasks - positioned based on date - more visible with icons */
                                    , delayLogsForMonth.length > 0 && (
                                      React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-25"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1777}}
                                        , delayLogsForMonth.map((log) => {
                                          const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                          return (
                                            React.createElement('div', {
                                              key: log.id,
                                              className: "absolute group" ,
                                              style: {
                                                left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1781}}

                                              /* Indicator bar */
                                              , React.createElement('div', { className: "h-2 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-4 min-w-[3px]"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1789}} )
                                              /* Icon badge */
                                              , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1791}}
                                                , React.createElement(AlertTriangle, { className: "h-1 w-1 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1792}} )
                                              )
                                              /* Tooltip */
                                              , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1795}}
                                                , React.createElement('div', { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1796}}, "Delay")
                                                , React.createElement('div', { className: "opacity-90", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1797}}, log.reason)
                                                , React.createElement('div', { className: "opacity-75", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1798}}, log.delayDuration, "d")
                                                , log.imageUrl && (
                                                  React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1800}}
                                                    , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1801}}
                                                      , React.createElement(ImageIcon, { className: "h-2.5 w-2.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1802}} ), "Evidence:"

                                                    )
                                                    , React.createElement('img', {
                                                      src: log.imageUrl,
                                                      alt: "Delay evidence" ,
                                                      className: "w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"     ,
                                                      onClick: (e) => {
                                                        e.stopPropagation();
                                                        const newWindow = window.open();
                                                        if (newWindow) {
                                                          newWindow.document.write(`
                                                          <html>
                                                            <head><title>Delay Evidence</title></head>
                                                            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                                              <img src="${log.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                                            </body>
                                                          </html>
                                                        `);
                                                        }
                                                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1805}}
                                                    )
                                                  )
                                                )
                                              )
                                            )
                                          );
                                        })
                                      )
                                    )
                                  )
                                );
                              })
                            )

                            /* Child task bar: Planned = blue, Actual = green, Delay = red */
                            , (() => {
                              const plannedColor = "#2F8F6C";
                              const actualColor = "#2E7D32";
                              const childBarBgColor = "rgba(59, 130, 246, 0.2)";
                              return (
                            React.createElement('div', {
                              className: "absolute top-0.5 bottom-0.5 rounded z-20 overflow-hidden"     ,
                              style: {
                                left: `${(c.startIdx / n) * 100}%`,
                                width: `${(childSpan / n) * 100}%`,
                                maxWidth: `calc(100% - ${(c.startIdx / n) * 100}%)`,
                                backgroundColor: childBarBgColor,
                              },
                              onClick: (e) => {
                                // Calculate which month was clicked
                                const barRect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - barRect.left;
                                const barWidth = barRect.width;
                                const clickPercent = (clickX / barWidth) * 100;
                                const monthIdx = Math.floor((clickPercent / 100) * childSpan) + c.startIdx;
                                const clampedMonthIdx = Math.max(c.startIdx, Math.min(c.endIdx, monthIdx));
                                handleBarClick(e, c.id, c.name, clampedMonthIdx);
                              },
                              title: "Click on the bar to add a delay log at this position"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1843}}

                              , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1863}}
                                , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1864}}
                                  , React.createElement('div', {
                                    className: "h-full transition-all duration-300"  ,
                                    style: { width: `${Math.min(100, Math.max(0, childPlannedPct))}%`, backgroundColor: plannedColor },
                                    title: `Planned: ${childPlannedPct}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1865}}
                                  )
                                )
                                , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1871}}
                                  , React.createElement('div', {
                                    className: "h-full transition-all duration-300"  ,
                                    style: { width: `${Math.min(100, Math.max(0, childProgress))}%`, backgroundColor: actualColor },
                                    title: `Actual: ${childProgress}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1872}}
                                  )
                                  , childSubProject && (childSubProject ).delayImpact > 0 && (childSubProject ).originalProgress > childProgress && (
                                    React.createElement('div', {
                                      className: "absolute top-0 bottom-0 bg-red-500/50 border-r-2 border-red-600/60 transition-all duration-300"       ,
                                      style: {
                                        left: `${Math.min(100, Math.max(0, childProgress))}%`,
                                        width: `${Math.min(100 - childProgress, (childSubProject ).delayImpact)}%`,
                                      },
                                      title: `Delay impact: ${((childSubProject ).delayImpact).toFixed(1)}%`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1878}}
                                    )
                                  )
                                )
                              )
                              /* Delay log markers on the progress bar - more visible with icons */
                              , delayLogs && delayLogs.filter(log => log.taskId === c.id && log.monthIndex >= c.startIdx && log.monthIndex <= c.endIdx).map((log) => {
                                // Calculate position within the bar based on month index
                                const positionInBar = ((log.monthIndex - c.startIdx) / childSpan) * 100;
                                const clampedPosition = Math.max(0, Math.min(100, positionInBar));

                                return (
                                  React.createElement('div', {
                                    key: log.id,
                                    className: "absolute top-0 bottom-0 z-30 group"    ,
                                    style: {
                                      left: `${clampedPosition}%`,
                                      transform: 'translateX(-50%)',
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1896}}

                                    /* Vertical marker line */
                                    , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-0.5 bg-orange-500 shadow-md border-l border-r border-orange-600"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1905}} )
                                    /* Icon indicator at top */
                                    , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1907}}
                                      , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1908}} )
                                    )
                                    /* Tooltip on hover */
                                    , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1911}}
                                      , React.createElement('div', { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1912}}, "Delay")
                                      , React.createElement('div', { className: "opacity-90", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1913}}, log.reason)
                                      , React.createElement('div', { className: "opacity-75", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1914}}, log.delayDuration, "d")
                                      , log.imageUrl && (
                                        React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1916}}
                                          , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1917}}
                                            , React.createElement(ImageIcon, { className: "h-2.5 w-2.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1918}} ), "Evidence:"

                                          )
                                          , React.createElement('img', {
                                            src: log.imageUrl,
                                            alt: "Delay evidence" ,
                                            className: "w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"     ,
                                            onClick: (e) => {
                                              e.stopPropagation();
                                              const newWindow = window.open();
                                              if (newWindow) {
                                                newWindow.document.write(`
                                                <html>
                                                  <head><title>Delay Evidence</title></head>
                                                  <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                                    <img src="${log.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                                  </body>
                                                </html>
                                              `);
                                              }
                                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1921}}
                                          )
                                        )
                                      )
                                    )
                                  )
                                );
                              })
                              /* Text content: Actual / Planned */
                              , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} font-medium text-white truncate flex-1 pointer-events-none relative z-20 px-1.5 flex items-center h-full drop-shadow-md`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1947}}
                                , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1948}}
                                  , React.createElement('div', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1949}}, childResponsible)
                                  , React.createElement('div', { className: `${isMobile ? 'text-[6px]' : 'text-[7px]'} opacity-95 flex items-center gap-1`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1950}}
                                    , React.createElement('span', { title: "Top = Planned"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1951}}, "P:", childPlannedPct, "%")
                                    , React.createElement('span', { className: "opacity-60", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1952}}, "|")
                                    , React.createElement('span', { title: "Bottom = Actual"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1953}}, "A:", childProgress, "%")
                                  )
                                )
                              )
                            )
                          ); })()
                          )
                          /* Actions column for child row: options menu */
                          , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1961}}
                            , React.createElement(DropdownMenu, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1962}}
                              , React.createElement(DropdownMenuTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1963}}
                                , React.createElement('button', {
                                  type: "button",
                                  onClick: (e) => e.stopPropagation(),
                                  className: "h-7 w-7 rounded-md border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"            ,
                                  title: "Options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1964}}

                                  , React.createElement(MoreVertical, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1970}} )
                                )
                              )
                              , React.createElement(DropdownMenuContent, { align: "end", className: "w-56", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1973}}
                                , React.createElement(DropdownMenuItem, {
                                  onSelect: (e) => {
                                    e.preventDefault();
                                    setSelectedRowForDelayLog({
                                      taskId: c.id,
                                      taskName: c.name,
                                      startIdx: c.startIdx,
                                      endIdx: c.endIdx,
                                    });
                                    setRowAddLogOpen(true);
                                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1974}}

                                  , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1986}} ), "Add delay log"

                                )
                                , onOpenAddPhoto && (
                                  React.createElement(DropdownMenuItem, {
                                    onSelect: (e) => {
                                      e.preventDefault();
                                      onOpenAddPhoto(c.id, c.name);
                                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1990}}

                                    , React.createElement(ImageIcon, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1996}} ), "Add Photo"

                                  )
                                )
                              )
                            )
                          )
                        )
                      );
                    })
                  )
                )
              )
            );
          })
        )
        )
      )
    )
  );
}

export function MilestoneDetailsPanel({
  milestoneTitle,
  phase,
  phaseColor,
  onClear,
  showAllTabs = false,
  flatGanttTasks,
  ganttProjectId,
  onProjectGanttRefresh,
}

























) {
  const [tab, setTab] = useState("gantt");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialogs opened from Gantt activity options (three dots)
  const [addPhotoDialogOpen, setAddPhotoDialogOpen] = useState(false);
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);
  const [selectedTaskForMedia, setSelectedTaskForMedia] = useState




(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentUploading, setDocumentUploading] = useState(false);
  const [photoDialogForm, setPhotoDialogForm] = useState(null);
  const photoDialogInputRef = React.useRef(null);
  const docDialogInputRef = React.useRef(null);

  const [updateImageOpen, setUpdateImageOpen] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [updateImageForm, setUpdateImageForm] = useState








(null);

  const closeUpdateImageDialog = () => {
    if (_optionalChain([updateImageForm, 'optionalAccess', _40 => _40.previewUrl])) URL.revokeObjectURL(updateImageForm.previewUrl);
    setUpdateImageForm(null);
    setUpdateImageOpen(false);
    setUpdatingImage(false);
  };

  const [updateDelayOpen, setUpdateDelayOpen] = useState(false);
  const [updatingDelay, setUpdatingDelay] = useState(false);
  const [updateDelayForm, setUpdateDelayForm] = useState








(null);
  const closeUpdateDelayDialog = () => {
    setUpdateDelayForm(null);
    setUpdateDelayOpen(false);
    setUpdatingDelay(false);
  };

  const [updateDocOpen, setUpdateDocOpen] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState(false);
  const [updateDocForm, setUpdateDocForm] = useState






(null);
  const closeUpdateDocDialog = () => {
    setUpdateDocForm(null);
    setUpdateDocOpen(false);
    setUpdatingDoc(false);
  };

  // State for editing delay log from table
  const [editingLogFromTable, setEditingLogFromTable] = useState(undefined);
  const [showEditForm, setShowEditForm] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const subProjects = _nullishCoalesce(phase.subProjects, () => ( []));
  const timeline = _nullishCoalesce(phase.timeline, () => ( []));
  const months = useMemo(() => timeline.map((t) => t.month), [timeline]);

  // Delay Logs feature removed (was hardcoded); do not adjust progress.
  const delayLogs = [];
  const adjustedSubProjects = subProjects;

  const { data: apiDelayLogsData, isFetching: apiDelayLogsLoading } = useQuery({
    queryKey: ["delay-logs", ganttProjectId],
    queryFn: async () => {
      if (ganttProjectId == null) return { count: 0, data: []  };
      return await listDelayLogs({ project: ganttProjectId });
    },
    enabled: ganttProjectId != null,
    staleTime: 30 * 1000,
  });
  const apiDelayLogs = (_nullishCoalesce(_optionalChain([apiDelayLogsData, 'optionalAccess', _41 => _41.data]), () => ( []))) ;

  const { data: apiProgressImagesData, isFetching: apiProgressImagesLoading } = useQuery({
    queryKey: ["progress-images", ganttProjectId],
    queryFn: async () => {
      if (ganttProjectId == null) return [] ;
      return await listProgressImages({ project: ganttProjectId });
    },
    enabled: ganttProjectId != null,
    staleTime: 30 * 1000,
  });
  const apiProgressImages = (_nullishCoalesce(apiProgressImagesData, () => ( []))) ;

  const { data: apiProjectDocumentsData, isFetching: apiProjectDocumentsLoading } = useQuery({
    queryKey: ["project-documents", ganttProjectId],
    queryFn: async () => {
      if (ganttProjectId == null) return [] ;
      return await listProjectDocuments({ project: ganttProjectId });
    },
    enabled: ganttProjectId != null,
    staleTime: 30 * 1000,
  });
  const apiProjectDocuments = (_nullishCoalesce(apiProjectDocumentsData, () => ( []))) ;

  const activityLabelByDbId = useMemo(() => {
    const m = new Map();
    for (const row of _nullishCoalesce(flatGanttTasks, () => ( []))) {
      if (typeof row.db_id === "number" && Number.isFinite(row.db_id)) {
        m.set(row.db_id, row.label || `Activity #${row.db_id}`);
      }
    }
    return m;
  }, [flatGanttTasks]);

  const DELAY_LOGS_PAGE_SIZE = 3;
  const [delayLogsPage, setDelayLogsPage] = useState(0);
  const delayLogsTotalPages = Math.max(1, Math.ceil(apiDelayLogs.length / DELAY_LOGS_PAGE_SIZE));
  useEffect(() => {
    setDelayLogsPage(0);
  }, [ganttProjectId, apiDelayLogs.length]);
  const pagedDelayLogs = useMemo(() => {
    const start = delayLogsPage * DELAY_LOGS_PAGE_SIZE;
    return apiDelayLogs.slice(start, start + DELAY_LOGS_PAGE_SIZE);
  }, [apiDelayLogs, delayLogsPage]);

  // Calculate overall project progress considering delays
  const overallProgress = useMemo(() => {
    if (adjustedSubProjects.length === 0) return { actual: 0, planned: 0, impact: 0 };

    // Weighted average of all sub-projects
    const totalWeight = adjustedSubProjects.reduce((sum, sp) => sum + sp.weight, 0);
    if (totalWeight === 0) return { actual: 0, planned: 0, impact: 0 };

    const weightedActual = adjustedSubProjects.reduce((sum, sp) =>
      sum + (sp.actualProgress * sp.weight), 0) / totalWeight;
    const weightedPlanned = adjustedSubProjects.reduce((sum, sp) =>
      sum + (sp.plannedProgress * sp.weight), 0) / totalWeight;
    return {
      actual: Math.round(weightedActual),
      planned: Math.round(weightedPlanned),
      impact: 0,
    };
  }, [adjustedSubProjects]);

  const ganttTasks = useMemo(() => buildGanttTasks(adjustedSubProjects, months), [adjustedSubProjects, months]);

  const handleAddDelayLog = (_log) => {};
  const handleDeleteDelayLog = (_logId) => {};

  const openAddPhotoFromGantt = (taskId, taskName) => {
    setSelectedTaskForMedia({ taskId, taskName });
    setPhotoDialogForm(null);
    setAddPhotoDialogOpen(true);
  };
  const openAddDocumentFromGantt = (taskId, taskName, activityDbId) => {
    if (!Number.isFinite(activityDbId)) {
      toast({
        title: "Cannot attach document",
        description: "Missing activity id. Open the project from the schedule and try again.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTaskForMedia({ taskId, taskName, activityDbId });
    setDocumentTitle("");
    setAddDocumentDialogOpen(true);
  };
  const closePhotoDialog = () => {
    if (photoDialogForm) URL.revokeObjectURL(photoDialogForm.objectUrl);
    setPhotoDialogForm(null);
    setAddPhotoDialogOpen(false);
    setSelectedTaskForMedia(null);
  };
  const closeDocumentDialog = () => {
    setAddDocumentDialogOpen(false);
    setSelectedTaskForMedia(null);
    setDocumentTitle("");
    setDocumentUploading(false);
  };

  const wbsPieData = useMemo(
    () =>
      subProjects.map((s) => ({
        name: s.name,
        value: Math.max(0, s.weight),
      })),
    [subProjects]
  );

  // If there is no WBS/timeline, render nothing (avoid showing an empty banner on pages).
  if (subProjects.length === 0 || timeline.length === 0) return null;

  return (
    React.createElement(Card, { className: "border-2 border-primary/10" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2264}}
      , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2265}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2266}}
          , React.createElement(CardTitle, { className: isMobile ? 'text-base' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 2267}}, milestoneTitle, " — Milestone KPIs"   )

        )
      )
      , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2271}}
        , showAllTabs ? (
          React.createElement(React.Fragment, null
            /* Show all charts side by side */
            , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2275}}
              /* Gantt Chart */
              , React.createElement('div', { className: "lg:col-span-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2277}}
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2278}}, "Gantt Chart" )
                , React.createElement(GanttMini, {
                  tasks: ganttTasks,
                  months: months,
                  baseColor: phaseColor,
                  subProjects: adjustedSubProjects,
                  delayLogs: delayLogs,
                  onAddDelayLog: handleAddDelayLog,
                  onDeleteDelayLog: handleDeleteDelayLog,
                  onOpenAddPhoto: openAddPhotoFromGantt, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2279}}
                )
                /* Overall Progress Summary with Delay Impact - beneath Gantt chart */
                /* Delay Logs removed (were hardcoded) */
              )

              /* WBS Breakdown */
              , React.createElement('div', { className: "lg:col-span-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2294}}
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2295}}, "WBS Breakdown" )
                , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2296}}
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2297}}
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2298}}, "WBS Weight Distribution"  )
                    , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2299}}
                      , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2300}}
                        , React.createElement(PieChart, { margin: { top: isMobile ? 18 : 8, right: 0, bottom: 8, left: 0 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2301}}
                          , React.createElement(Pie, {
                            data: wbsPieData,
                            dataKey: "value",
                            nameKey: "name",
                            cx: "50%",
                            cy: isMobile ? "46%" : "50%",
                            outerRadius: isMobile ? 82 : isTablet ? 90 : 110,
                            labelLine: false,
                            label: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2302}}

                            , wbsPieData.map((_, idx) => (
                              React.createElement(Cell, {
                                key: idx,
                                fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2313}}
                              )
                            ))
                          )
                          , React.createElement(Tooltip, {
                            formatter: (v) => [`${(v * 100).toFixed(1)}%`, "Weight"],
                            contentStyle: {
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: isMobile ? '10px' : '12px',
                              padding: isMobile ? '4px 6px' : '8px 12px'
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2319}}
                          )
                          , !isMobile && (
                            React.createElement(Legend, {
                              wrapperStyle: {
                                fontSize: isTablet ? '11px' : '12px'
                              },
                              iconSize: isTablet ? 11 : 12,
                              layout: "horizontal",
                              verticalAlign: "top", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2330}}
                            )
                          )
                        )
                      )
                    )
                    /* Mobile: render activity names as wrapped rows below the pie (avoid slice labels + avoid clipping) */
                    , isMobile && (
                      React.createElement('div', { className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-muted-foreground"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2344}}
                        , wbsPieData.map((it, idx) => (
                          React.createElement('div', { key: it.name, className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2346}}
                            , React.createElement('span', {
                              className: "inline-block h-2.5 w-2.5 rounded-full"   ,
                              style: {
                                backgroundColor: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`,
                              },
                              'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2347}}
                            )
                            , React.createElement('span', { className: "text-foreground/90", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2354}}
                              , it.name
                            )
                            , React.createElement('span', { className: "tabular-nums", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2357}}
                              , (it.value * 100).toFixed(0), "%"
                            )
                          )
                        ))
                      )
                    )
                  )
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2365}}
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2366}}, "WBS Subprocess KPIs"  )
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2367}}
                      , adjustedSubProjects.map((s) => {
                        const variance = s.actualProgress - s.plannedProgress;
                        return (
                          React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2371}}
                            , React.createElement('div', { className: "min-w-0 flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2372}}
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2373}}, s.name)
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2374}}, "Weight " , (s.weight * 100).toFixed(0), "%")
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2376}}
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2377}}, "Actual / Planned"  )
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2378}}
                                , s.actualProgress.toFixed(1), "% / "  , s.plannedProgress.toFixed(1), "%"
                              )
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2381}}
                                , variance >= 0 ? "+" : ""
                                , variance.toFixed(1), "%"
                              )
                            )
                          )
                        );
                      })
                    )
                  )
                )
              )
            )
          )
        ) : (
          React.createElement(Tabs, { value: tab, onValueChange: (v) => setTab(v ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2396}}
            , React.createElement(TabsList, { className: `w-full ${isMobile ? 'flex items-center gap-1 overflow-x-auto whitespace-nowrap p-1' : 'flex flex-wrap justify-start gap-1'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2397}}
              , React.createElement(TabsTrigger, { value: "gantt", className: isMobile ? 'text-xs shrink-0 px-3' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 2398}}, "Gantt")
              , React.createElement(TabsTrigger, { value: "wbs", className: isMobile ? 'text-xs shrink-0 px-3' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 2399}}, "WBS Breakdown" )
              , React.createElement(TabsTrigger, { value: "photos", className: isMobile ? 'text-xs shrink-0 px-3' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 2400}}, "Photos & Docs"  )
              , React.createElement(TabsTrigger, { value: "logs", className: isMobile ? 'text-xs shrink-0 px-3' : '', __self: this, __source: {fileName: _jsxFileName, lineNumber: 2401}}, "Delay Logs"

              )
            )

            , React.createElement(TabsContent, { value: "gantt", className: "mt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2406}}
              , flatGanttTasks && flatGanttTasks.length > 0 ? (
                React.createElement(ProjectGanttTree, {
                  tasks: flatGanttTasks ,
                  projectName: milestoneTitle,
                  projectId: ganttProjectId,
                  onOpenAddDocument: openAddDocumentFromGantt,
                  onDelayLogSaved: onProjectGanttRefresh,
                  onProgressSaved: onProjectGanttRefresh, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2408}}
                )
              ) : (
                React.createElement(React.Fragment, null
                  , React.createElement(GanttMini, {
                    tasks: ganttTasks,
                    months: months,
                    baseColor: phaseColor,
                    subProjects: adjustedSubProjects,
                    delayLogs: delayLogs,
                    onAddDelayLog: handleAddDelayLog,
                    onDeleteDelayLog: handleDeleteDelayLog,
                    onOpenAddPhoto: openAddPhotoFromGantt, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2418}}
                  )
                  /* Delay Logs removed (were hardcoded) */
                )
              )
            )

            , React.createElement(TabsContent, { value: "wbs", className: "mt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2433}}
              , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2434}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2435}}
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2436}}, "WBS Weight Distribution"  )
                  , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2437}}
                    , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2438}}
                      , React.createElement(PieChart, { margin: { top: isMobile ? 18 : 8, right: 0, bottom: 8, left: 0 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2439}}
                        , React.createElement(Pie, {
                          data: wbsPieData,
                          dataKey: "value",
                          nameKey: "name",
                          cx: "50%",
                          cy: isMobile ? "46%" : "50%",
                          outerRadius: isMobile ? 82 : isTablet ? 90 : 110,
                          labelLine: false,
                          label: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2440}}

                          , wbsPieData.map((_, idx) => (
                            React.createElement(Cell, {
                              key: idx,
                              fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2451}}
                            )
                          ))
                        )
                        , React.createElement(Tooltip, {
                          formatter: (v) => [`${(v * 100).toFixed(1)}%`, "Weight"],
                          contentStyle: {
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: isMobile ? '10px' : '12px',
                            padding: isMobile ? '4px 6px' : '8px 12px'
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2457}}
                        )
                        , !isMobile && (
                          React.createElement(Legend, {
                            wrapperStyle: {
                              fontSize: isTablet ? '11px' : '12px'
                            },
                            iconSize: isTablet ? 11 : 12,
                            layout: "horizontal",
                            verticalAlign: "top", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2468}}
                          )
                        )
                      )
                    )
                  )
                  /* Mobile: render activity names as wrapped rows below the pie (avoid slice labels + avoid clipping) */
                  , isMobile && (
                    React.createElement('div', { className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-muted-foreground"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2482}}
                      , wbsPieData.map((it, idx) => (
                        React.createElement('div', { key: it.name, className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2484}}
                          , React.createElement('span', {
                            className: "inline-block h-2.5 w-2.5 rounded-full"   ,
                            style: {
                              backgroundColor: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`,
                            },
                            'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2485}}
                          )
                          , React.createElement('span', { className: "text-foreground/90", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2492}}
                            , it.name
                          )
                          , React.createElement('span', { className: "tabular-nums", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2495}}
                            , (it.value * 100).toFixed(0), "%"
                          )
                        )
                      ))
                    )
                  )
                )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2503}}
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2504}}, "WBS Subprocess KPIs"  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2505}}
                    , subProjects.map((s) => {
                      const variance = s.actualProgress - s.plannedProgress;
                      return (
                        React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2509}}
                          , React.createElement('div', { className: "min-w-0 flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2510}}
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2511}}, s.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2512}}, "Weight " , (s.weight * 100).toFixed(0), "%")
                          )
                          , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2514}}
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2515}}, "Actual / Planned"  )
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2516}}
                              , s.actualProgress.toFixed(1), "% / "  , s.plannedProgress.toFixed(1), "%"
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2519}}
                              , variance >= 0 ? "+" : ""
                              , variance.toFixed(1), "%"
                            )
                          )
                        )
                      );
                    })
                  )
                )
              )
            )

            , React.createElement(TabsContent, { value: "photos", className: "mt-4 space-y-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2532}}
              /* Progress Photos — display only; upload via Gantt activity options (⋮) */
              , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2534}}
                , React.createElement('h3', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2535}}, "Progress Photos" )
                , apiProgressImagesLoading ? (
                  React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2537}}
                    , React.createElement(Skeleton, { className: "h-56 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2538}} )
                    , React.createElement(Skeleton, { className: "h-56 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2539}} )
                    , React.createElement(Skeleton, { className: "h-56 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2540}} )
                  )
                ) : apiProgressImages.length === 0 ? (
                  React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2543}}, "No photos yet. Use the options menu (⋮) on an activity in the Gantt chart to add a photo."

                  )
                ) : (
                  React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2547}}
                    , [...apiProgressImages]
                      .sort((a, b) => String(b.uploaded_at).localeCompare(String(a.uploaded_at)))
                      .map((item) => {
                        const src = _optionalChain([item, 'access', _42 => _42.image, 'optionalAccess', _43 => _43.startsWith, 'call', _44 => _44("http")]) ? item.image : mediaUrl(item.image || "");
                        const uploaded = new Date(item.uploaded_at);
                        const uploadedLabel = Number.isFinite(uploaded.getTime())
                          ? uploaded.toLocaleString()
                          : String(item.uploaded_at);
                        return (
                          React.createElement(Card, { key: item.id, className: "overflow-hidden border border-border/60"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2557}}
                            , React.createElement('div', { className: "h-40 sm:h-44 relative bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2558}}
                              , React.createElement('img', {
                                src: src,
                                alt: item.caption || item.image_date,
                                className: "w-full h-full object-cover"  ,
                                loading: "lazy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2559}}
                              )
                              , React.createElement('div', { className: "absolute top-1 right-1 flex gap-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2565}}
                                , React.createElement(Button, {
                                  type: "button",
                                  size: "icon",
                                  variant: "secondary",
                                  className: "h-7 w-7" ,
                                  onClick: () => window.open(src, "_blank"),
                                  title: "Open", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2566}}

                                  , React.createElement(ImageIcon, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2574}} )
                                )
                                , React.createElement(Button, {
                                  type: "button",
                                  size: "icon",
                                  variant: "secondary",
                                  className: "h-7 w-7" ,
                                  onClick: () => {
                                    const a = document.createElement("a");
                                    a.href = src;
                                    a.download = `progress-${item.image_date || item.id}.png`;
                                    a.click();
                                  },
                                  title: "Download", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2576}}

                                  , React.createElement(Download, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2589}} )
                                )
                              )
                            )
                            , React.createElement(CardContent, { className: "p-3 space-y-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2593}}
                              , React.createElement('div', { className: "text-sm font-semibold leading-snug line-clamp-2"   , title: _nullishCoalesce(item.caption, () => ( "")), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2594}}
                                , item.caption || "—"
                              )
                              , React.createElement('div', { className: "flex flex-wrap gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2597}}
                                , React.createElement(Button, {
                                  type: "button",
                                  size: "sm",
                                  variant: "default",
                                  className: "h-7 px-2.5 text-[11px] rounded-full bg-emerald-700 text-white hover:bg-emerald-700/90"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2598}}

                                  , item.image_date
                                )
                                , React.createElement(Button, {
                                  type: "button",
                                  size: "sm",
                                  variant: "outline",
                                  className: "h-7 px-2.5 text-[11px] rounded-full border-emerald-200 text-emerald-800 hover:text-emerald-900"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2606}}
, "Activity #"
                                   , item.activity
                                )
                                , React.createElement(Button, {
                                  type: "button",
                                  size: "sm",
                                  variant: "outline",
                                  className: "h-7 px-2.5 text-[11px] rounded-full border-emerald-200 text-emerald-700 hover:text-emerald-800"      ,
                                  title: "Update this image"  ,
                                  onClick: () => {
                                    const currentSrc = _optionalChain([item, 'access', _45 => _45.image, 'optionalAccess', _46 => _46.startsWith, 'call', _47 => _47("http")]) ? item.image : mediaUrl(item.image || "");
                                    setUpdateImageForm({
                                      id: item.id,
                                      project: item.project,
                                      activity: item.activity,
                                      image_date: item.image_date,
                                      caption: _nullishCoalesce(item.caption, () => ( "")),
                                      currentImageUrl: currentSrc,
                                      newImageFile: null,
                                      previewUrl: null,
                                    });
                                    setUpdateImageOpen(true);
                                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2614}}
, "Update"

                                )
                              )
                            )
                          )
                        );
                      })
                  )
                )
              )

              /* Documents — GET list-project-document (by project; each row shows activity id / Gantt label) */
              , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2647}}
                , React.createElement('h3', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2648}}, "Documents")
                , apiProjectDocumentsLoading ? (
                  React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2650}}
                    , React.createElement(Skeleton, { className: "h-10 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2651}} )
                    , React.createElement(Skeleton, { className: "h-10 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2652}} )
                  )
                ) : apiProjectDocuments.length === 0 ? (
                  React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2655}}, "No documents yet. Use the options menu (⋮) on an activity in the Gantt chart to upload a file."

                  )
                ) : (
                  React.createElement('div', { className: "rounded-lg border border-border/60 divide-y divide-border/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2659}}
                    , [...apiProjectDocuments]
                      .sort((a, b) => String(_nullishCoalesce(b.uploaded_at, () => ( ""))).localeCompare(String(_nullishCoalesce(a.uploaded_at, () => ( "")))))
                      .map((item) => {
                        const aid = item.activity;
                        const activityLabel =
                          aid != null && activityLabelByDbId.has(aid)
                            ? activityLabelByDbId.get(aid)
                            : aid != null
                              ? `Activity #${aid}`
                              : "—";
                        const href =
                          item.file_url && String(item.file_url).startsWith("http")
                            ? item.file_url
                            : item.file
                              ? mediaUrl(item.file)
                              : "";
                        return (
                          React.createElement('div', { key: item.id, className: "flex flex-col gap-1 px-3 py-2.5 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-3"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2677}}
                            , React.createElement('div', { className: "flex items-start gap-2 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2678}}
                              , React.createElement(FileText, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2679}} )
                              , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2680}}
                                , React.createElement('div', { className: "text-sm font-medium truncate"  , title: _nullishCoalesce(item.title, () => ( undefined)), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2681}}
                                  , item.title || "—"
                                )
                                , React.createElement('div', { className: "text-[11px] text-muted-foreground truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2684}}
                                  , activityLabel
                                  , item.uploaded_at
                                    ? ` · ${new Date(item.uploaded_at).toLocaleString()}`
                                    : ""
                                )
                              )
                            )
                            , React.createElement('div', { className: "flex items-center gap-1 shrink-0 pl-6 sm:pl-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2692}}
                              , href ? (
                                React.createElement(Button, { type: "button", size: "sm", variant: "ghost", className: "h-8 gap-1" , asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2694}}
                                  , React.createElement('a', { href: href, target: "_blank", rel: "noreferrer", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2695}}
                                    , React.createElement(Download, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2696}} ), " Open"
                                  )
                                )
                              ) : null
                              , React.createElement(Button, {
                                type: "button",
                                size: "sm",
                                variant: "outline",
                                className: "h-8",
                                onClick: () => {
                                  setUpdateDocForm({
                                    id: item.id,
                                    project: item.project,
                                    activity: _nullishCoalesce(item.activity, () => ( null)),
                                    title: _nullishCoalesce(item.title, () => ( "")),
                                    currentUrl: href,
                                    newFile: null,
                                  });
                                  setUpdateDocOpen(true);
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2700}}
, "Update"

                              )
                            )
                          )
                        );
                      })
                  )
                )
              )
            )

            , React.createElement(TabsContent, { value: "logs", className: "mt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2728}}
              , apiDelayLogsLoading ? (
                React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2730}}
                  , React.createElement(Skeleton, { className: "h-5 w-56" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2731}} )
                  , React.createElement(Skeleton, { className: "h-24 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2732}} )
                  , React.createElement(Skeleton, { className: "h-24 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2733}} )
                )
              ) : apiDelayLogs.length === 0 ? (
                React.createElement('div', { className: "text-center py-12 text-muted-foreground border border-border rounded-lg"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2736}}
                  , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2737}} )
                  , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2738}}, "No delay logs recorded yet"    )
                  , React.createElement('p', { className: "text-xs mt-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2739}}, "Delay logs will appear here when you log delays in the Gantt chart."            )
                )
              ) : (
                React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2742}}
                  , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2743}}
                    , React.createElement('div', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2744}}
                      , apiDelayLogs.length, " delay log"  , apiDelayLogs.length !== 1 ? "s" : "", " recorded"
                    )
                    , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2747}}
                      , React.createElement(Button, {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "h-8",
                        onClick: () => setDelayLogsPage((p) => Math.max(0, p - 1)),
                        disabled: delayLogsPage <= 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2748}}
, "Prev"

                      )
                      , React.createElement('div', { className: "text-xs text-muted-foreground tabular-nums min-w-[84px] text-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2758}}, "Page "
                         , delayLogsPage + 1, " / "  , delayLogsTotalPages
                      )
                      , React.createElement(Button, {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "h-8",
                        onClick: () => setDelayLogsPage((p) => Math.min(delayLogsTotalPages - 1, p + 1)),
                        disabled: delayLogsPage >= delayLogsTotalPages - 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2761}}
, "Next"

                      )
                    )
                  )

                  , React.createElement('div', { className: "grid gap-4 grid-cols-1 md:grid-cols-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2774}}
                    , pagedDelayLogs.map((log) => {
                      const created = new Date(log.created_at);
                      const createdLabel = Number.isFinite(created.getTime())
                        ? created.toLocaleString()
                        : String(log.created_at);
                      const actionByLabel = log.action_by_info
                        ? `${log.action_by_info.stakeholder_title} (${log.action_by_info.stakeholder_type})`
                        : log.action_by != null
                          ? `#${log.action_by}`
                          : "—";
                      const severity =
                        log.delay_days >= 10 ? "high" : log.delay_days >= 5 ? "medium" : "low";
                      const severityStyles =
                        severity === "high"
                          ? {
                              accent: "bg-rose-600",
                              badge: "bg-rose-600 hover:bg-rose-600 text-white",
                              icon: "text-rose-600",
                            }
                          : severity === "medium"
                            ? {
                                accent: "bg-amber-500",
                                badge: "bg-amber-500 hover:bg-amber-500 text-white",
                                icon: "text-amber-600",
                              }
                            : {
                                accent: "bg-slate-400",
                                badge: "bg-slate-700 hover:bg-slate-700 text-white",
                                icon: "text-slate-600",
                              };

                      return (
                        React.createElement(Card, {
                          key: log.id,
                          className: "overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2807}}

                          , React.createElement(CardContent, { className: "p-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2811}}
                            , React.createElement('div', { className: "flex", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2812}}
                              , React.createElement('div', { className: `w-1.5 ${severityStyles.accent}`, 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2813}} )
                              , React.createElement('div', { className: "flex-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2814}}
                                , React.createElement('div', { className: "p-4 border-b border-border/60 bg-muted/15"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2815}}
                                  , React.createElement('div', { className: "flex items-start justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2816}}
                                    , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2817}}
                                      , React.createElement('div', { className: "flex items-center gap-2 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2818}}
                                        , React.createElement(AlertTriangle, { className: `h-4 w-4 ${severityStyles.icon} shrink-0`, 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2819}} )
                                        , React.createElement('div', { className: "text-sm font-semibold truncate"  , title: `Activity #${log.activity}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2820}}, "Activity #"
                                           , log.activity
                                        )
                                      )
                                      , React.createElement('div', { className: "mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2824}}
                                        , React.createElement(Calendar, { className: "h-3.5 w-3.5" , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2825}} )
                                        , createdLabel
                                      )
                                    )
                                    , React.createElement('div', { className: "flex items-center gap-2 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2829}}
                                      , React.createElement(Button, {
                                        type: "button",
                                        size: "sm",
                                        variant: "outline",
                                        className: "h-8",
                                        onClick: () => {
                                          setUpdateDelayForm({
                                            id: log.id,
                                            project: log.project,
                                            activity: log.activity,
                                            delay_start_date: log.delay_start_date,
                                            delay_end_date: log.delay_end_date,
                                            category: _nullishCoalesce(log.category, () => ( "")),
                                            issue: _nullishCoalesce(log.issue, () => ( "")),
                                            recommended_action: _nullishCoalesce(log.recommended_action, () => ( "")),
                                          });
                                          setUpdateDelayOpen(true);
                                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2830}}
, "Update"

                                      )
                                      , React.createElement(Badge, { className: `shrink-0 ${severityStyles.badge}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2851}}
                                        , log.delay_days, " day" , log.delay_days !== 1 ? "s" : "", " delay"
                                      )
                                    )
                                  )
                                )
                              )
                            )

                            , React.createElement('div', { className: "p-4 space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2860}}
                              , React.createElement('div', { className: "grid grid-cols-2 gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2861}}
                                , React.createElement('div', { className: "rounded-lg border border-border/60 bg-background p-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2862}}
                                  , React.createElement('div', { className: "flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2863}}
                                    , React.createElement(CalendarRange, { className: "h-3.5 w-3.5" , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2864}} ), "Start"

                                  )
                                  , React.createElement('div', { className: "text-xs font-medium mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2867}}, log.delay_start_date)
                                )
                                , React.createElement('div', { className: "rounded-lg border border-border/60 bg-background p-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2869}}
                                  , React.createElement('div', { className: "flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2870}}
                                    , React.createElement(CalendarRange, { className: "h-3.5 w-3.5" , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2871}} ), "End"

                                  )
                                  , React.createElement('div', { className: "text-xs font-medium mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2874}}, log.delay_end_date)
                                )
                              )

                              , React.createElement('div', { className: "flex flex-wrap gap-2 text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2878}}
                                , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2879}}
                                  , React.createElement(Tag, { className: "h-3.5 w-3.5 text-muted-foreground"  , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2880}} )
                                  , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2881}}, "Category")
                                  , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2882}}, _nullishCoalesce(log.category, () => ( "—")))
                                )
                                , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2884}}
                                  , React.createElement(User, { className: "h-3.5 w-3.5 text-muted-foreground"  , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2885}} )
                                  , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2886}}, "Originator")
                                  , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2887}}, _nullishCoalesce(log.originator, () => ( "—")))
                                )
                                , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2889}}
                                  , React.createElement(Building2, { className: "h-3.5 w-3.5 text-muted-foreground"  , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2890}} )
                                  , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2891}}, "Action by" )
                                  , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2892}}, actionByLabel)
                                )
                              )

                              , React.createElement('div', { className: "grid gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2896}}
                                , React.createElement('div', { className: "rounded-lg border border-border/60 bg-background p-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2897}}
                                  , React.createElement('div', { className: "flex items-center justify-between gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2898}}
                                    , React.createElement('div', { className: "text-[10px] font-semibold text-muted-foreground uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2899}}, "Issue")
                                  )
                                  , React.createElement('div', { className: "text-xs text-foreground/90 whitespace-pre-wrap mt-1 leading-relaxed"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2901}}
                                    , _nullishCoalesce(log.issue, () => ( "—"))
                                  )
                                )
                                , React.createElement('div', { className: "rounded-lg border border-border/60 bg-background p-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2905}}
                                  , React.createElement('div', { className: "text-[10px] font-semibold text-muted-foreground uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2906}}, "Recommended action" )
                                  , React.createElement('div', { className: "text-xs text-foreground/90 whitespace-pre-wrap mt-1 leading-relaxed"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2907}}
                                    , _nullishCoalesce(log.recommended_action, () => ( "—"))
                                  )
                                )
                              )
                            )
                          )
                        )
                      );
                    })
                  )
                )
              )
            )
          )
        )
      )

      /* Add Photo dialog (opened from Gantt activity options) */
      , React.createElement(Dialog, { open: addPhotoDialogOpen, onOpenChange: (open) => { if (!open) closePhotoDialog(); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2926}}
        , React.createElement(DialogContent, { className: "sm:max-w-md", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2927}}
          , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2928}}
            , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2929}}, "Add Photo" )
            , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2930}}
              , selectedTaskForMedia ? `Add a progress photo for: ${selectedTaskForMedia.taskName}` : "Add a progress photo. Set the progress date for the timeline."
            )
          )
          , React.createElement('input', {
            ref: photoDialogInputRef,
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: (e) => {
              const file = _optionalChain([e, 'access', _48 => _48.target, 'access', _49 => _49.files, 'optionalAccess', _50 => _50[0]]);
              if (file) setPhotoDialogForm({ file, objectUrl: URL.createObjectURL(file), date: new Date().toISOString().slice(0, 10), caption: "" });
              e.target.value = "";
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2934}}
          )
          , photoDialogForm ? (
            React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2946}}
              , React.createElement('div', { className: "flex gap-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2947}}
                , React.createElement('div', { className: "shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted border"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2948}}
                  , React.createElement('img', { src: photoDialogForm.objectUrl, alt: "Preview", className: "w-full h-full object-cover"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2949}} )
                )
                , React.createElement('div', { className: "flex-1 space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2951}}
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2952}}
                    , React.createElement(Label, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2953}}, "Progress date (timeline)"  )
                    , React.createElement(Input, {
                      type: "date",
                      value: photoDialogForm.date,
                      onChange: (e) => setPhotoDialogForm((p) => (p ? { ...p, date: e.target.value } : null)),
                      className: "mt-1 h-9" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2954}}
                    )
                  )
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2961}}
                    , React.createElement(Label, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2962}}, "Caption (optional)" )
                    , React.createElement(Input, {
                      placeholder: "e.g. Site visit"  ,
                      value: photoDialogForm.caption,
                      onChange: (e) => setPhotoDialogForm((p) => (p ? { ...p, caption: e.target.value } : null)),
                      className: "mt-1 h-9" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2963}}
                    )
                  )
                )
              )
              , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2972}}
                , React.createElement(Button, { type: "button", variant: "ghost", onClick: closePhotoDialog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2973}}, "Cancel")
                , React.createElement(Button, { type: "button", onClick: closePhotoDialog, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2974}}, "Close")
              )
            )
          ) : (
            React.createElement('div', { className: "py-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2978}}
              , React.createElement(Button, { type: "button", variant: "outline", className: "w-full gap-2" , onClick: () => _optionalChain([photoDialogInputRef, 'access', _51 => _51.current, 'optionalAccess', _52 => _52.click, 'call', _53 => _53()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2979}}
                , React.createElement(Upload, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2980}} ), " Choose image"
              )
            )
          )
        )
      )

      /* Add Documents dialog (opened from Gantt activity options) — POST create-project-document */
      , React.createElement(Dialog, { open: addDocumentDialogOpen, onOpenChange: (open) => { if (!open) closeDocumentDialog(); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2988}}
        , React.createElement(DialogContent, { className: "sm:max-w-md", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2989}}
          , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2990}}
            , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2991}}, "Add document" )
            , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2992}}
              , selectedTaskForMedia
                ? `Attach a file to: ${selectedTaskForMedia.taskName}`
                : "Upload a project document."
            )
          )
          , React.createElement('input', {
            ref: docDialogInputRef,
            type: "file",
            accept: ".pdf,.doc,.docx,.xlsx",
            className: "hidden",
            onChange: async (e) => {
              const file = _optionalChain([e, 'access', _54 => _54.target, 'access', _55 => _55.files, 'optionalAccess', _56 => _56[0]]);
              e.target.value = "";
              if (!file) return;
              const aid = _optionalChain([selectedTaskForMedia, 'optionalAccess', _57 => _57.activityDbId]);
              if (ganttProjectId == null || aid == null || !Number.isFinite(aid)) {
                toast({
                  title: "Cannot upload",
                  description: "Missing project or activity context.",
                  variant: "destructive",
                });
                return;
              }
              const title =
                documentTitle.trim() ||
                (file.name.includes(".") ? file.name.replace(/\.[^.]+$/, "") : file.name) ||
                file.name;
              try {
                setDocumentUploading(true);
                await createProjectDocument({
                  project: ganttProjectId,
                  activity: aid,
                  file,
                  title,
                });
                toast({ title: "Document uploaded", description: "The file was saved for this activity." });
                await queryClient.invalidateQueries({ queryKey: ["project-documents", ganttProjectId] });
                closeDocumentDialog();
              } catch (err) {
                toast({
                  title: "Upload failed",
                  description: err instanceof Error ? err.message : "Please try again.",
                  variant: "destructive",
                });
              } finally {
                setDocumentUploading(false);
              }
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2998}}
          )
          , React.createElement('div', { className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3042}}
            , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3043}}
              , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3044}}, "Title")
              , React.createElement(Input, {
                placeholder: "e.g. Site handover checklist"   ,
                value: documentTitle,
                onChange: (e) => setDocumentTitle(e.target.value),
                disabled: documentUploading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3045}}
              )
            )
            , React.createElement(Button, {
              type: "button",
              variant: "outline",
              className: "w-full gap-2" ,
              disabled: documentUploading,
              onClick: () => _optionalChain([docDialogInputRef, 'access', _58 => _58.current, 'optionalAccess', _59 => _59.click, 'call', _60 => _60()]), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3052}}

              , React.createElement(Upload, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3059}} ), " " , documentUploading ? "Uploading…" : "Choose file & upload"
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3061}}, "Allowed types: PDF, Word (.doc/.docx), Excel (.xlsx). The server saves the file against this activity."

            )
          )
        )
      )

      /* Update Progress Image dialog (from Photos & Docs grid) */
      , React.createElement(Dialog, { open: updateImageOpen, onOpenChange: (open) => { if (!open) closeUpdateImageDialog(); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3069}}
        , React.createElement(DialogContent, { className: "w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3070}}
          , React.createElement(DialogHeader, { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3071}}
            , React.createElement(DialogTitle, { className: "text-xl font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3072}}, "Update Progress Image"  )
            , React.createElement(DialogDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3073}}, "Update caption/date/activity or replace the image file."

            )
          )

          , updateImageForm ? (
            React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3079}}
              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3080}}
                , React.createElement('div', { className: "space-y-1.5 sm:col-span-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3081}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3082}}, "Project")
                  , React.createElement(Input, { value: String(updateImageForm.project), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3083}} )
                )
                , React.createElement('div', { className: "space-y-1.5 sm:col-span-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3085}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3086}}, "Activity")
                  , React.createElement(Input, {
                    type: "number",
                    value: String(updateImageForm.activity),
                    onChange: (e) =>
                      setUpdateImageForm((p) => (p ? { ...p, activity: Number(e.target.value || 0) } : p))
                    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3087}}
                  )
                )
                , React.createElement('div', { className: "space-y-1.5 sm:col-span-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3095}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3096}}, "Image date" )
                  , React.createElement(Input, {
                    type: "date",
                    value: updateImageForm.image_date,
                    onChange: (e) => setUpdateImageForm((p) => (p ? { ...p, image_date: e.target.value } : p)), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3097}}
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3105}}
                , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3106}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3107}}, "Image")
                  , updateImageForm.newImageFile ? (
                    React.createElement(Button, {
                      type: "button",
                      size: "sm",
                      variant: "outline",
                      className: "h-8",
                      onClick: () => {
                        setUpdateImageForm((p) => {
                          if (!p) return p;
                          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
                          return { ...p, newImageFile: null, previewUrl: null };
                        });
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3109}}
, "Remove selected"

                    )
                  ) : (
                    React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3125}}, "Optional: replace file"  )
                  )
                )

                , React.createElement('div', { className: "grid gap-4 lg:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3129}}
                  , React.createElement('div', { className: "rounded-xl border border-border/60 overflow-hidden bg-muted/30"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3130}}
                    , React.createElement('div', { className: "px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50 bg-background/50 flex items-center justify-between"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3131}}
                      , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3132}}, updateImageForm.newImageFile ? "New preview" : "Current image")
                      , React.createElement('span', { className: "text-[11px] font-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3133}}, "ID #" , updateImageForm.id)
                    )
                    , React.createElement('div', { className: "p-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3135}}
                      , React.createElement('div', { className: "rounded-lg overflow-hidden bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3136}}
                        , React.createElement('img', {
                          src: updateImageForm.previewUrl || updateImageForm.currentImageUrl,
                          alt: "Preview",
                          className: "w-full h-56 object-cover"  ,
                          loading: "lazy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3137}}
                        )
                      )
                    )
                  )

                  , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3147}}
                    , React.createElement('input', {
                      id: "update-progress-image-file",
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: (e) => {
                        const file = _nullishCoalesce(_optionalChain([e, 'access', _61 => _61.target, 'access', _62 => _62.files, 'optionalAccess', _63 => _63[0]]), () => ( null));
                        setUpdateImageForm((p) => {
                          if (!p) return p;
                          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
                          return {
                            ...p,
                            newImageFile: file,
                            previewUrl: file ? URL.createObjectURL(file) : null,
                          };
                        });
                        e.target.value = "";
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3148}}
                    )

                    , React.createElement('div', {
                      className: `rounded-xl border-2 border-dashed p-5 transition-colors ${
                        updateImageForm.newImageFile
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/60 bg-muted/10 cursor-pointer"
                      }`,
                      role: "button",
                      tabIndex: 0,
                      onClick: () => _optionalChain([document, 'access', _64 => _64.getElementById, 'call', _65 => _65("update-progress-image-file"), 'optionalAccess', _66 => _66.click, 'call', _67 => _67()]),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          _optionalChain([document, 'access', _68 => _68.getElementById, 'call', _69 => _69("update-progress-image-file"), 'optionalAccess', _70 => _70.click, 'call', _71 => _71()]);
                        }
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3168}}

                      , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3184}}
                        , React.createElement('div', { className: "shrink-0 rounded-lg bg-background p-2 border border-border/60"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3185}}
                          , React.createElement(Upload, { className: "h-5 w-5 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3186}} )
                        )
                        , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3188}}
                          , React.createElement('div', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3189}}
                            , updateImageForm.newImageFile ? "Selected file" : "Click to choose a new image"
                          )
                          , React.createElement('div', { className: "text-xs text-muted-foreground mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3192}}
                            , updateImageForm.newImageFile ? updateImageForm.newImageFile.name : "PNG, JPG, JPEG"
                          )
                        )
                      )
                      , React.createElement('div', { className: "mt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3197}}
                        , React.createElement(Button, { type: "button", variant: "outline", size: "sm", className: "h-9 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3198}}
                          , updateImageForm.newImageFile ? "Change file" : "Choose file"
                        )
                      )
                    )

                    , React.createElement('div', { className: "rounded-xl border border-border/60 p-4 bg-background/40"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3204}}
                      , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3205}}, "Caption")
                      , React.createElement(Textarea, {
                        className: "mt-2",
                        value: updateImageForm.caption,
                        onChange: (e) => setUpdateImageForm((p) => (p ? { ...p, caption: e.target.value } : p)),
                        rows: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3206}}
                      )
                    )
                  )
                )
              )

              , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3217}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: closeUpdateImageDialog, disabled: updatingImage, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3218}}, "Cancel"

                )
                , React.createElement(Button, {
                  type: "button",
                  disabled: updatingImage || !updateImageForm.image_date || !updateImageForm.project || !updateImageForm.activity,
                  onClick: async () => {
                    if (!updateImageForm) return;
                    try {
                      setUpdatingImage(true);
                      await updateProgressImage(updateImageForm.id, {
                        project: updateImageForm.project,
                        activity: updateImageForm.activity,
                        image_date: updateImageForm.image_date,
                        caption: updateImageForm.caption,
                        image: updateImageForm.newImageFile,
                      });
                      await queryClient.invalidateQueries({ queryKey: ["progress-images", ganttProjectId] });
                      closeUpdateImageDialog();
                    } finally {
                      setUpdatingImage(false);
                    }
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3221}}

                  , updatingImage ? "Updating..." : "Update"
                )
              )
            )
          ) : null
        )
      )

      /* Update Delay Log dialog (from Delay Logs cards) */
      , React.createElement(Dialog, { open: updateDelayOpen, onOpenChange: (open) => { if (!open) closeUpdateDelayDialog(); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3251}}
        , React.createElement(DialogContent, { className: "w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3252}}
          , React.createElement(DialogHeader, { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3253}}
            , React.createElement(DialogTitle, { className: "text-xl font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3254}}, "Update Delay Log"  )
            , React.createElement(DialogDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3255}}, "Update the delay details for this activity."

            )
          )

          , updateDelayForm ? (
            React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3261}}
              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3262}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3263}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3264}}, "Project")
                  , React.createElement(Input, { value: String(updateDelayForm.project), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3265}} )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3267}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3268}}, "Activity")
                  , React.createElement(Input, { value: String(updateDelayForm.activity), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3269}} )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3271}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3272}}, "Category")
                  , React.createElement(Input, {
                    value: updateDelayForm.category,
                    onChange: (e) => setUpdateDelayForm((p) => (p ? { ...p, category: e.target.value } : p)),
                    placeholder: "e.g. Utility shifting"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3273}}
                  )
                )
              )

              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3281}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3282}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3283}}, "Delay start date"  )
                  , React.createElement(Input, {
                    type: "date",
                    value: updateDelayForm.delay_start_date,
                    onChange: (e) => setUpdateDelayForm((p) => (p ? { ...p, delay_start_date: e.target.value } : p)), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3284}}
                  )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3290}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3291}}, "Delay end date"  )
                  , React.createElement(Input, {
                    type: "date",
                    value: updateDelayForm.delay_end_date,
                    onChange: (e) => setUpdateDelayForm((p) => (p ? { ...p, delay_end_date: e.target.value } : p)), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3292}}
                  )
                )
              )

              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3300}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3301}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3302}}, "Issue")
                  , React.createElement(Textarea, {
                    value: updateDelayForm.issue,
                    onChange: (e) => setUpdateDelayForm((p) => (p ? { ...p, issue: e.target.value } : p)),
                    rows: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3303}}
                  )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3309}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3310}}, "Recommended action" )
                  , React.createElement(Textarea, {
                    value: updateDelayForm.recommended_action,
                    onChange: (e) => setUpdateDelayForm((p) => (p ? { ...p, recommended_action: e.target.value } : p)),
                    rows: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3311}}
                  )
                )
              )

              , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3319}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: closeUpdateDelayDialog, disabled: updatingDelay, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3320}}, "Cancel"

                )
                , React.createElement(Button, {
                  type: "button",
                  disabled: 
                    updatingDelay ||
                    !updateDelayForm.delay_start_date ||
                    !updateDelayForm.delay_end_date ||
                    !updateDelayForm.category
                  ,
                  onClick: async () => {
                    if (!updateDelayForm) return;
                    try {
                      setUpdatingDelay(true);
                      await updateDelayLog(updateDelayForm.id, {
                        project: updateDelayForm.project,
                        activity: updateDelayForm.activity,
                        delay_start_date: updateDelayForm.delay_start_date,
                        delay_end_date: updateDelayForm.delay_end_date,
                        category: updateDelayForm.category,
                        issue: updateDelayForm.issue,
                        recommended_action: updateDelayForm.recommended_action,
                      });
                      await queryClient.invalidateQueries({ queryKey: ["delay-logs", ganttProjectId] });
                      await _optionalChain([onProjectGanttRefresh, 'optionalCall', _72 => _72()]);
                      closeUpdateDelayDialog();
                    } finally {
                      setUpdatingDelay(false);
                    }
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3323}}

                  , updatingDelay ? "Updating..." : "Update"
                )
              )
            )
          ) : null
        )
      )

      /* Update Project Document dialog (from Documents list) */
      , React.createElement(Dialog, { open: updateDocOpen, onOpenChange: (open) => { if (!open) closeUpdateDocDialog(); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3361}}
        , React.createElement(DialogContent, { className: "w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3362}}
          , React.createElement(DialogHeader, { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3363}}
            , React.createElement(DialogTitle, { className: "text-xl font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3364}}, "Update Document" )
            , React.createElement(DialogDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3365}}, "Update the document title or replace the file."

            )
          )

          , updateDocForm ? (
            React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3371}}
              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3372}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3373}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3374}}, "Project")
                  , React.createElement(Input, { value: String(updateDocForm.project), readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3375}} )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3377}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3378}}, "Activity")
                  , React.createElement(Input, { value: updateDocForm.activity != null ? String(updateDocForm.activity) : "—", readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3379}} )
                )
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3381}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3382}}, "Title")
                  , React.createElement(Input, {
                    value: updateDocForm.title,
                    onChange: (e) => setUpdateDocForm((p) => (p ? { ...p, title: e.target.value } : p)),
                    placeholder: "e.g. Site Book"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3383}}
                  )
                )
              )

              , React.createElement('div', { className: "rounded-xl border border-border/60 p-4 bg-background/40 space-y-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3391}}
                , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3392}}
                  , React.createElement('div', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3393}}, "File")
                  , updateDocForm.currentUrl ? (
                    React.createElement(Button, { type: "button", size: "sm", variant: "outline", className: "h-8", asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3395}}
                      , React.createElement('a', { href: updateDocForm.currentUrl, target: "_blank", rel: "noreferrer", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3396}}
                        , React.createElement(Download, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3397}} ), " Open current"
                      )
                    )
                  ) : null
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3402}}
                  , React.createElement('div', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3403}}
                    , (() => {
                      const u = updateDocForm.currentUrl || "";
                      const name = u ? u.split("/").pop() : "";
                      const label = name ? decodeURIComponent(name) : "—";
                      return (
                        React.createElement('span', { className: "inline-flex items-center gap-2 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3409}}
                          , React.createElement('span', { className: "shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3410}}, "Current:")
                          , React.createElement('span', { className: "font-medium text-foreground truncate max-w-[520px]"   , title: label, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3411}}
                            , label
                          )
                        )
                      );
                    })()
                  )
                  , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3418}}
                    , updateDocForm.newFile ? (
                      React.createElement(Button, {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "h-8",
                        disabled: updatingDoc,
                        onClick: () => setUpdateDocForm((p) => (p ? { ...p, newFile: null } : p)), __self: this, __source: {fileName: _jsxFileName, lineNumber: 3420}}
, "Remove selected"

                      )
                    ) : null
                  )

                  , React.createElement('input', {
                    id: "update-project-document-file",
                    type: "file",
                    accept: ".pdf,.doc,.docx,.xlsx",
                    className: "hidden",
                    disabled: updatingDoc,
                    onChange: (e) => {
                      const file = _nullishCoalesce(_optionalChain([e, 'access', _73 => _73.target, 'access', _74 => _74.files, 'optionalAccess', _75 => _75[0]]), () => ( null));
                      setUpdateDocForm((p) => (p ? { ...p, newFile: file } : p));
                      e.target.value = "";
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3433}}
                  )

                  , React.createElement('div', {
                    className: `rounded-lg border border-dashed p-4 transition-colors ${
                      updateDocForm.newFile
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/60 bg-muted/10 cursor-pointer"
                    }`,
                    role: "button",
                    tabIndex: 0,
                    onClick: () => _optionalChain([document, 'access', _76 => _76.getElementById, 'call', _77 => _77("update-project-document-file"), 'optionalAccess', _78 => _78.click, 'call', _79 => _79()]),
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        _optionalChain([document, 'access', _80 => _80.getElementById, 'call', _81 => _81("update-project-document-file"), 'optionalAccess', _82 => _82.click, 'call', _83 => _83()]);
                      }
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3446}}

                    , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3462}}
                      , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3463}}
                        , React.createElement('div', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3464}}
                          , updateDocForm.newFile ? "New file selected" : "Choose a new file (optional)"
                        )
                        , React.createElement('div', { className: "text-xs text-muted-foreground mt-0.5 truncate"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3467}}
                          , updateDocForm.newFile ? updateDocForm.newFile.name : "PDF, DOC/DOCX, XLSX"
                        )
                      )
                      , React.createElement(Button, { type: "button", variant: "outline", size: "sm", className: "h-9 px-4" , disabled: updatingDoc, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3471}}
                        , updateDocForm.newFile ? "Change" : "Choose"
                      )
                    )
                  )

                  , React.createElement('p', { className: "text-[11px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3477}}, "Allowed: PDF, DOC/DOCX, XLSX"

                  )
                )
              )

              , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3483}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: closeUpdateDocDialog, disabled: updatingDoc, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3484}}, "Cancel"

                )
                , React.createElement(Button, {
                  type: "button",
                  disabled: updatingDoc || !updateDocForm.title.trim(),
                  onClick: async () => {
                    if (!updateDocForm) return;
                    try {
                      setUpdatingDoc(true);
                      await updateProjectDocument(updateDocForm.id, {
                        title: updateDocForm.title.trim(),
                        file: updateDocForm.newFile,
                      });
                      await queryClient.invalidateQueries({ queryKey: ["project-documents", ganttProjectId] });
                      closeUpdateDocDialog();
                    } catch (err) {
                      toast({
                        title: "Update failed",
                        description: err instanceof Error ? err.message : "Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setUpdatingDoc(false);
                    }
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3487}}

                  , updatingDoc ? "Updating..." : "Update"
                )
              )
            )
          ) : null
        )
      )
    )
  );
}


