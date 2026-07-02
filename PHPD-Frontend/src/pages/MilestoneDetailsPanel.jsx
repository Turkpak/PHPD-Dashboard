const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PlannedVsActualChart } from "@/components/dashboard/PlannedVsActualChart";

import { useWindowSize } from "@/hooks/use-window-size";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X, Plus, Trash2, Edit2, Calendar, AlertTriangle, Clock, Image as ImageIcon, MoreVertical, FileText, Upload, Download, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";














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
      name: _nullishCoalesce(childNames[i], () => (`${parent.name} — Task ${i + 1}`)),
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

  return subProjects.map((s) => {
    const r1 = hash01(s.id + "|s");
    const r2 = hash01(s.id + "|d");
    const duration = clamp(Math.round(2 + r2 * 3), 1, Math.max(1, n)); // 2..5 (clamped)
    const startIdx = clamp(Math.round(r1 * Math.max(0, n - duration)), 0, Math.max(0, n - 1));
    const endIdx = clamp(startIdx + duration - 1, startIdx, Math.max(0, n - 1));

    const variance = s.actualProgress - s.plannedProgress;
    const status =
      Math.abs(variance) < 1 ? "ontrack" : variance >= 0 ? "ahead" : "behind";

    return {
      id: s.id,
      name: s.name,
      startIdx,
      endIdx,
      weight: s.weight,
      status,
      children: buildChildTasks(
        {
          id: s.id,
          name: s.name,
          startIdx,
          endIdx,
          weight: s.weight,
          status,
        },
        s.id
      ),
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
          imagePreview: reader.result,
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
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange, __self: this, __source: { fileName: _jsxFileName, lineNumber: 417 } }
      , React.createElement(DialogContent, { className: "sm:max-w-[550px] p-0 overflow-hidden border-2 border-primary/10 shadow-2xl max-h-[90vh] flex flex-col", __self: this, __source: { fileName: _jsxFileName, lineNumber: 418 } }
        , React.createElement(DialogHeader, { className: "p-6 pb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 419 } }
          , React.createElement('div', { className: "flex items-center gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 420 } }
            , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 421 } }
              , React.createElement(Calendar, { className: "h-5 w-5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 422 } })
            )
            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 424 } }
              , React.createElement(DialogTitle, { className: "text-xl font-bold font-heading", __self: this, __source: { fileName: _jsxFileName, lineNumber: 425 } }
                , existingLog ? "Edit" : "Add", " Delay Log"
              )
              , React.createElement(DialogDescription, { className: "text-xs mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 428 } }
                , taskName.length > 40 ? taskName.substring(0, 40) + "..." : taskName
              )
            )
          )
        )

        , React.createElement('form', { onSubmit: handleSubmit, className: "flex flex-col flex-1 overflow-hidden", __self: this, __source: { fileName: _jsxFileName, lineNumber: 435 } }
          , React.createElement(ScrollArea, { className: "flex-1 max-h-[65vh] px-6 py-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 436 } }
            , React.createElement('div', { className: "space-y-5 pb-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 437 } }
              , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 438 } }
                , React.createElement(Label, { htmlFor: "loggedBy", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 439 } }, "Logged By ", React.createElement('span', { className: "text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 439 } }, "*"))
                , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 440 } }
                  , React.createElement(Input, {
                    id: "loggedBy",
                    placeholder: "Enter your name or ID",
                    value: formData.loggedBy,
                    onChange: (e) => setFormData({ ...formData, loggedBy: e.target.value }),
                    className: "pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 441 }
                  }
                  )
                  , React.createElement(AlertCircle, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60", __self: this, __source: { fileName: _jsxFileName, lineNumber: 449 } })
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 453 } }
                , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 454 } }
                  , React.createElement(Label, { htmlFor: "delayDate", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 455 } }, "Delay Date ", React.createElement('span', { className: "text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 455 } }, "*"))
                  , React.createElement(Input, {
                    id: "delayDate",
                    type: "date",
                    min: minDate,
                    max: maxDate,
                    value: formData.delayDate,
                    onChange: (e) => setFormData({ ...formData, delayDate: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 456 }
                  }
                  )
                  , minDate && maxDate && (
                    React.createElement('p', { className: "text-[10px] text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 467 } }, "Within planned timeline: ", minDate, " to ", maxDate)
                  )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 470 } }
                  , React.createElement(Label, { htmlFor: "delayDuration", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 471 } }, "Duration (Days) ", React.createElement('span', { className: "text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 471 } }, "*"))
                  , React.createElement(Input, {
                    id: "delayDuration",
                    type: "number",
                    min: "1",
                    placeholder: "1",
                    value: formData.delayDuration,
                    onChange: (e) => setFormData({ ...formData, delayDuration: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 472 }
                  }
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 485 } }
                , React.createElement(Label, { htmlFor: "reason", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 486 } }, "Reason for Delay ", React.createElement('span', { className: "text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 486 } }, "*"))
                , React.createElement(Textarea, {
                  id: "reason",
                  placeholder: "Describe the reason for the delay in detail...",
                  value: formData.reason,
                  onChange: (e) => setFormData({ ...formData, reason: e.target.value }),
                  rows: 3,
                  className: "bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all resize-none p-3",
                  required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 487 }
                }
                )
              )

              , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 498 } }
                , React.createElement(Label, { htmlFor: "image", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 499 } }, "Evidence Image (Optional)")
                , React.createElement('div', { className: "space-y-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 500 } }
                  , formData.imagePreview ? (
                    React.createElement('div', { className: "relative group rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900 shadow-md", __self: this, __source: { fileName: _jsxFileName, lineNumber: 502 } }
                      , React.createElement('img', {
                        src: formData.imagePreview,
                        alt: "Delay evidence",
                        className: "w-full h-40 object-cover", __self: this, __source: { fileName: _jsxFileName, lineNumber: 503 }
                      }
                      )
                      , React.createElement('div', { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 508 } }
                        , React.createElement(Button, {
                          type: "button",
                          variant: "destructive",
                          size: "sm",
                          className: "h-8 rounded-full shadow-lg",
                          onClick: handleRemoveImage, __self: this, __source: { fileName: _jsxFileName, lineNumber: 509 }
                        }

                          , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 516 } }), " Remove"
                        )
                      )
                    )
                  ) : (
                    React.createElement('div', {
                      className: "relative border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all rounded-xl p-8 text-center group cursor-pointer",
                      onClick: () => _optionalChain([document, 'access', _20 => _20.getElementById, 'call', _21 => _21('image'), 'optionalAccess', _22 => _22.click, 'call', _23 => _23()]), __self: this, __source: { fileName: _jsxFileName, lineNumber: 521 }
                    }
                      , React.createElement(ImageIcon, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 523 } })
                      , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 524 } }
                        , React.createElement('p', { className: "text-sm font-semibold text-foreground/80", __self: this, __source: { fileName: _jsxFileName, lineNumber: 525 } }, "Click to upload image")
                        , React.createElement('p', { className: "text-[10px] text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 526 } }, "PNG, JPG or JPEG up to 5MB")
                      )
                      , React.createElement(Input, {
                        id: "image",
                        type: "file",
                        accept: "image/*",
                        onChange: handleImageChange,
                        className: "hidden", __self: this, __source: { fileName: _jsxFileName, lineNumber: 528 }
                      }
                      )
                    )
                  )
                )
              )
            )
          )

          , React.createElement(DialogFooter, { className: "p-6 pt-2 bg-muted/10 border-t border-border/50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 542 } }
            , React.createElement(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), className: "h-11 rounded-xl px-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 543 } }, "Cancel"

            )
            , React.createElement(Button, {
              type: "submit",
              disabled: !formData.loggedBy.trim() || !formData.reason.trim(),
              className: "h-11 rounded-xl px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95", __self: this, __source: { fileName: _jsxFileName, lineNumber: 546 }
            }

              , React.createElement(Plus, { className: "h-4 w-4 mr-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 551 } })
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
    React.createElement('div', { className: "mt-6 space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 611 } }
      , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 612 } }
        , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 613 } })
        , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 614 } }, "Delay Logs ("
          , delayLogs.length, " total)"
        )
      )

      , React.createElement('div', { className: `grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 619 } }
        , sortedLogs.map((log) => {
          const taskName = getTaskName(log.taskId);
          const subProject = _optionalChain([subProjects, 'optionalAccess', _27 => _27.find, 'call', _28 => _28(sp => sp.id === log.taskId)]);
          const variance = subProject
            ? Math.max(0, subProject.plannedProgress - subProject.actualProgress)
            : 0;
          const displayDate = log.loggedAt || log.delayDate;

          return (
            React.createElement(Card, { key: log.id, className: "border-amber-200 dark:border-orange-800 bg-amber-50/80 dark:bg-orange-950/20 rounded-xl overflow-hidden shadow-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 629 } }
              , React.createElement(CardContent, { className: "p-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 630 } }
                , React.createElement('div', { className: "space-y-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 631 } }
                  /* Task title */
                  , React.createElement('h4', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground truncate`, title: taskName, __self: this, __source: { fileName: _jsxFileName, lineNumber: 633 } }
                    , taskName
                  )

                  /* Red status badge: X% behind schedule */
                  , variance > 0 && (
                    React.createElement(Badge, { variant: "destructive", className: "rounded-md px-2.5 py-1 text-xs font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 639 } }
                      , variance.toFixed(1), "% behind schedule"
                    )
                  )

                  /* Timeline: Month (calendar) + Duration (clock) - button-like */
                  , React.createElement('div', { className: "flex items-center gap-2 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 645 } }
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 646 } }
                      , React.createElement(Calendar, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 647 } })
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 650 } }
                      , React.createElement(Clock, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 651 } })
                      , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                    )
                  )

                  /* Reason for delay */
                  , React.createElement('p', { className: "text-sm text-muted-foreground leading-snug", title: log.reason, __self: this, __source: { fileName: _jsxFileName, lineNumber: 657 } }
                    , log.reason
                  )

                  /* Image display */
                  , log.imageUrl && (
                    React.createElement('div', { className: "relative rounded-lg overflow-hidden border border-amber-200 dark:border-orange-800", __self: this, __source: { fileName: _jsxFileName, lineNumber: 663 } }
                      , React.createElement('img', {
                        src: log.imageUrl,
                        alt: "Delay evidence",
                        className: "w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity",
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
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 664 }
                      }
                      )
                      , React.createElement('div', { className: "absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 682 } }
                        , React.createElement(ImageIcon, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 683 } }), "Evidence"

                      )
                    )
                  )

                  /* Attribution and date */
                  , React.createElement('div', { className: "flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-amber-200/80 dark:border-orange-800/80", __self: this, __source: { fileName: _jsxFileName, lineNumber: 690 } }
                    , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 691 } }, "By: ", log.loggedBy)
                    , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 692 } }, new Date(displayDate).toLocaleDateString())
                  )

                  /* Delete button beneath each delay log card */
                  , onDelete && (
                    React.createElement('div', { className: "pt-3 mt-2 border-t border-amber-200/80 dark:border-orange-800/80", __self: this, __source: { fileName: _jsxFileName, lineNumber: 697 } }
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        className: "w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
                        onClick: () => {
                          if (confirm("Delete this delay log?")) {
                            onDelete(log.id);
                          }
                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 698 }
                      }

                        , React.createElement(Trash2, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 708 } }), "Delete delay log"

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
      React.createElement('div', { className: "text-center py-12 text-muted-foreground border border-border rounded-lg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 767 } }
        , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 768 } })
        , React.createElement('p', { className: "text-sm font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 769 } }, "No delay logs recorded yet")
        , React.createElement('p', { className: "text-xs mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 770 } }, "Delay logs will appear here when you log delays in the Gantt chart.")
      )
    );
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...delayLogs].sort((a, b) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  return (
    React.createElement('div', { className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 781 } }
      , React.createElement('div', { className: "flex items-center justify-between", __self: this, __source: { fileName: _jsxFileName, lineNumber: 782 } }
        , React.createElement('div', { className: "text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 783 } }
          , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
        )
      )

      , React.createElement('div', { className: "border border-border rounded-lg overflow-hidden", __self: this, __source: { fileName: _jsxFileName, lineNumber: 788 } }
        , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: { fileName: _jsxFileName, lineNumber: 789 } }
          , React.createElement(Table, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 790 } }
            , React.createElement(TableHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 791 } }
              , React.createElement(TableRow, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 792 } }
                , React.createElement(TableHead, { className: isMobile ? 'w-[120px]' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 793 } }, "Task Name")
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 794 } }, "Month")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 795 } }, "Logged By")
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 796 } }, "Duration")
                , React.createElement(TableHead, { className: isMobile ? 'hidden' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 797 } }, "Reason")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 798 } }, "Date")
                , React.createElement(TableHead, { className: "w-[100px] text-right", __self: this, __source: { fileName: _jsxFileName, lineNumber: 799 } }, "Actions")
              )
            )
            , React.createElement(TableBody, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 802 } }
              , sortedLogs.map((log) => (
                React.createElement(TableRow, { key: log.id, __self: this, __source: { fileName: _jsxFileName, lineNumber: 804 } }
                  , React.createElement(TableCell, { className: `font-medium ${isMobile ? 'text-xs' : ''}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 805 } }
                    , React.createElement('div', { className: "max-w-[200px] truncate", title: getTaskName(log.taskId), __self: this, __source: { fileName: _jsxFileName, lineNumber: 806 } }
                      , getTaskName(log.taskId)
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 810 } }
                    , React.createElement(Badge, { variant: "outline", className: "gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 811 } }
                      , React.createElement(Calendar, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 812 } })
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 816 } }
                    , log.loggedBy
                  )
                  , React.createElement(TableCell, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 819 } }
                    , React.createElement(Badge, { variant: "secondary", className: "gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 820 } }
                      , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'hidden' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 824 } }
                    , React.createElement('div', { className: "max-w-[300px] truncate text-sm text-muted-foreground", title: log.reason, __self: this, __source: { fileName: _jsxFileName, lineNumber: 825 } }
                      , log.reason
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : 'text-sm', __self: this, __source: { fileName: _jsxFileName, lineNumber: 829 } }
                    , new Date(log.loggedAt).toLocaleDateString()
                  )
                  , React.createElement(TableCell, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 832 } }
                    , React.createElement('div', { className: "flex items-center justify-end gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 833 } }
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => onEdit(log),
                        className: "h-8 w-8 p-0",
                        title: "Edit log", __self: this, __source: { fileName: _jsxFileName, lineNumber: 834 }
                      }

                        , React.createElement(Edit2, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 841 } })
                      )
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => {
                          if (confirm("Are you sure you want to delete this delay log?")) {
                            onDelete(log.id);
                          }
                        },
                        className: "h-8 w-8 p-0 text-destructive hover:text-destructive",
                        title: "Delete log", __self: this, __source: { fileName: _jsxFileName, lineNumber: 843 }
                      }

                        , React.createElement(Trash2, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 854 } })
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
        React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 867 } }
          , sortedLogs.map((log) => (
            React.createElement('div', { key: log.id, className: "border border-border rounded-lg p-3 bg-card/50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 869 } }
              , React.createElement('div', { className: "flex items-start justify-between gap-2 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 870 } }
                , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 871 } }
                  , React.createElement('div', { className: "font-medium text-sm truncate", __self: this, __source: { fileName: _jsxFileName, lineNumber: 872 } }, getTaskName(log.taskId))
                  , React.createElement('div', { className: "text-xs text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 873 } }
                    , months[log.monthIndex] || `Month ${log.monthIndex + 1}`, " • ", log.loggedBy
                  )
                )
                , React.createElement('div', { className: "flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 877 } }
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => onEdit(log),
                    className: "h-7 w-7 p-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 878 }
                  }

                    , React.createElement(Edit2, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 884 } })
                  )
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => {
                      if (confirm("Delete this delay log?")) {
                        onDelete(log.id);
                      }
                    },
                    className: "h-7 w-7 p-0 text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 886 }
                  }

                    , React.createElement(Trash2, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 896 } })
                  )
                )
              )
              , React.createElement('div', { className: "text-xs text-muted-foreground mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 900 } }, log.reason)
              , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 901 } }
                , React.createElement(Badge, { variant: "secondary", className: "text-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 902 } }
                  , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                )
                , React.createElement('span', { className: "text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 905 } }
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
        existingLog: editingLog, __self: this, __source: { fileName: _jsxFileName, lineNumber: 968 }
      }
      )
    );
  }

  return (
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange, __self: this, __source: { fileName: _jsxFileName, lineNumber: 988 } }
      , React.createElement(DialogContent, { className: "sm:max-w-[600px] max-h-[80vh]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 989 } }
        , React.createElement(DialogHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 990 } }
          , React.createElement(DialogTitle, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 991 } }, "Delay Logs for ", taskName)
          , React.createElement(DialogDescription, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 992 } }, "View and manage delay logs for "
            , monthName, ". Delay logs are displayed as orange bars in the Gantt chart."
          )
        )
        , React.createElement('div', { className: "space-y-4 py-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 996 } }
          , React.createElement('div', { className: "flex items-center justify-between", __self: this, __source: { fileName: _jsxFileName, lineNumber: 997 } }
            , React.createElement('div', { className: "text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 998 } }
              , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
            )
            , React.createElement(Button, { onClick: handleAddNew, size: "sm", className: "gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1001 } }
              , React.createElement(Plus, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1002 } }), "Add New Log"

            )
          )

          , delayLogs.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1008 } }
              , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1009 } })
              , React.createElement('p', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1010 } }, "No delay logs recorded yet.")
              , React.createElement('p', { className: "text-xs mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1011 } }, "Click \"Add New Log\" to record a delay.")
            )
          ) : (
            React.createElement(ScrollArea, { className: "h-[400px] pr-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1014 } }
              , React.createElement('div', { className: "space-y-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1015 } }
                , delayLogs.map((log) => (
                  React.createElement('div', {
                    key: log.id,
                    className: "border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1017 }
                  }

                    , React.createElement('div', { className: "flex items-start justify-between gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1021 } }
                      , React.createElement('div', { className: "flex-1 space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1022 } }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1023 } }
                          , React.createElement(Badge, { variant: "outline", className: "gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1024 } }
                            , React.createElement(Calendar, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1025 } })
                            , new Date(log.loggedAt).toLocaleDateString()
                          )
                          , React.createElement(Badge, { variant: "secondary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1028 } }
                            , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                          )
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1032 } }
                          , React.createElement('p', { className: "text-sm font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1033 } }, "Logged by: ", log.loggedBy)
                          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1034 } }, log.reason)
                        )
                      )
                      , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1037 } }
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleEdit(log),
                          className: "h-8 w-8 p-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1038 }
                        }

                          , React.createElement(Edit2, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1044 } })
                        )
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleDelete(log.id),
                          className: "h-8 w-8 p-0 text-destructive hover:text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1046 }
                        }

                          , React.createElement(Trash2, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1052 } })
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )
        , React.createElement(DialogFooter, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1062 } }
          , React.createElement(Button, { variant: "outline", onClick: () => onOpenChange(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 1063 } }, "Close"

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

  // Get delay logs for a specific task and month
  const getDelayLogsForTask = (taskId, monthIndex) => {
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
      const currentValue = _nullishCoalesce(prev[id], () => (true)); // Default to true (expanded)
      return { ...prev, [id]: !currentValue };
    });
  };

  // Calculate grid columns: WBS column + month columns + Actions column
  const labelColWidth = isMobile ? '140px' : isTablet ? '180px' : '240px';
  const actionsColWidth = '48px';
  const gridCols = `${labelColWidth} repeat(${n}, 1fr) ${actionsColWidth}`;

  return (
    React.createElement('div', { className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1238 } }
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
          onDelete: handleDeleteDelayLog, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1241 }
        }
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
          defaultDate: selectedBarForLog.clickDate, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1257 }
        }
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
            maxDate: maxDate, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1284 }
          }
          )
        );
      })()

      /* Legend for delay logs and progress */
      , React.createElement('div', { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1310 } }
        , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1311 } }
          , React.createElement('div', { className: "flex flex-col gap-0.5 h-5 w-6 rounded-sm overflow-hidden border border-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1312 } }
            , React.createElement('div', { className: "flex-1 bg-emerald-600 min-h-[2px]", title: "Planned (top)", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1313 } })
            , React.createElement('div', { className: "flex-1 bg-emerald-600 min-h-[2px]", title: "Actual (bottom)", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1314 } })
          )
          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1316 } }, "Bar: top = Planned, bottom = Actual (same color)")
        )
        , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1318 } }
          , React.createElement(MoreVertical, { className: "h-4 w-4 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1319 } })
          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1320 } }, "Options (⋯) per row: Add delay log (within planned timeline). Delete via button beneath each delay log card.")
        )
        , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1322 } }
          , React.createElement('div', { className: "h-2 w-2 rounded-full bg-emerald-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1323 } })
          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1324 } }, "Click on Gantt bars to add delay log")
        )
        , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1326 } }
          , React.createElement('div', { className: "h-1.5 w-4 bg-orange-500 rounded", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1327 } })
          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1328 } }, "Delay log marker (positioned by date)")
        )
        , delayLogs && delayLogs.length > 0 && (
          React.createElement('div', { className: "flex items-center gap-2 text-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1331 } }
            , React.createElement('div', { className: "flex items-center gap-1 text-orange-600 dark:text-orange-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1332 } }
              , React.createElement(AlertTriangle, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1333 } })
              , React.createElement('span', { className: "font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1334 } }
                , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
              )
            )
          )
        )
      )

      /* Gantt Chart Container with full border */
      , React.createElement('div', { className: "border-2 border-border rounded-lg overflow-hidden bg-background", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1343 } }
        /* Header row with month labels */
        , React.createElement('div', { className: `grid border-b-2 border-border bg-muted/30 ${isMobile ? 'overflow-x-auto min-w-full' : ''}`, style: { gridTemplateColumns: gridCols }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1345 } }
          , React.createElement('div', { className: `${isMobile ? 'p-1.5 text-[10px]' : 'p-2 text-xs'} font-bold text-muted-foreground border-r-2 border-border bg-muted/40`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1346 } }, "WBS Subprocess")
          , months.map((m, idx) => {
            const { label, dateRange } = getMonthHeaderLabel(m, GANTT_CHART_YEAR);
            return (
              React.createElement('div', {
                key: m,
                className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-r-2 border-border bg-muted/40 flex flex-col items-center justify-center gap-0.5`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1350 }
              }

                , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1354 } }, isMobile ? label.replace(` ${GANTT_CHART_YEAR}`, "'26") : label)
                , React.createElement('span', { className: `font-normal opacity-90 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1355 } }, dateRange)
              )
            );
          })
          , React.createElement('div', { className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-border bg-muted/40 flex items-center justify-center`, title: "Add delay log (within planned timeline)", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1359 } }, "Options"

          )
        )

        /* Task rows */
        , React.createElement('div', { className: `space-y-1 ${isMobile ? 'overflow-x-auto min-w-full' : ''}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1365 } }
          , tasks.map((t) => {
            const isExpanded = _nullishCoalesce(expanded[t.id], () => (true));
            const hasChildren = (_nullishCoalesce(_optionalChain([t, 'access', _38 => _38.children, 'optionalAccess', _39 => _39.length]), () => (0))) > 0;
            const subProject = getSubProjectForTask(t.id);
            const progress = getProgressPercentage(t, subProject);
            const plannedPct = getPlannedPercentage(t, subProject);
            const responsible = getResponsiblePerson(t.id, t.name);
            const span = t.endIdx - t.startIdx + 1;

            return (
              React.createElement('div', { key: t.id, className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1376 } }
                /* Parent task row */
                , React.createElement('div', { className: `grid border-l-2 border-r-2 border-b-2 border-border relative ${isMobile ? 'min-w-full' : 'overflow-hidden'} bg-background`, style: { gridTemplateColumns: gridCols }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1378 } }
                  /* Left label column */
                  , React.createElement('div', { className: "p-2 border-r-2 border-border flex items-center gap-2 min-w-0 relative z-5 bg-muted/20", onClick: (e) => e.stopPropagation(), __self: this, __source: { fileName: _jsxFileName, lineNumber: 1380 } }
                    , hasChildren && (
                      React.createElement('button', {
                        type: "button",
                        onClick: (e) => toggle(t.id, e),
                        onMouseDown: (e) => e.stopPropagation(),
                        className: "h-5 w-5 rounded border border-border/60 bg-background hover:bg-muted/40 transition-colors flex items-center justify-center flex-shrink-0 relative z-10",
                        title: isExpanded ? "Collapse" : "Expand", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1382 }
                      }

                        , React.createElement('span', { className: "text-[10px] font-bold leading-none", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1389 } }, isExpanded ? "−" : "+")
                      )
                    )
                    , React.createElement('div', { className: "min-w-0 flex-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1392 } }
                      , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-foreground truncate`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1393 } }, t.name)
                      , React.createElement('div', { className: `${isMobile ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1394 } }, "Weight "
                        , (t.weight * 100).toFixed(0), "% •", " "
                        , React.createElement('span', {
                          className:
                            t.status === "ahead"
                              ? "text-emerald-600"
                              : t.status === "behind"
                                ? "text-red-600"
                                : "text-emerald-700"
                          , __self: this, __source: { fileName: _jsxFileName, lineNumber: 1396 }
                        }

                          , t.status === "ontrack" ? "On track" : t.status === "ahead" ? "Ahead" : "Behind"
                        )
                      )
                    )
                  )

                  /* Timeline container - month columns only (Actions column is last) */
                  , React.createElement('div', { className: "relative border-r-2 border-border", style: { gridColumn: `2 / span ${n}` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1412 } }
                    /* Grid cells for timeline - background cells */
                    , React.createElement('div', { className: "grid h-12", style: { gridTemplateColumns: `repeat(${n}, 1fr)` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1414 } }
                      , months.map((m, monthIdx) => {
                        const taskHasDelay = hasDelay(t);
                        const delayLogsForMonth = getDelayLogsForTask(t.id, monthIdx);
                        const isInTaskRange = monthIdx >= t.startIdx && monthIdx <= t.endIdx;

                        return (
                          React.createElement('div', {
                            key: m,
                            className: "border-r-2 border-border last:border-r-0 bg-muted/20 relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1421 }
                          }

                            /* Clickable area to add delay log - only show if task is in range */
                            , isInTaskRange && (
                              React.createElement('button', {
                                type: "button",
                                onClick: (e) => handleBarClick(e, t.id, t.name, monthIdx),
                                className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer",
                                title: "Click anywhere on this cell to add a delay log", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1427 }
                              }
                              )
                            )
                            /* Delay log indicators - positioned based on date within month - more visible with icons */
                            , delayLogsForMonth.length > 0 && (
                              React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-11", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1436 } }
                                , delayLogsForMonth.map((log) => {
                                  const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                  return (
                                    React.createElement('div', {
                                      key: log.id,
                                      className: "absolute group",
                                      style: {
                                        left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1440 }
                                    }

                                      /* Indicator bar */
                                      , React.createElement('div', { className: "h-2.5 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-5 min-w-[4px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1448 } })
                                      /* Icon badge */
                                      , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1450 } }
                                        , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1451 } })
                                      )
                                      /* Tooltip */
                                      , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1454 } }
                                        , React.createElement('div', { className: "font-semibold flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1455 } }
                                          , React.createElement(Clock, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1456 } }), "Delay Logged"

                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-90 mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1459 } }, log.reason)
                                        , log.imageUrl && (
                                          React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1461 } }
                                            , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1462 } }
                                              , React.createElement(ImageIcon, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1463 } }), "Evidence Image:"

                                            )
                                            , React.createElement('img', {
                                              src: log.imageUrl,
                                              alt: "Delay evidence",
                                              className: "w-full h-24 object-cover rounded mt-1 cursor-pointer hover:opacity-80",
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
                                              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1466 }
                                            }
                                            )
                                          )
                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1487 } }, log.delayDuration, " days • ", new Date(log.delayDate).toLocaleDateString())
                                        , React.createElement('div', { className: "text-[10px] opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1488 } }, "By: ", log.loggedBy)
                                        , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1489 } })
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

                    /* Task bar spanning across cells - clickable to add delay logs */
                    , (() => {
                      const fillColor = statusColor(t.status, baseColor);
                      const barBgColor = hexToRgba(fillColor, 0.4);
                      return (
                        React.createElement('div', {
                          className: "absolute top-1 bottom-1 rounded shadow-sm z-10 overflow-hidden",
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
                          title: "Click on the bar to add a delay log at this position", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1506 }
                        }

                          /* Horizontal split: top = Planned, bottom = Actual (same dark color, no white tone) */
                          , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1527 } }
                            /* Top half: Planned progress */
                            , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1529 } }
                              , React.createElement('div', {
                                className: "h-full transition-all duration-300",
                                style: { width: `${Math.min(100, Math.max(0, plannedPct))}%`, backgroundColor: fillColor },
                                title: `Planned: ${plannedPct}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1530 }
                              }
                              )
                            )
                            /* Bottom half: Actual progress */
                            , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1537 } }
                              , React.createElement('div', {
                                className: "h-full transition-all duration-300",
                                style: { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: fillColor },
                                title: `Actual: ${progress}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1538 }
                              }
                              )
                              /* Delay impact stripe within actual row (starts after actual %) */
                              , subProject && (subProject).delayImpact > 0 && (subProject).originalProgress > progress && (
                                React.createElement('div', {
                                  className: "absolute top-0 bottom-0 bg-red-500/50 border-r-2 border-red-600/60 transition-all duration-300",
                                  style: {
                                    left: `${Math.min(100, Math.max(0, progress))}%`,
                                    width: `${Math.min(100 - progress, (subProject).delayImpact)}%`,
                                  },
                                  title: `Delay impact: ${((subProject).delayImpact).toFixed(1)}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1545 }
                                }
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
                                className: "absolute top-0 bottom-0 z-12 group",
                                style: {
                                  left: `${clampedPosition}%`,
                                  transform: 'translateX(-50%)',
                                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1563 }
                              }

                                /* Vertical marker line */
                                , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-1 bg-orange-500 shadow-lg border-l border-r border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1572 } })
                                /* Icon indicator at top */
                                , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1574 } }
                                  , React.createElement(AlertTriangle, { className: "h-2 w-2 text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1575 } })
                                )
                                /* Tooltip on hover */
                                , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1578 } }
                                  , React.createElement('div', { className: "font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1579 } }, "Delay Logged")
                                  , React.createElement('div', { className: "text-[10px] opacity-90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1580 } }, log.reason)
                                  , React.createElement('div', { className: "text-[10px] opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1581 } }, log.delayDuration, " days • ", new Date(log.delayDate).toLocaleDateString())
                                  , React.createElement('div', { className: "text-[10px] opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1582 } }, "By: ", log.loggedBy)
                                  , log.imageUrl && (
                                    React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1584 } }
                                      , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1585 } }
                                        , React.createElement(ImageIcon, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1586 } }), "Evidence Image:"

                                      )
                                      , React.createElement('img', {
                                        src: log.imageUrl,
                                        alt: "Delay evidence",
                                        className: "w-full h-24 object-cover rounded mt-1 cursor-pointer hover:opacity-80",
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
                                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1589 }
                                      }
                                      )
                                    )
                                  )
                                  , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1610 } })
                                )
                              )
                            );
                          })
                          /* Text content */
                          , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} font-semibold text-white truncate flex-1 pointer-events-none relative z-20 px-2 flex items-center h-full`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1616 } }
                            , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1617 } }
                              , React.createElement('div', { className: "truncate flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1618 } }
                                , subProject && (subProject).delayImpact > 0 && (
                                  React.createElement(AlertTriangle, { className: "h-2.5 w-2.5 text-orange-300 flex-shrink-0", title: `${((subProject).delayImpact).toFixed(1)}% impact from delays`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1620 } })
                                )
                                , React.createElement('span', { className: "truncate", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1622 } }, responsible)
                              )
                              , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} opacity-95 flex items-center gap-1.5 flex-wrap`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1624 } }
                                , React.createElement('span', { title: "Top strip = Planned", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1625 } }, React.createElement('span', { className: "opacity-80", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1625 } }, "P:"), plannedPct, "%")
                                , React.createElement('span', { className: "opacity-60", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1626 } }, "|")
                                , React.createElement('span', { title: "Bottom strip = Actual", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1627 } }, React.createElement('span', { className: "opacity-80", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1627 } }, "A:"), progress, "%")
                                , subProject && (subProject).delayImpact > 0 && (
                                  React.createElement('span', { className: "text-orange-200", title: `Delay impact: ${((subProject).delayImpact).toFixed(0)}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1629 } }, "(-"
                                    , ((subProject).delayImpact).toFixed(0), "%)"
                                  )
                                )
                              )
                            )
                          )
                        )
                      );
                    })()
                  )
                  /* Actions column: options menu (Add delay log / Delete delay log(s)) */
                  , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1640 } }
                    , React.createElement(DropdownMenu, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1641 } }
                      , React.createElement(DropdownMenuTrigger, { asChild: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1642 } }
                        , React.createElement('button', {
                          type: "button",
                          onClick: (e) => e.stopPropagation(),
                          className: "h-8 w-8 rounded-md border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                          title: "Options", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1643 }
                        }

                          , React.createElement(MoreVertical, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1649 } })
                        )
                      )
                      , React.createElement(DropdownMenuContent, { align: "end", className: "w-56", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1652 } }
                        , React.createElement(DropdownMenuItem, {
                          onSelect: (e) => {
                            e.preventDefault();
                            setSelectedRowForDelayLog({
                              taskId: t.id,
                              taskName: t.name,
                              startIdx: t.startIdx,
                              endIdx: t.endIdx,
                            });
                            setRowAddLogOpen(true);
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1653 }
                        }

                          , React.createElement(Plus, { className: "h-4 w-4 mr-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1665 } }), "Add delay log"

                        )
                      )
                    )
                  )
                )

                /* Child task rows */
                , hasChildren && isExpanded && (
                  React.createElement('div', { className: "space-y-0.5 pl-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1675 } }
                    , t.children.map((c) => {
                      const childSubProject = getSubProjectForTask(c.id);
                      const childProgress = getProgressPercentage(c, childSubProject);
                      const childPlannedPct = getPlannedPercentage(c, childSubProject);
                      const childResponsible = getResponsiblePerson(c.id, c.name);
                      const childSpan = c.endIdx - c.startIdx + 1;

                      return (
                        React.createElement('div', {
                          key: c.id,
                          className: `grid border-l-2 border-r-2 border-b-2 border-border relative ${isMobile ? 'min-w-full' : 'overflow-hidden'} bg-background`,
                          style: { gridTemplateColumns: gridCols }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1684 }
                        }

                          /* Left label column */
                          , React.createElement('div', { className: "p-1.5 border-r-2 border-border min-w-0 relative z-10 bg-muted/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1690 } }
                            , React.createElement('div', { className: `${isMobile ? 'text-[11px]' : 'text-xs'} font-medium text-foreground/90 truncate`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1691 } }, c.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1692 } }, "Weight "
                              , (c.weight * 100).toFixed(0), "%"
                            )
                          )

                          /* Timeline container - month columns only */
                          , React.createElement('div', { className: "relative border-r-2 border-border", style: { gridColumn: `2 / span ${n}` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1698 } }
                            /* Grid cells for timeline - background cells */
                            , React.createElement('div', { className: "grid h-10", style: { gridTemplateColumns: `repeat(${n}, 1fr)` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1700 } }
                              , months.map((m, monthIdx) => {
                                const childHasDelay = c.status === "behind";
                                const delayLogsForMonth = getDelayLogsForTask(c.id, monthIdx);
                                const isInTaskRange = monthIdx >= c.startIdx && monthIdx <= c.endIdx;

                                return (
                                  React.createElement('div', {
                                    key: m,
                                    className: "border-r-2 border-border last:border-r-0 bg-muted/10 relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1707 }
                                  }

                                    /* Clickable area to add delay log for child tasks */
                                    , isInTaskRange && (
                                      React.createElement('button', {
                                        type: "button",
                                        onClick: (e) => handleBarClick(e, c.id, c.name, monthIdx),
                                        className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer",
                                        title: "Click anywhere on this cell to add a delay log", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1713 }
                                      }
                                      )
                                    )
                                    /* Delay log indicators for child tasks - positioned based on date - more visible with icons */
                                    , delayLogsForMonth.length > 0 && (
                                      React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-25", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1722 } }
                                        , delayLogsForMonth.map((log) => {
                                          const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                          return (
                                            React.createElement('div', {
                                              key: log.id,
                                              className: "absolute group",
                                              style: {
                                                left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                              }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1726 }
                                            }

                                              /* Indicator bar */
                                              , React.createElement('div', { className: "h-2 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-4 min-w-[3px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1734 } })
                                              /* Icon badge */
                                              , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1736 } }
                                                , React.createElement(AlertTriangle, { className: "h-1 w-1 text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1737 } })
                                              )
                                              /* Tooltip */
                                              , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1740 } }
                                                , React.createElement('div', { className: "font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1741 } }, "Delay")
                                                , React.createElement('div', { className: "opacity-90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1742 } }, log.reason)
                                                , React.createElement('div', { className: "opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1743 } }, log.delayDuration, "d")
                                                , log.imageUrl && (
                                                  React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1745 } }
                                                    , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1746 } }
                                                      , React.createElement(ImageIcon, { className: "h-2.5 w-2.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1747 } }), "Evidence:"

                                                    )
                                                    , React.createElement('img', {
                                                      src: log.imageUrl,
                                                      alt: "Delay evidence",
                                                      className: "w-full h-20 object-cover rounded cursor-pointer hover:opacity-80",
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
                                                      }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1750 }
                                                    }
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

                            /* Child task bar - same dark color for both strips */
                            , (() => {
                              const childFillColor = statusColor(c.status, baseColor);
                              const childBarBgColor = hexToRgba(childFillColor, 0.4);
                              return (
                                React.createElement('div', {
                                  className: "absolute top-0.5 bottom-0.5 rounded z-20 overflow-hidden",
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
                                  title: "Click on the bar to add a delay log at this position", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1787 }
                                }

                                  /* Horizontal split: top = Planned, bottom = Actual */
                                  , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1808 } }
                                    , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1809 } }
                                      , React.createElement('div', {
                                        className: "h-full transition-all duration-300",
                                        style: { width: `${Math.min(100, Math.max(0, childPlannedPct))}%`, backgroundColor: childFillColor },
                                        title: `Planned: ${childPlannedPct}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1810 }
                                      }
                                      )
                                    )
                                    , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1816 } }
                                      , React.createElement('div', {
                                        className: "h-full transition-all duration-300",
                                        style: { width: `${Math.min(100, Math.max(0, childProgress))}%`, backgroundColor: childFillColor },
                                        title: `Actual: ${childProgress}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1817 }
                                      }
                                      )
                                      , childSubProject && (childSubProject).delayImpact > 0 && (childSubProject).originalProgress > childProgress && (
                                        React.createElement('div', {
                                          className: "absolute top-0 bottom-0 bg-red-500/50 border-r-2 border-red-600/60 transition-all duration-300",
                                          style: {
                                            left: `${Math.min(100, Math.max(0, childProgress))}%`,
                                            width: `${Math.min(100 - childProgress, (childSubProject).delayImpact)}%`,
                                          },
                                          title: `Delay impact: ${((childSubProject).delayImpact).toFixed(1)}%`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1823 }
                                        }
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
                                        className: "absolute top-0 bottom-0 z-30 group",
                                        style: {
                                          left: `${clampedPosition}%`,
                                          transform: 'translateX(-50%)',
                                        }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1841 }
                                      }

                                        /* Vertical marker line */
                                        , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-0.5 bg-orange-500 shadow-md border-l border-r border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1850 } })
                                        /* Icon indicator at top */
                                        , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1852 } }
                                          , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1853 } })
                                        )
                                        /* Tooltip on hover */
                                        , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1856 } }
                                          , React.createElement('div', { className: "font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1857 } }, "Delay")
                                          , React.createElement('div', { className: "opacity-90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1858 } }, log.reason)
                                          , React.createElement('div', { className: "opacity-75", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1859 } }, log.delayDuration, "d")
                                          , log.imageUrl && (
                                            React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1861 } }
                                              , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1862 } }
                                                , React.createElement(ImageIcon, { className: "h-2.5 w-2.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1863 } }), "Evidence:"

                                              )
                                              , React.createElement('img', {
                                                src: log.imageUrl,
                                                alt: "Delay evidence",
                                                className: "w-full h-20 object-cover rounded cursor-pointer hover:opacity-80",
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
                                                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1866 }
                                              }
                                              )
                                            )
                                          )
                                        )
                                      )
                                    );
                                  })
                                  /* Text content: Actual / Planned */
                                  , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} font-medium text-white truncate flex-1 pointer-events-none relative z-20 px-1.5 flex items-center h-full drop-shadow-md`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1892 } }
                                    , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1893 } }
                                      , React.createElement('div', { className: "truncate", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1894 } }, childResponsible)
                                      , React.createElement('div', { className: `${isMobile ? 'text-[6px]' : 'text-[7px]'} opacity-95 flex items-center gap-1`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1895 } }
                                        , React.createElement('span', { title: "Top = Planned", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1896 } }, "P:", childPlannedPct, "%")
                                        , React.createElement('span', { className: "opacity-60", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1897 } }, "|")
                                        , React.createElement('span', { title: "Bottom = Actual", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1898 } }, "A:", childProgress, "%")
                                      )
                                    )
                                  )
                                )
                              );
                            })()
                          )
                          /* Actions column for child row: options menu */
                          , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1906 } }
                            , React.createElement(DropdownMenu, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 1907 } }
                              , React.createElement(DropdownMenuTrigger, { asChild: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1908 } }
                                , React.createElement('button', {
                                  type: "button",
                                  onClick: (e) => e.stopPropagation(),
                                  className: "h-7 w-7 rounded-md border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                                  title: "Options", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1909 }
                                }

                                  , React.createElement(MoreVertical, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1915 } })
                                )
                              )
                              , React.createElement(DropdownMenuContent, { align: "end", className: "w-56", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1918 } }
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
                                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 1919 }
                                }

                                  , React.createElement(Plus, { className: "h-4 w-4 mr-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1931 } }), "Add delay log"

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
  );
}

export function MilestoneDetailsPanel({
  milestoneTitle,
  phase,
  phaseColor,
  onClear,
  showAllTabs = false,
}





) {
  const [tab, setTab] = useState("gantt");

  // Progress documents & pictures (frontend-only state; no backend)


  const [progressPictures, setProgressPictures] = useState([]);
  const [progressDocuments, setProgressDocuments] = useState([]);
  const [pictureTimelineMonth, setPictureTimelineMonth] = useState("");
  const [pictureCaption, setPictureCaption] = useState("");

  // State for editing delay log from table
  const [editingLogFromTable, setEditingLogFromTable] = useState(undefined);
  const [showEditForm, setShowEditForm] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const subProjects = _nullishCoalesce(phase.subProjects, () => (EMPTY_ARRAY));
  const timeline = _nullishCoalesce(phase.timeline, () => (EMPTY_ARRAY));
  const months = useMemo(() => timeline.map((t) => t.month), [timeline]);

  // Detect if we're in financial mode based on milestone title or sub-project names
  const isFinancialMode = useMemo(() => {
    return milestoneTitle.toLowerCase().includes('financial') ||
      subProjects.some(sp => sp.name.toLowerCase().includes('budget'));
  }, [milestoneTitle, subProjects]);

  // Build Gantt tasks first (needed for delay log generation)
  const ganttTasksForDelayLogs = useMemo(() => {
    if (subProjects.length === 0 || months.length === 0) return [];
    return buildGanttTasks(subProjects, months);
  }, [subProjects, months]);

  // Initialize delay logs with hardcoded data for delayed sub-projects
  const initialDelayLogs = useMemo(() => {
    if (subProjects.length === 0 || months.length === 0) return [];
    return generateHardcodedDelayLogs(subProjects, months, ganttTasksForDelayLogs, isFinancialMode);
  }, [subProjects, months, ganttTasksForDelayLogs, isFinancialMode]);

  // Delay logs state - stored per milestone, initialized with hardcoded delays
  const [delayLogs, setDelayLogs] = useState(initialDelayLogs);

  // Update delay logs when sub-projects, months, or financial mode changes
  useEffect(() => {
    if (subProjects.length > 0 && months.length > 0) {
      const newDelayLogs = generateHardcodedDelayLogs(subProjects, months, ganttTasksForDelayLogs, isFinancialMode);

      // Only update state if the content of logs is different
      setDelayLogs(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newDelayLogs)) return prev;
        return newDelayLogs;
      });
    }
  }, [subProjects, months, ganttTasksForDelayLogs, isFinancialMode]);

  // Create adjusted sub-projects based on delay logs with impact tracking
  const adjustedSubProjects = useMemo(() => {
    return subProjects.map(subProject => {
      // Find all delay logs for this sub-project
      const subProjectDelayLogs = delayLogs.filter(log => log.taskId === subProject.id);

      if (subProjectDelayLogs.length === 0) {
        return {
          ...subProject,
          delayImpact: 0,
          originalProgress: subProject.actualProgress,
        };
      }

      // Calculate total delay impact (each delay reduces actual progress)
      const totalDelayImpact = subProjectDelayLogs.reduce((sum, log) => {
        // Impact: delayDuration days / 30 days * 5% reduction per month of delay
        // This makes delays more noticeable in the progress bar
        return sum + (log.delayDuration / 30) * 5;
      }, 0);

      // Adjust actual progress downward based on delays
      const adjustedActualProgress = Math.max(0, subProject.actualProgress - totalDelayImpact);

      return {
        ...subProject,
        actualProgress: adjustedActualProgress,
        delayImpact: totalDelayImpact,
        originalProgress: subProject.actualProgress,
      };
    });
  }, [subProjects, delayLogs]);

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
    const totalImpact = adjustedSubProjects.reduce((sum, sp) =>
      sum + ((sp).delayImpact || 0) * sp.weight, 0) / totalWeight;

    return {
      actual: Math.round(weightedActual),
      planned: Math.round(weightedPlanned),
      impact: Math.round(totalImpact),
    };
  }, [adjustedSubProjects]);

  const ganttTasks = useMemo(() => buildGanttTasks(adjustedSubProjects, months), [adjustedSubProjects, months]);

  // Default timeline month for new pictures when months load
  useEffect(() => {
    if (months.length > 0 && !pictureTimelineMonth) {
      const firstMonth = months[0];
      if (firstMonth) setPictureTimelineMonth(firstMonth);
    }
  }, [months, pictureTimelineMonth]);

  const handleAddProgressPicture = (e) => {
    const file = _optionalChain([e, 'access', _40 => _40.target, 'access', _41 => _41.files, 'optionalAccess', _42 => _42[0]]);
    if (!file || !file.type.startsWith("image/")) return;
    const month = pictureTimelineMonth || months[0] || "";
    const objectUrl = URL.createObjectURL(file);
    setProgressPictures((prev) => [
      ...prev,
      { id: `pic-${Date.now()}`, objectUrl, timelineMonth: month, caption: pictureCaption, fileName: file.name },
    ]);
    setPictureCaption("");
    e.target.value = "";
  };

  const handleRemoveProgressPicture = (id) => {
    setProgressPictures((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.objectUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleAddProgressDocument = (e) => {
    const file = _optionalChain([e, 'access', _43 => _43.target, 'access', _44 => _44.files, 'optionalAccess', _45 => _45[0]]);
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProgressDocuments((prev) => [
      ...prev,
      { id: `doc-${Date.now()}`, objectUrl, fileName: file.name },
    ]);
    e.target.value = "";
  };

  const handleRemoveProgressDocument = (id) => {
    setProgressDocuments((prev) => {
      const item = prev.find((d) => d.id === id);
      if (item) URL.revokeObjectURL(item.objectUrl);
      return prev.filter((d) => d.id !== id);
    });
  };

  const handleAddDelayLog = (log) => {
    setDelayLogs((prev) => {
      // If log has existing ID, update it; otherwise add new
      const existingIndex = prev.findIndex(l => l.id === log.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = log;
        return updated;
      }
      return [...prev, log];
    });
  };

  const handleDeleteDelayLog = (logId) => {
    setDelayLogs((prev) => prev.filter(log => log.id !== logId));
  };

  const wbsPieData = useMemo(
    () =>
      subProjects.map((s) => ({
        name: s.name,
        value: Math.max(0, s.weight),
      })),
    [subProjects]
  );

  const subProjectTimelines = useMemo(() => {
    if (timeline.length === 0) return [];
    return adjustedSubProjects.map((s) => ({
      sub: s,
      timeline: buildDeterministicSubprojectTimeline(s, timeline),
    }));
  }, [adjustedSubProjects, timeline]);

  if (subProjects.length === 0 || timeline.length === 0) {
    return (
      React.createElement(Card, { className: "border-border/50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2152 } }
        , React.createElement(CardHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2153 } }
          , React.createElement(CardTitle, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2154 } }, milestoneTitle, " — Details")
          , React.createElement(CardDescription, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2155 } }, "No WBS/timeline data found for this milestone yet. Add `subProjects` and `timeline` for the phase to enable Gantt, WBS breakdown and S-curves."

          )
        )
      )
    );
  }

  return (
    React.createElement(Card, { className: "border-2 border-primary/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2164 } }
      , React.createElement(CardHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2165 } }
        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2166 } }
          , React.createElement(CardTitle, { className: isMobile ? 'text-base' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2167 } }, milestoneTitle, " — Milestone KPIs")

        )
      )
      , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2171 } }
        , showAllTabs ? (
          React.createElement(React.Fragment, null
            /* Show all charts side by side */
            , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2175 } }
              /* Gantt Chart */
              , React.createElement('div', { className: "lg:col-span-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2177 } }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2178 } }, "Gantt Chart")
                , React.createElement(GanttMini, {
                  tasks: ganttTasks,
                  months: months,
                  baseColor: phaseColor,
                  subProjects: adjustedSubProjects,
                  delayLogs: delayLogs,
                  onAddDelayLog: handleAddDelayLog,
                  onDeleteDelayLog: handleDeleteDelayLog, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2179 }
                }
                )
                /* Overall Progress Summary with Delay Impact - beneath Gantt chart */
                , delayLogs.length > 0 && (
                  React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 mt-4 shadow-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2190 } }
                    , React.createElement('div', { className: "flex items-start gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2191 } }
                      , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2192 } })
                      , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2193 } }
                        , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2194 } }, "Delay Impact on Overall Progress"

                        )
                        , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2197 } }
                          , React.createElement('div', { className: "flex items-center gap-2 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2198 } }
                            , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2199 } }, "Current Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2199 } }, overallProgress.actual, "%"))
                            , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2200 } }, "(Impact: "
                              , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                            )
                          )
                          , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2204 } }, "Planned Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2204 } }, overallProgress.planned, "%"))
                          , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2205 } }
                            , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded affecting ", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length, " sub-project", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length !== 1 ? 's' : ''
                          )
                        )
                      )
                    )
                  )
                )
                /* Delay Log Cards - beneath Gantt chart */
                , React.createElement(DelayLogCards, {
                  delayLogs: delayLogs,
                  ganttTasks: ganttTasks,
                  subProjects: subProjects,
                  months: months,
                  onDelete: onDeleteDelayLog,
                  isMobile: isMobile,
                  isTablet: isTablet, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2214 }
                }
                )
              )

              /* WBS Breakdown */
              , React.createElement('div', { className: "lg:col-span-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2226 } }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2227 } }, "WBS Breakdown")
                , React.createElement('div', { className: "space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2228 } }
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2229 } }
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2230 } }, "WBS Weight Distribution")
                    , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2231 } }
                      , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2232 } }
                        , React.createElement(PieChart, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2233 } }
                          , React.createElement(Pie, {
                            data: wbsPieData,
                            dataKey: "value",
                            nameKey: "name",
                            cx: "50%",
                            cy: "50%",
                            outerRadius: isMobile ? 70 : isTablet ? 90 : 110,
                            labelLine: false,
                            label: ({ name, value, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                              const pct = value * 100;
                              if (pct < 6) return null;
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);

                              // Calculate the same color as the segment
                              const segmentColor = `hsl(${Math.round((index / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`;
                              const fontSize = isMobile ? '10px' : isTablet ? '11px' : '12px';

                              return (
                                React.createElement('text', {
                                  x: x,
                                  y: y,
                                  fill: segmentColor,
                                  textAnchor: x > cx ? 'start' : 'end',
                                  dominantBaseline: "central",
                                  style: {
                                    fontSize,
                                    fontWeight: 600,
                                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                                  }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2255 }
                                }

                                  , `${name}: ${(pct).toFixed(0)}%`
                                )
                              );
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2234 }
                          }

                            , wbsPieData.map((_, idx) => (
                              React.createElement(Cell, {
                                key: idx,
                                fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2273 }
                              }
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
                            }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2279 }
                          }
                          )
                          , React.createElement(Legend, {
                            wrapperStyle: {
                              fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px'
                            },
                            iconSize: isMobile ? 10 : isTablet ? 11 : 12,
                            layout: isMobile ? 'vertical' : 'horizontal',
                            verticalAlign: isMobile ? 'bottom' : 'top', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2289 }
                          }
                          )
                        )
                      )
                    )
                  )
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2301 } }
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2302 } }, "WBS Subprocess KPIs")
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2303 } }
                      , adjustedSubProjects.map((s) => {
                        const variance = s.actualProgress - s.plannedProgress;
                        return (
                          React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2307 } }
                            , React.createElement('div', { className: "min-w-0 flex-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2308 } }
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2309 } }, s.name)
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2310 } }, "Weight ", (s.weight * 100).toFixed(0), "%")
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2312 } }
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2313 } }, "Actual / Planned")
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2314 } }
                                , s.actualProgress.toFixed(1), "% / ", s.plannedProgress.toFixed(1), "%"
                              )
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2317 } }
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

              /* S-Curves */
              , React.createElement('div', { className: "lg:col-span-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2331 } }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2332 } }, "S-Curves")
                , React.createElement('div', { className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2333 } }
                  , subProjectTimelines.map(({ sub, timeline }) => (
                    React.createElement(PlannedVsActualChart, {
                      key: sub.id,
                      phaseName: sub.name,
                      timelineData: timeline,
                      color: phaseColor, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2335 }
                    }
                    )
                  ))
                )
              )
            )
          )
        ) : (
          React.createElement(Tabs, { value: tab, onValueChange: (v) => setTab(v), __self: this, __source: { fileName: _jsxFileName, lineNumber: 2347 } }
            , React.createElement(TabsList, { className: `w-full ${isMobile ? 'grid grid-cols-5' : 'justify-start flex-wrap'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2348 } }
              , React.createElement(TabsTrigger, { value: "gantt", className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2349 } }, "Gantt")
              , React.createElement(TabsTrigger, { value: "wbs", className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2350 } }, "WBS Breakdown")
              , React.createElement(TabsTrigger, { value: "scurves", className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2351 } }, "S-Curves")
              , React.createElement(TabsTrigger, { value: "logs", className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2352 } }, "Delay Logs")
              , React.createElement(TabsTrigger, { value: "documents", className: isMobile ? 'text-xs' : '', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2353 } }, "Progress Docs")
            )

            , React.createElement(TabsContent, { value: "gantt", className: "mt-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2356 } }
              , React.createElement(GanttMini, {
                tasks: ganttTasks,
                months: months,
                baseColor: phaseColor,
                subProjects: adjustedSubProjects,
                delayLogs: delayLogs,
                onAddDelayLog: handleAddDelayLog,
                onDeleteDelayLog: handleDeleteDelayLog, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2357 }
              }
              )
              /* Overall Progress Summary with Delay Impact - beneath Gantt chart */
              , delayLogs.length > 0 && (
                React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 mt-4 shadow-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2368 } }
                  , React.createElement('div', { className: "flex items-start gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2369 } }
                    , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2370 } })
                    , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2371 } }
                      , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2372 } }, "Delay Impact on Overall Progress"

                      )
                      , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2375 } }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2376 } }
                          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2377 } }, "Current Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2377 } }, overallProgress.actual, "%"))
                          , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2378 } }, "(Impact: "
                            , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                          )
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2382 } }, "Planned Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2382 } }, overallProgress.planned, "%"))
                        , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2383 } }
                          , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded affecting ", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length, " sub-project", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length !== 1 ? 's' : ''
                        )
                      )
                    )
                  )
                )
              )
              /* Delay Log Cards - beneath Gantt chart */
              , React.createElement(DelayLogCards, {
                delayLogs: delayLogs,
                ganttTasks: ganttTasks,
                subProjects: subProjects,
                months: months,
                onDelete: handleDeleteDelayLog,
                isMobile: isMobile,
                isTablet: isTablet, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2392 }
              }
              )
            )

            , React.createElement(TabsContent, { value: "wbs", className: "mt-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2403 } }
              , React.createElement('div', { className: "space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2404 } }
                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2405 } }
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2406 } }, "WBS Weight Distribution")
                  , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2407 } }
                    , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2408 } }
                      , React.createElement(PieChart, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2409 } }
                        , React.createElement(Pie, {
                          data: wbsPieData,
                          dataKey: "value",
                          nameKey: "name",
                          cx: "50%",
                          cy: "50%",
                          outerRadius: isMobile ? 70 : isTablet ? 90 : 110,
                          labelLine: false,
                          label: ({ name, value, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                            const pct = value * 100;
                            if (pct < 6) return null;
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            // Calculate the same color as the segment
                            const segmentColor = `hsl(${Math.round((index / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`;
                            const fontSize = isMobile ? '10px' : isTablet ? '11px' : '12px';

                            return (
                              React.createElement('text', {
                                x: x,
                                y: y,
                                fill: segmentColor,
                                textAnchor: x > cx ? 'start' : 'end',
                                dominantBaseline: "central",
                                style: {
                                  fontSize,
                                  fontWeight: 600,
                                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                                }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2431 }
                              }

                                , `${name}: ${(pct).toFixed(0)}%`
                              )
                            );
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2410 }
                        }

                          , wbsPieData.map((_, idx) => (
                            React.createElement(Cell, {
                              key: idx,
                              fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2449 }
                            }
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
                          }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2455 }
                        }
                        )
                        , React.createElement(Legend, {
                          wrapperStyle: {
                            fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px'
                          },
                          iconSize: isMobile ? 10 : isTablet ? 11 : 12,
                          layout: isMobile ? 'vertical' : 'horizontal',
                          verticalAlign: isMobile ? 'bottom' : 'top', __self: this, __source: { fileName: _jsxFileName, lineNumber: 2465 }
                        }
                        )
                      )
                    )
                  )
                )
                , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2477 } }
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2478 } }, "WBS Subprocess KPIs")
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2479 } }
                    , subProjects.map((s) => {
                      const variance = s.actualProgress - s.plannedProgress;
                      return (
                        React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2483 } }
                          , React.createElement('div', { className: "min-w-0 flex-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2484 } }
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2485 } }, s.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2486 } }, "Weight ", (s.weight * 100).toFixed(0), "%")
                          )
                          , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2488 } }
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2489 } }, "Actual / Planned")
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2490 } }
                              , s.actualProgress.toFixed(1), "% / ", s.plannedProgress.toFixed(1), "%"
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2493 } }
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

            , React.createElement(TabsContent, { value: "scurves", className: "mt-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2506 } }
              , React.createElement('div', { className: "grid gap-4 grid-cols-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2507 } }
                , subProjectTimelines.map(({ sub, timeline }) => (
                  React.createElement(PlannedVsActualChart, {
                    key: sub.id,
                    phaseName: sub.name,
                    timelineData: timeline,
                    color: phaseColor, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2509 }
                  }
                  )
                ))
              )
            )

            , React.createElement(TabsContent, { value: "logs", className: "mt-4 space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2519 } }
              /* Delay Impact on Overall Progress - shown in Delay Log section */
              , delayLogs.length > 0 && (
                React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 shadow-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2522 } }
                  , React.createElement('div', { className: "flex items-start gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2523 } }
                    , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2524 } })
                    , React.createElement('div', { className: "flex-1 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2525 } }
                      , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2526 } }, "Delay Impact on Overall Progress"

                      )
                      , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2529 } }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2530 } }
                          , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2531 } }, "Current Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2531 } }, overallProgress.actual, "%"))
                          , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2532 } }, "(Impact: "
                            , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                          )
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2536 } }, "Planned Progress: ", React.createElement('strong', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2536 } }, overallProgress.planned, "%"))
                        , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2537 } }
                          , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded affecting ", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length, " sub-project", adjustedSubProjects.filter(sp => (sp).delayImpact > 0).length !== 1 ? 's' : ''
                        )
                      )
                    )
                  )
                )
              )
              /* Delay Log cards - same layout as under Gantt */
              , React.createElement(DelayLogCards, {
                delayLogs: delayLogs,
                ganttTasks: ganttTasks,
                subProjects: subProjects,
                months: months,
                onDelete: handleDeleteDelayLog,
                isMobile: isMobile,
                isTablet: isTablet, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2546 }
              }
              )
              , React.createElement(DelayLogsTable, {
                delayLogs: delayLogs,
                ganttTasks: ganttTasks,
                subProjects: subProjects,
                months: months,
                onEdit: (log) => {
                  setEditingLogFromTable(log);
                  setShowEditForm(true);
                },
                onDelete: handleDeleteDelayLog,
                isMobile: isMobile,
                isTablet: isTablet, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2555 }
              }
              )
              /* Edit form dialog */
              , editingLogFromTable && (
                React.createElement(DelayLogFormDialog, {
                  open: showEditForm,
                  onOpenChange: (open) => {
                    if (!open) {
                      setShowEditForm(false);
                      setEditingLogFromTable(undefined);
                    }
                  },
                  taskName: editingLogFromTable.taskId,
                  taskId: editingLogFromTable.taskId,
                  monthIndex: editingLogFromTable.monthIndex,
                  monthName: months[editingLogFromTable.monthIndex] || `Month ${editingLogFromTable.monthIndex + 1}`,
                  months: months,
                  onSave: (log) => {
                    handleAddDelayLog(log);
                    setShowEditForm(false);
                    setEditingLogFromTable(undefined);
                  },
                  existingLog: editingLogFromTable, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2570 }
                }
                )
              )
            )

            , React.createElement(TabsContent, { value: "documents", className: "mt-4 space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2593 } }
              , React.createElement('div', { className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2594 } }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2595 } }, "Progress Pictures")
                , React.createElement('p', { className: "text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2596 } }, "Add photos with a timeline (month) so progress can be tracked over time. Each picture is linked to a period in the project timeline."

                )
                , React.createElement('div', { className: "flex flex-col sm:flex-row gap-3 flex-wrap", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2599 } }
                  , React.createElement(Select, { value: pictureTimelineMonth || months[0], onValueChange: setPictureTimelineMonth, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2600 } }
                    , React.createElement(SelectTrigger, { className: "w-full sm:w-[180px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2601 } }
                      , React.createElement(SelectValue, { placeholder: "Timeline (month)", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2602 } })
                    )
                    , React.createElement(SelectContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2604 } }
                      , months.map((m) => (
                        React.createElement(SelectItem, { key: m, value: m, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2606 } }, m)
                      ))
                    )
                  )
                  , React.createElement(Input, {
                    placeholder: "Caption (optional)",
                    value: pictureCaption,
                    onChange: (e) => setPictureCaption(e.target.value),
                    className: "flex-1 min-w-[140px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2610 }
                  }
                  )
                  , React.createElement('label', { className: "cursor-pointer", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2616 } }
                    , React.createElement('input', {
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: handleAddProgressPicture, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2617 }
                    }
                    )
                    , React.createElement(Button, { type: "button", variant: "outline", className: "w-full sm:w-auto", asChild: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2623 } }
                      , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2624 } }, React.createElement(Upload, { className: "h-4 w-4 mr-2 inline", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2624 } }), " Add Picture")
                    )
                  )
                )
                , progressPictures.length === 0 ? (
                  React.createElement('div', { className: "rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2629 } }, "No progress pictures yet. Select a timeline month and add a picture above."

                  )
                ) : (
                  React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2633 } }
                    , progressPictures.map((pic) => (
                      React.createElement('div', { key: pic.id, className: "rounded-lg border border-border/60 bg-card overflow-hidden group relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2635 } }
                        , React.createElement('div', { className: "aspect-square relative bg-muted", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2636 } }
                          , React.createElement('img', { src: pic.objectUrl, alt: pic.caption || pic.fileName, className: "w-full h-full object-cover", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2637 } })
                          , React.createElement(Badge, { className: "absolute top-2 left-2 text-xs bg-primary/90", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2638 } }, pic.timelineMonth)
                          , React.createElement(Button, {
                            size: "icon",
                            variant: "destructive",
                            className: "absolute top-2 right-2 h-7 w-7 opacity-90",
                            onClick: () => handleRemoveProgressPicture(pic.id), __self: this, __source: { fileName: _jsxFileName, lineNumber: 2639 }
                          }

                            , React.createElement(X, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2645 } })
                          )
                        )
                        , React.createElement('div', { className: "p-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2648 } }
                          , React.createElement('p', { className: "text-xs font-medium truncate", title: pic.caption || pic.fileName, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2649 } }, pic.caption || pic.fileName)
                          , React.createElement('a', { href: pic.objectUrl, download: pic.fileName, className: "inline-flex items-center gap-1 text-xs text-primary mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2650 } }
                            , React.createElement(Download, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2651 } }), " Download"
                          )
                        )
                      )
                    ))
                  )
                )
              )

              , React.createElement('div', { className: "space-y-4 pt-4 border-t", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2660 } }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2661 } }, "Progress Documents")
                , React.createElement('p', { className: "text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2662 } }, "Upload reports, certificates, or other documents. You can view and download them here."

                )
                , React.createElement('label', { className: "cursor-pointer inline-block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2665 } }
                  , React.createElement('input', { type: "file", accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*", className: "hidden", onChange: handleAddProgressDocument, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2666 } })
                  , React.createElement(Button, { type: "button", variant: "outline", asChild: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 2667 } }, React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 2667 } }, React.createElement(Upload, { className: "h-4 w-4 mr-2 inline", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2667 } }), " Add Document"))
                )
                , progressDocuments.length === 0 ? (
                  React.createElement('div', { className: "rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2670 } }, "No documents yet. Add a document above."

                  )
                ) : (
                  React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2674 } }
                    , progressDocuments.map((doc) => (
                      React.createElement('div', { key: doc.id, className: "flex items-center justify-between rounded-lg border border-border/60 bg-card p-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2676 } }
                        , React.createElement('div', { className: "flex items-center gap-3 min-w-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2677 } }
                          , React.createElement(FileText, { className: "h-8 w-8 text-muted-foreground flex-shrink-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2678 } })
                          , React.createElement('span', { className: "text-sm font-medium truncate", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2679 } }, doc.fileName)
                        )
                        , React.createElement('div', { className: "flex items-center gap-2 flex-shrink-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2681 } }
                          , React.createElement('a', { href: doc.objectUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2682 } }
                            , React.createElement(ExternalLink, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2683 } }), " View"
                          )
                          , React.createElement('a', { href: doc.objectUrl, download: doc.fileName, className: "inline-flex items-center gap-1 text-xs text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2685 } }
                            , React.createElement(Download, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2686 } }), " Download"
                          )
                          , React.createElement(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: () => handleRemoveProgressDocument(doc.id), __self: this, __source: { fileName: _jsxFileName, lineNumber: 2688 } }
                            , React.createElement(Trash2, { className: "h-4 w-4 text-destructive", __self: this, __source: { fileName: _jsxFileName, lineNumber: 2689 } })
                          )
                        )
                      )
                    ))
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}


