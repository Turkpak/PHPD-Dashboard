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
  return Array.from({ length: childCount }).map((_, i) => `${parentName} â€” Task ${i + 1}`);
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
      name: _nullishCoalesce(childNames[i], () => (`${parent.name} â€” Task ${i + 1}`)),
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
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange }
      , React.createElement(DialogContent, { className: "sm:max-w-[550px] p-0 overflow-hidden border-2 border-primary/10 shadow-2xl max-h-[90vh] flex flex-col" }
        , React.createElement(DialogHeader, { className: "p-6 pb-2" }
          , React.createElement('div', { className: "flex items-center gap-3" }
            , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm" }
              , React.createElement(Calendar, { className: "h-5 w-5" })
            )
            , React.createElement('div', {}
              , React.createElement(DialogTitle, { className: "text-xl font-bold font-heading" }
                , existingLog ? "Edit" : "Add", " Delay Log"
              )
              , React.createElement(DialogDescription, { className: "text-xs mt-1" }
                , taskName.length > 40 ? taskName.substring(0, 40) + "..." : taskName
              )
            )
          )
        )

        , React.createElement('form', { onSubmit: handleSubmit, className: "flex flex-col flex-1 overflow-hidden" }
          , React.createElement(ScrollArea, { className: "flex-1 max-h-[65vh] px-6 py-2" }
            , React.createElement('div', { className: "space-y-5 pb-4" }
              , React.createElement('div', { className: "space-y-2" }
                , React.createElement(Label, { htmlFor: "loggedBy", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Logged By ", React.createElement('span', { className: "text-destructive" }, "*"))
                , React.createElement('div', { className: "relative" }
                  , React.createElement(Input, {
                    id: "loggedBy",
                    placeholder: "Enter your name or ID",
                    value: formData.loggedBy,
                    onChange: (e) => setFormData({ ...formData, loggedBy: e.target.value }),
                    className: "pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true
                  }
                  )
                  , React.createElement(AlertCircle, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60" })
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4" }
                , React.createElement('div', { className: "space-y-2" }
                  , React.createElement(Label, { htmlFor: "delayDate", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Delay Date ", React.createElement('span', { className: "text-destructive" }, "*"))
                  , React.createElement(Input, {
                    id: "delayDate",
                    type: "date",
                    min: minDate,
                    max: maxDate,
                    value: formData.delayDate,
                    onChange: (e) => setFormData({ ...formData, delayDate: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true
                  }
                  )
                  , minDate && maxDate && (
                    React.createElement('p', { className: "text-[10px] text-muted-foreground" }, "Within planned timeline: ", minDate, " to ", maxDate)
                  )
                )
                , React.createElement('div', { className: "space-y-2" }
                  , React.createElement(Label, { htmlFor: "delayDuration", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Duration (Days) ", React.createElement('span', { className: "text-destructive" }, "*"))
                  , React.createElement(Input, {
                    id: "delayDuration",
                    type: "number",
                    min: "1",
                    placeholder: "1",
                    value: formData.delayDuration,
                    onChange: (e) => setFormData({ ...formData, delayDuration: e.target.value }),
                    className: "h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all",
                    required: true
                  }
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2" }
                , React.createElement(Label, { htmlFor: "reason", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Reason for Delay ", React.createElement('span', { className: "text-destructive" }, "*"))
                , React.createElement(Textarea, {
                  id: "reason",
                  placeholder: "Describe the reason for the delay in detail...",
                  value: formData.reason,
                  onChange: (e) => setFormData({ ...formData, reason: e.target.value }),
                  rows: 3,
                  className: "bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all resize-none p-3",
                  required: true
                }
                )
              )

              , React.createElement('div', { className: "space-y-2" }
                , React.createElement(Label, { htmlFor: "image", className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Evidence Image (Optional)")
                , React.createElement('div', { className: "space-y-3" }
                  , formData.imagePreview ? (
                    React.createElement('div', { className: "relative group rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900 shadow-md" }
                      , React.createElement('img', {
                        src: formData.imagePreview,
                        alt: "Delay evidence",
                        className: "w-full h-40 object-cover"
                      }
                      )
                      , React.createElement('div', { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" }
                        , React.createElement(Button, {
                          type: "button",
                          variant: "destructive",
                          size: "sm",
                          className: "h-8 rounded-full shadow-lg",
                          onClick: handleRemoveImage
                        }

                          , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1" }), " Remove"
                        )
                      )
                    )
                  ) : (
                    React.createElement('div', {
                      className: "relative border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all rounded-xl p-8 text-center group cursor-pointer",
                      onClick: () => _optionalChain([document, 'access', _20 => _20.getElementById, 'call', _21 => _21('image'), 'optionalAccess', _22 => _22.click, 'call', _23 => _23()])
                    }
                      , React.createElement(ImageIcon, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" })
                      , React.createElement('div', { className: "space-y-1" }
                        , React.createElement('p', { className: "text-sm font-semibold text-foreground/80" }, "Click to upload image")
                        , React.createElement('p', { className: "text-[10px] text-muted-foreground" }, "PNG, JPG or JPEG up to 5MB")
                      )
                      , React.createElement(Input, {
                        id: "image",
                        type: "file",
                        accept: "image/*",
                        onChange: handleImageChange,
                        className: "hidden"
                      }
                      )
                    )
                  )
                )
              )
            )
          )

          , React.createElement(DialogFooter, { className: "p-6 pt-2 bg-muted/10 border-t border-border/50" }
            , React.createElement(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), className: "h-11 rounded-xl px-6" }, "Cancel"

            )
            , React.createElement(Button, {
              type: "submit",
              disabled: !formData.loggedBy.trim() || !formData.reason.trim(),
              className: "h-11 rounded-xl px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95"
            }

              , React.createElement(Plus, { className: "h-4 w-4 mr-2" })
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
    React.createElement('div', { className: "mt-6 space-y-4" }
      , React.createElement('div', { className: "flex items-center gap-2" }
        , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400" })
        , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground` }, "Delay Logs ("
          , delayLogs.length, " total)"
        )
      )

      , React.createElement('div', { className: `grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'}` }
        , sortedLogs.map((log) => {
          const taskName = getTaskName(log.taskId);
          const subProject = _optionalChain([subProjects, 'optionalAccess', _27 => _27.find, 'call', _28 => _28(sp => sp.id === log.taskId)]);
          const variance = subProject
            ? Math.max(0, subProject.plannedProgress - subProject.actualProgress)
            : 0;
          const displayDate = log.loggedAt || log.delayDate;

          return (
            React.createElement(Card, { key: log.id, className: "border-amber-200 dark:border-orange-800 bg-amber-50/80 dark:bg-orange-950/20 rounded-xl overflow-hidden shadow-sm" }
              , React.createElement(CardContent, { className: "p-4" }
                , React.createElement('div', { className: "space-y-3" }
                  /* Task title */
                  , React.createElement('h4', { className: `${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground truncate`, title: taskName }
                    , taskName
                  )

                  /* Red status badge: X% behind schedule */
                  , variance > 0 && (
                    React.createElement(Badge, { variant: "destructive", className: "rounded-md px-2.5 py-1 text-xs font-semibold" }
                      , variance.toFixed(1), "% behind schedule"
                    )
                  )

                  /* Timeline: Month (calendar) + Duration (clock) - button-like */
                  , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground" }
                      , React.createElement(Calendar, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400" })
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                    , React.createElement('span', { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-orange-700 bg-white dark:bg-orange-950/40 px-2.5 py-1.5 text-xs font-medium text-foreground" }
                      , React.createElement(Clock, { className: "h-3.5 w-3.5 text-amber-600 dark:text-orange-400" })
                      , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                    )
                  )

                  /* Reason for delay */
                  , React.createElement('p', { className: "text-sm text-muted-foreground leading-snug", title: log.reason }
                    , log.reason
                  )

                  /* Image display */
                  , log.imageUrl && (
                    React.createElement('div', { className: "relative rounded-lg overflow-hidden border border-amber-200 dark:border-orange-800" }
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
                        }
                      }
                      )
                      , React.createElement('div', { className: "absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1" }
                        , React.createElement(ImageIcon, { className: "h-3 w-3" }), "Evidence"

                      )
                    )
                  )

                  /* Attribution and date */
                  , React.createElement('div', { className: "flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-amber-200/80 dark:border-orange-800/80" }
                    , React.createElement('span', {}, "By: ", log.loggedBy)
                    , React.createElement('span', {}, new Date(displayDate).toLocaleDateString())
                  )

                  /* Delete button beneath each delay log card */
                  , onDelete && (
                    React.createElement('div', { className: "pt-3 mt-2 border-t border-amber-200/80 dark:border-orange-800/80" }
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        className: "w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
                        onClick: () => {
                          if (confirm("Delete this delay log?")) {
                            onDelete(log.id);
                          }
                        }
                      }

                        , React.createElement(Trash2, { className: "h-4 w-4" }), "Delete delay log"

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
      React.createElement('div', { className: "text-center py-12 text-muted-foreground border border-border rounded-lg" }
        , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50" })
        , React.createElement('p', { className: "text-sm font-medium" }, "No delay logs recorded yet")
        , React.createElement('p', { className: "text-xs mt-1" }, "Delay logs will appear here when you log delays in the Gantt chart.")
      )
    );
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...delayLogs].sort((a, b) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  return (
    React.createElement('div', { className: "space-y-4" }
      , React.createElement('div', { className: "flex items-center justify-between" }
        , React.createElement('div', { className: "text-sm text-muted-foreground" }
          , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
        )
      )

      , React.createElement('div', { className: "border border-border rounded-lg overflow-hidden" }
        , React.createElement('div', { className: "overflow-x-auto" }
          , React.createElement(Table, {}
            , React.createElement(TableHeader, {}
              , React.createElement(TableRow, {}
                , React.createElement(TableHead, { className: isMobile ? 'w-[120px]' : '' }, "Task Name")
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '' }, "Month")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '' }, "Logged By")
                , React.createElement(TableHead, { className: isMobile ? 'w-[80px]' : '' }, "Duration")
                , React.createElement(TableHead, { className: isMobile ? 'hidden' : '' }, "Reason")
                , React.createElement(TableHead, { className: isMobile ? 'w-[100px]' : '' }, "Date")
                , React.createElement(TableHead, { className: "w-[100px] text-right" }, "Actions")
              )
            )
            , React.createElement(TableBody, {}
              , sortedLogs.map((log) => (
                React.createElement(TableRow, { key: log.id }
                  , React.createElement(TableCell, { className: `font-medium ${isMobile ? 'text-xs' : ''}` }
                    , React.createElement('div', { className: "max-w-[200px] truncate", title: getTaskName(log.taskId) }
                      , getTaskName(log.taskId)
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '' }
                    , React.createElement(Badge, { variant: "outline", className: "gap-1" }
                      , React.createElement(Calendar, { className: "h-3 w-3" })
                      , months[log.monthIndex] || `M${log.monthIndex + 1}`
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : '' }
                    , log.loggedBy
                  )
                  , React.createElement(TableCell, {}
                    , React.createElement(Badge, { variant: "secondary", className: "gap-1" }
                      , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'hidden' : '' }
                    , React.createElement('div', { className: "max-w-[300px] truncate text-sm text-muted-foreground", title: log.reason }
                      , log.reason
                    )
                  )
                  , React.createElement(TableCell, { className: isMobile ? 'text-xs' : 'text-sm' }
                    , new Date(log.loggedAt).toLocaleDateString()
                  )
                  , React.createElement(TableCell, {}
                    , React.createElement('div', { className: "flex items-center justify-end gap-2" }
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => onEdit(log),
                        className: "h-8 w-8 p-0",
                        title: "Edit log"
                      }

                        , React.createElement(Edit2, { className: "h-4 w-4" })
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
                        title: "Delete log"
                      }

                        , React.createElement(Trash2, { className: "h-4 w-4" })
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
        React.createElement('div', { className: "space-y-2" }
          , sortedLogs.map((log) => (
            React.createElement('div', { key: log.id, className: "border border-border rounded-lg p-3 bg-card/50" }
              , React.createElement('div', { className: "flex items-start justify-between gap-2 mb-2" }
                , React.createElement('div', { className: "flex-1 min-w-0" }
                  , React.createElement('div', { className: "font-medium text-sm truncate" }, getTaskName(log.taskId))
                  , React.createElement('div', { className: "text-xs text-muted-foreground mt-1" }
                    , months[log.monthIndex] || `Month ${log.monthIndex + 1}`, " â€¢ ", log.loggedBy
                  )
                )
                , React.createElement('div', { className: "flex items-center gap-1" }
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => onEdit(log),
                    className: "h-7 w-7 p-0"
                  }

                    , React.createElement(Edit2, { className: "h-3.5 w-3.5" })
                  )
                  , React.createElement(Button, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => {
                      if (confirm("Delete this delay log?")) {
                        onDelete(log.id);
                      }
                    },
                    className: "h-7 w-7 p-0 text-destructive"
                  }

                    , React.createElement(Trash2, { className: "h-3.5 w-3.5" })
                  )
                )
              )
              , React.createElement('div', { className: "text-xs text-muted-foreground mb-2" }, log.reason)
              , React.createElement('div', { className: "flex items-center gap-2" }
                , React.createElement(Badge, { variant: "secondary", className: "text-xs" }
                  , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                )
                , React.createElement('span', { className: "text-xs text-muted-foreground" }
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
        existingLog: editingLog
      }
      )
    );
  }

  return (
    React.createElement(Dialog, { open: open, onOpenChange: onOpenChange }
      , React.createElement(DialogContent, { className: "sm:max-w-[600px] max-h-[80vh]" }
        , React.createElement(DialogHeader, {}
          , React.createElement(DialogTitle, {}, "Delay Logs for ", taskName)
          , React.createElement(DialogDescription, {}, "View and manage delay logs for "
            , monthName, ". Delay logs are displayed as orange bars in the Gantt chart."
          )
        )
        , React.createElement('div', { className: "space-y-4 py-4" }
          , React.createElement('div', { className: "flex items-center justify-between" }
            , React.createElement('div', { className: "text-sm text-muted-foreground" }
              , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
            )
            , React.createElement(Button, { onClick: handleAddNew, size: "sm", className: "gap-2" }
              , React.createElement(Plus, { className: "h-4 w-4" }), "Add New Log"

            )
          )

          , delayLogs.length === 0 ? (
            React.createElement('div', { className: "text-center py-8 text-muted-foreground" }
              , React.createElement(AlertCircle, { className: "h-12 w-12 mx-auto mb-2 opacity-50" })
              , React.createElement('p', {}, "No delay logs recorded yet.")
              , React.createElement('p', { className: "text-xs mt-1" }, "Click \"Add New Log\" to record a delay.")
            )
          ) : (
            React.createElement(ScrollArea, { className: "h-[400px] pr-4" }
              , React.createElement('div', { className: "space-y-3" }
                , delayLogs.map((log) => (
                  React.createElement('div', {
                    key: log.id,
                    className: "border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                  }

                    , React.createElement('div', { className: "flex items-start justify-between gap-4" }
                      , React.createElement('div', { className: "flex-1 space-y-2" }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                          , React.createElement(Badge, { variant: "outline", className: "gap-1" }
                            , React.createElement(Calendar, { className: "h-3 w-3" })
                            , new Date(log.loggedAt).toLocaleDateString()
                          )
                          , React.createElement(Badge, { variant: "secondary" }
                            , log.delayDuration, " day", log.delayDuration !== 1 ? 's' : ''
                          )
                        )
                        , React.createElement('div', {}
                          , React.createElement('p', { className: "text-sm font-medium" }, "Logged by: ", log.loggedBy)
                          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1" }, log.reason)
                        )
                      )
                      , React.createElement('div', { className: "flex items-center gap-2" }
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleEdit(log),
                          className: "h-8 w-8 p-0"
                        }

                          , React.createElement(Edit2, { className: "h-4 w-4" })
                        )
                        , React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          onClick: () => handleDelete(log.id),
                          className: "h-8 w-8 p-0 text-destructive hover:text-destructive"
                        }

                          , React.createElement(Trash2, { className: "h-4 w-4" })
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )
        , React.createElement(DialogFooter, {}
          , React.createElement(Button, { variant: "outline", onClick: () => onOpenChange(false) }, "Close"

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
    React.createElement('div', { className: "space-y-4" }
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
          onDelete: handleDeleteDelayLog
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
          defaultDate: selectedBarForLog.clickDate
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
            monthName: months[selectedRowForDelayLog.startIdx] || "â€”",
            months: months,
            onSave: (log) => {
              handleSaveDelayLog(log);
              setRowAddLogOpen(false);
              setSelectedRowForDelayLog(null);
            },
            defaultDate: defaultInRange,
            minDate: minDate,
            maxDate: maxDate
          }
          )
        );
      })()

      /* Legend for delay logs and progress */
      , React.createElement('div', { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50" }
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement('div', { className: "flex flex-col gap-0.5 h-5 w-6 rounded-sm overflow-hidden border border-border" }
            , React.createElement('div', { className: "flex-1 bg-emerald-600 min-h-[2px]", title: "Planned (top)" })
            , React.createElement('div', { className: "flex-1 bg-emerald-600 min-h-[2px]", title: "Actual (bottom)" })
          )
          , React.createElement('span', {}, "Bar: top = Planned, bottom = Actual (same color)")
        )
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement(MoreVertical, { className: "h-4 w-4 text-muted-foreground" })
          , React.createElement('span', {}, "Options (â‹¯) per row: Add delay log (within planned timeline). Delete via button beneath each delay log card.")
        )
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement('div', { className: "h-2 w-2 rounded-full bg-emerald-600" })
          , React.createElement('span', {}, "Click on Gantt bars to add delay log")
        )
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement('div', { className: "h-1.5 w-4 bg-orange-500 rounded" })
          , React.createElement('span', {}, "Delay log marker (positioned by date)")
        )
        , delayLogs && delayLogs.length > 0 && (
          React.createElement('div', { className: "flex items-center gap-2 text-xs" }
            , React.createElement('div', { className: "flex items-center gap-1 text-orange-600 dark:text-orange-400" }
              , React.createElement(AlertTriangle, { className: "h-3.5 w-3.5" })
              , React.createElement('span', { className: "font-medium" }
                , delayLogs.length, " delay log", delayLogs.length !== 1 ? 's' : '', " recorded"
              )
            )
          )
        )
      )

      /* Gantt Chart Container with full border */
      , React.createElement('div', { className: "border-2 border-border rounded-lg overflow-hidden bg-background" }
        /* Header row with month labels */
        , React.createElement('div', { className: `grid border-b-2 border-border bg-muted/30 ${isMobile ? 'overflow-x-auto min-w-full' : ''}`, style: { gridTemplateColumns: gridCols } }
          , React.createElement('div', { className: `${isMobile ? 'p-1.5 text-[10px]' : 'p-2 text-xs'} font-bold text-muted-foreground border-r-2 border-border bg-muted/40` }, "WBS Subprocess")
          , months.map((m, idx) => {
            const { label, dateRange } = getMonthHeaderLabel(m, GANTT_CHART_YEAR);
            return (
              React.createElement('div', {
                key: m,
                className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-r-2 border-border bg-muted/40 flex flex-col items-center justify-center gap-0.5`
              }

                , React.createElement('span', {}, isMobile ? label.replace(` ${GANTT_CHART_YEAR}`, "'26") : label)
                , React.createElement('span', { className: `font-normal opacity-90 ${isMobile ? 'text-[8px]' : 'text-[10px]'}` }, dateRange)
              )
            );
          })
          , React.createElement('div', { className: `${isMobile ? 'p-1 text-[9px]' : 'p-2 text-xs'} font-semibold text-center text-muted-foreground border-border bg-muted/40 flex items-center justify-center`, title: "Add delay log (within planned timeline)" }, "Options"

          )
        )

        /* Task rows */
        , React.createElement('div', { className: `space-y-1 ${isMobile ? 'overflow-x-auto min-w-full' : ''}` }
          , tasks.map((t) => {
            const isExpanded = _nullishCoalesce(expanded[t.id], () => (true));
            const hasChildren = (_nullishCoalesce(_optionalChain([t, 'access', _38 => _38.children, 'optionalAccess', _39 => _39.length]), () => (0))) > 0;
            const subProject = getSubProjectForTask(t.id);
            const progress = getProgressPercentage(t, subProject);
            const plannedPct = getPlannedPercentage(t, subProject);
            const responsible = getResponsiblePerson(t.id, t.name);
            const span = t.endIdx - t.startIdx + 1;

            return (
              React.createElement('div', { key: t.id, className: "space-y-1" }
                /* Parent task row */
                , React.createElement('div', { className: `grid border-l-2 border-r-2 border-b-2 border-border relative ${isMobile ? 'min-w-full' : 'overflow-hidden'} bg-background`, style: { gridTemplateColumns: gridCols } }
                  /* Left label column */
                  , React.createElement('div', { className: "p-2 border-r-2 border-border flex items-center gap-2 min-w-0 relative z-5 bg-muted/20", onClick: (e) => e.stopPropagation() }
                    , hasChildren && (
                      React.createElement('button', {
                        type: "button",
                        onClick: (e) => toggle(t.id, e),
                        onMouseDown: (e) => e.stopPropagation(),
                        className: "h-5 w-5 rounded border border-border/60 bg-background hover:bg-muted/40 transition-colors flex items-center justify-center flex-shrink-0 relative z-10",
                        title: isExpanded ? "Collapse" : "Expand"
                      }

                        , React.createElement('span', { className: "text-[10px] font-bold leading-none" }, isExpanded ? "âˆ’" : "+")
                      )
                    )
                    , React.createElement('div', { className: "min-w-0 flex-1" }
                      , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-foreground truncate` }, t.name)
                      , React.createElement('div', { className: `${isMobile ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground` }, "Weight "
                        , (t.weight * 100).toFixed(0), "% â€¢", " "
                        , React.createElement('span', {
                          className:
                            t.status === "ahead"
                              ? "text-emerald-600"
                              : t.status === "behind"
                                ? "text-red-600"
                                : "text-emerald-700"
                          
                        }

                          , t.status === "ontrack" ? "On track" : t.status === "ahead" ? "Ahead" : "Behind"
                        )
                      )
                    )
                  )

                  /* Timeline container - month columns only (Actions column is last) */
                  , React.createElement('div', { className: "relative border-r-2 border-border", style: { gridColumn: `2 / span ${n}` } }
                    /* Grid cells for timeline - background cells */
                    , React.createElement('div', { className: "grid h-12", style: { gridTemplateColumns: `repeat(${n}, 1fr)` } }
                      , months.map((m, monthIdx) => {
                        const taskHasDelay = hasDelay(t);
                        const delayLogsForMonth = getDelayLogsForTask(t.id, monthIdx);
                        const isInTaskRange = monthIdx >= t.startIdx && monthIdx <= t.endIdx;

                        return (
                          React.createElement('div', {
                            key: m,
                            className: "border-r-2 border-border last:border-r-0 bg-muted/20 relative"
                          }

                            /* Clickable area to add delay log - only show if task is in range */
                            , isInTaskRange && (
                              React.createElement('button', {
                                type: "button",
                                onClick: (e) => handleBarClick(e, t.id, t.name, monthIdx),
                                className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer",
                                title: "Click anywhere on this cell to add a delay log"
                              }
                              )
                            )
                            /* Delay log indicators - positioned based on date within month - more visible with icons */
                            , delayLogsForMonth.length > 0 && (
                              React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-11" }
                                , delayLogsForMonth.map((log) => {
                                  const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                  return (
                                    React.createElement('div', {
                                      key: log.id,
                                      className: "absolute group",
                                      style: {
                                        left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                      }
                                    }

                                      /* Indicator bar */
                                      , React.createElement('div', { className: "h-2.5 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-5 min-w-[4px]" })
                                      /* Icon badge */
                                      , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600" }
                                        , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white" })
                                      )
                                      /* Tooltip */
                                      , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs" }
                                        , React.createElement('div', { className: "font-semibold flex items-center gap-1" }
                                          , React.createElement(Clock, { className: "h-3 w-3" }), "Delay Logged"

                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-90 mt-0.5" }, log.reason)
                                        , log.imageUrl && (
                                          React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2" }
                                            , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1" }
                                              , React.createElement(ImageIcon, { className: "h-3 w-3" }), "Evidence Image:"

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
                                              }
                                            }
                                            )
                                          )
                                        )
                                        , React.createElement('div', { className: "text-[10px] opacity-75" }, log.delayDuration, " days â€¢ ", new Date(log.delayDate).toLocaleDateString())
                                        , React.createElement('div', { className: "text-[10px] opacity-75" }, "By: ", log.loggedBy)
                                        , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" })
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
                          title: "Click on the bar to add a delay log at this position"
                        }

                          /* Horizontal split: top = Planned, bottom = Actual (same dark color, no white tone) */
                          , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8" }
                            /* Top half: Planned progress */
                            , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20" }
                              , React.createElement('div', {
                                className: "h-full transition-all duration-300",
                                style: { width: `${Math.min(100, Math.max(0, plannedPct))}%`, backgroundColor: fillColor },
                                title: `Planned: ${plannedPct}%`
                              }
                              )
                            )
                            /* Bottom half: Actual progress */
                            , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative" }
                              , React.createElement('div', {
                                className: "h-full transition-all duration-300",
                                style: { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: fillColor },
                                title: `Actual: ${progress}%`
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
                                  title: `Delay impact: ${((subProject).delayImpact).toFixed(1)}%`
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
                                }
                              }

                                /* Vertical marker line */
                                , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-1 bg-orange-500 shadow-lg border-l border-r border-orange-600" })
                                /* Icon indicator at top */
                                , React.createElement('div', { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600" }
                                  , React.createElement(AlertTriangle, { className: "h-2 w-2 text-white" })
                                )
                                /* Tooltip on hover */
                                , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-15 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-xl max-w-xs" }
                                  , React.createElement('div', { className: "font-semibold" }, "Delay Logged")
                                  , React.createElement('div', { className: "text-[10px] opacity-90" }, log.reason)
                                  , React.createElement('div', { className: "text-[10px] opacity-75" }, log.delayDuration, " days â€¢ ", new Date(log.delayDate).toLocaleDateString())
                                  , React.createElement('div', { className: "text-[10px] opacity-75" }, "By: ", log.loggedBy)
                                  , log.imageUrl && (
                                    React.createElement('div', { className: "mt-2 border-t border-gray-700 pt-2" }
                                      , React.createElement('div', { className: "text-[10px] opacity-75 mb-1 flex items-center gap-1" }
                                        , React.createElement(ImageIcon, { className: "h-3 w-3" }), "Evidence Image:"

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
                                        }
                                      }
                                      )
                                    )
                                  )
                                  , React.createElement('div', { className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" })
                                )
                              )
                            );
                          })
                          /* Text content */
                          , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} font-semibold text-white truncate flex-1 pointer-events-none relative z-20 px-2 flex items-center h-full` }
                            , React.createElement('div', { className: "flex-1 min-w-0" }
                              , React.createElement('div', { className: "truncate flex items-center gap-1" }
                                , subProject && (subProject).delayImpact > 0 && (
                                  React.createElement(AlertTriangle, { className: "h-2.5 w-2.5 text-orange-300 flex-shrink-0", title: `${((subProject).delayImpact).toFixed(1)}% impact from delays` })
                                )
                                , React.createElement('span', { className: "truncate" }, responsible)
                              )
                              , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} opacity-95 flex items-center gap-1.5 flex-wrap` }
                                , React.createElement('span', { title: "Top strip = Planned" }, React.createElement('span', { className: "opacity-80" }, "P:"), plannedPct, "%")
                                , React.createElement('span', { className: "opacity-60" }, "|")
                                , React.createElement('span', { title: "Bottom strip = Actual" }, React.createElement('span', { className: "opacity-80" }, "A:"), progress, "%")
                                , subProject && (subProject).delayImpact > 0 && (
                                  React.createElement('span', { className: "text-orange-200", title: `Delay impact: ${((subProject).delayImpact).toFixed(0)}%` }, "(-"
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
                  , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1" }
                    , React.createElement(DropdownMenu, {}
                      , React.createElement(DropdownMenuTrigger, { asChild: true }
                        , React.createElement('button', {
                          type: "button",
                          onClick: (e) => e.stopPropagation(),
                          className: "h-8 w-8 rounded-md border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                          title: "Options"
                        }

                          , React.createElement(MoreVertical, { className: "h-4 w-4" })
                        )
                      )
                      , React.createElement(DropdownMenuContent, { align: "end", className: "w-56" }
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
                          }
                        }

                          , React.createElement(Plus, { className: "h-4 w-4 mr-2" }), "Add delay log"

                        )
                      )
                    )
                  )
                )

                /* Child task rows */
                , hasChildren && isExpanded && (
                  React.createElement('div', { className: "space-y-0.5 pl-6" }
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
                          style: { gridTemplateColumns: gridCols }
                        }

                          /* Left label column */
                          , React.createElement('div', { className: "p-1.5 border-r-2 border-border min-w-0 relative z-10 bg-muted/10" }
                            , React.createElement('div', { className: `${isMobile ? 'text-[11px]' : 'text-xs'} font-medium text-foreground/90 truncate` }, c.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[8px]' : 'text-[9px]'} text-muted-foreground` }, "Weight "
                              , (c.weight * 100).toFixed(0), "%"
                            )
                          )

                          /* Timeline container - month columns only */
                          , React.createElement('div', { className: "relative border-r-2 border-border", style: { gridColumn: `2 / span ${n}` } }
                            /* Grid cells for timeline - background cells */
                            , React.createElement('div', { className: "grid h-10", style: { gridTemplateColumns: `repeat(${n}, 1fr)` } }
                              , months.map((m, monthIdx) => {
                                const childHasDelay = c.status === "behind";
                                const delayLogsForMonth = getDelayLogsForTask(c.id, monthIdx);
                                const isInTaskRange = monthIdx >= c.startIdx && monthIdx <= c.endIdx;

                                return (
                                  React.createElement('div', {
                                    key: m,
                                    className: "border-r-2 border-border last:border-r-0 bg-muted/10 relative"
                                  }

                                    /* Clickable area to add delay log for child tasks */
                                    , isInTaskRange && (
                                      React.createElement('button', {
                                        type: "button",
                                        onClick: (e) => handleBarClick(e, c.id, c.name, monthIdx),
                                        className: "absolute inset-0 w-full h-full z-10 opacity-0 hover:opacity-5 hover:bg-emerald-600 transition-opacity cursor-pointer",
                                        title: "Click anywhere on this cell to add a delay log"
                                      }
                                      )
                                    )
                                    /* Delay log indicators for child tasks - positioned based on date - more visible with icons */
                                    , delayLogsForMonth.length > 0 && (
                                      React.createElement('div', { className: "absolute bottom-0 left-0 right-0 z-25" }
                                        , delayLogsForMonth.map((log) => {
                                          const positionPercent = getDatePositionInMonth(log.delayDate, monthIdx);
                                          return (
                                            React.createElement('div', {
                                              key: log.id,
                                              className: "absolute group",
                                              style: {
                                                left: `${Math.max(0, Math.min(100, positionPercent - 2.5))}%`,
                                              }
                                            }

                                              /* Indicator bar */
                                              , React.createElement('div', { className: "h-2 bg-orange-500 rounded-t border-t-2 border-orange-600 shadow-md w-4 min-w-[3px]" })
                                              /* Icon badge */
                                              , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600" }
                                                , React.createElement(AlertTriangle, { className: "h-1 w-1 text-white" })
                                              )
                                              /* Tooltip */
                                              , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs" }
                                                , React.createElement('div', { className: "font-semibold" }, "Delay")
                                                , React.createElement('div', { className: "opacity-90" }, log.reason)
                                                , React.createElement('div', { className: "opacity-75" }, log.delayDuration, "d")
                                                , log.imageUrl && (
                                                  React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1" }
                                                    , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1" }
                                                      , React.createElement(ImageIcon, { className: "h-2.5 w-2.5" }), "Evidence:"

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
                                                      }
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
                                  title: "Click on the bar to add a delay log at this position"
                                }

                                  /* Horizontal split: top = Planned, bottom = Actual */
                                  , React.createElement('div', { className: "absolute inset-0 flex flex-col z-8" }
                                    , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch border-b border-black/20" }
                                      , React.createElement('div', {
                                        className: "h-full transition-all duration-300",
                                        style: { width: `${Math.min(100, Math.max(0, childPlannedPct))}%`, backgroundColor: childFillColor },
                                        title: `Planned: ${childPlannedPct}%`
                                      }
                                      )
                                    )
                                    , React.createElement('div', { className: "flex-1 min-h-0 flex items-stretch relative" }
                                      , React.createElement('div', {
                                        className: "h-full transition-all duration-300",
                                        style: { width: `${Math.min(100, Math.max(0, childProgress))}%`, backgroundColor: childFillColor },
                                        title: `Actual: ${childProgress}%`
                                      }
                                      )
                                      , childSubProject && (childSubProject).delayImpact > 0 && (childSubProject).originalProgress > childProgress && (
                                        React.createElement('div', {
                                          className: "absolute top-0 bottom-0 bg-red-500/50 border-r-2 border-red-600/60 transition-all duration-300",
                                          style: {
                                            left: `${Math.min(100, Math.max(0, childProgress))}%`,
                                            width: `${Math.min(100 - childProgress, (childSubProject).delayImpact)}%`,
                                          },
                                          title: `Delay impact: ${((childSubProject).delayImpact).toFixed(1)}%`
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
                                        }
                                      }

                                        /* Vertical marker line */
                                        , React.createElement('div', { className: "absolute top-0 bottom-0 left-1/2 w-0.5 bg-orange-500 shadow-md border-l border-r border-orange-600" })
                                        /* Icon indicator at top */
                                        , React.createElement('div', { className: "absolute -top-0.5 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full p-0.5 shadow-md border border-orange-600" }
                                          , React.createElement(AlertTriangle, { className: "h-1.5 w-1.5 text-white" })
                                        )
                                        /* Tooltip on hover */
                                        , React.createElement('div', { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 shadow-xl max-w-xs" }
                                          , React.createElement('div', { className: "font-semibold" }, "Delay")
                                          , React.createElement('div', { className: "opacity-90" }, log.reason)
                                          , React.createElement('div', { className: "opacity-75" }, log.delayDuration, "d")
                                          , log.imageUrl && (
                                            React.createElement('div', { className: "mt-1 border-t border-gray-700 pt-1" }
                                              , React.createElement('div', { className: "opacity-75 mb-1 flex items-center gap-1" }
                                                , React.createElement(ImageIcon, { className: "h-2.5 w-2.5" }), "Evidence:"

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
                                                }
                                              }
                                              )
                                            )
                                          )
                                        )
                                      )
                                    );
                                  })
                                  /* Text content: Actual / Planned */
                                  , React.createElement('div', { className: `${isMobile ? 'text-[7px]' : 'text-[8px]'} font-medium text-white truncate flex-1 pointer-events-none relative z-20 px-1.5 flex items-center h-full drop-shadow-md` }
                                    , React.createElement('div', { className: "flex-1 min-w-0" }
                                      , React.createElement('div', { className: "truncate" }, childResponsible)
                                      , React.createElement('div', { className: `${isMobile ? 'text-[6px]' : 'text-[7px]'} opacity-95 flex items-center gap-1` }
                                        , React.createElement('span', { title: "Top = Planned" }, "P:", childPlannedPct, "%")
                                        , React.createElement('span', { className: "opacity-60" }, "|")
                                        , React.createElement('span', { title: "Bottom = Actual" }, "A:", childProgress, "%")
                                      )
                                    )
                                  )
                                )
                              );
                            })()
                          )
                          /* Actions column for child row: options menu */
                          , React.createElement('div', { className: "flex items-center justify-center border-border bg-muted/10 p-1" }
                            , React.createElement(DropdownMenu, {}
                              , React.createElement(DropdownMenuTrigger, { asChild: true }
                                , React.createElement('button', {
                                  type: "button",
                                  onClick: (e) => e.stopPropagation(),
                                  className: "h-7 w-7 rounded-md border border-border/60 bg-background hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                                  title: "Options"
                                }

                                  , React.createElement(MoreVertical, { className: "h-3.5 w-3.5" })
                                )
                              )
                              , React.createElement(DropdownMenuContent, { align: "end", className: "w-56" }
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
                                  }
                                }

                                  , React.createElement(Plus, { className: "h-4 w-4 mr-2" }), "Add delay log"

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
      React.createElement(Card, { className: "border-border/50" }
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, milestoneTitle, " â€” Details")
          , React.createElement(CardDescription, {}, "No WBS/timeline data found for this milestone yet. Add `subProjects` and `timeline` for the phase to enable Gantt, WBS breakdown and S-curves."

          )
        )
      )
    );
  }

  return (
    React.createElement(Card, { className: "border-2 border-primary/10" }
      , React.createElement(CardHeader, {}
        , React.createElement('div', {}
          , React.createElement(CardTitle, { className: isMobile ? 'text-base' : '' }, milestoneTitle, " â€” Milestone KPIs")

        )
      )
      , React.createElement(CardContent, { className: "space-y-4" }
        , showAllTabs ? (
          React.createElement(React.Fragment, null
            /* Show all charts side by side */
            , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }
              /* Gantt Chart */
              , React.createElement('div', { className: "lg:col-span-1" }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3` }, "Gantt Chart")
                , React.createElement(GanttMini, {
                  tasks: ganttTasks,
                  months: months,
                  baseColor: phaseColor,
                  subProjects: adjustedSubProjects,
                  delayLogs: delayLogs,
                  onAddDelayLog: handleAddDelayLog,
                  onDeleteDelayLog: handleDeleteDelayLog
                }
                )
                /* Overall Progress Summary with Delay Impact - beneath Gantt chart */
                , delayLogs.length > 0 && (
                  React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 mt-4 shadow-sm" }
                    , React.createElement('div', { className: "flex items-start gap-3" }
                      , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5" })
                      , React.createElement('div', { className: "flex-1 min-w-0" }
                        , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2" }, "Delay Impact on Overall Progress"

                        )
                        , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1" }
                          , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                            , React.createElement('span', {}, "Current Progress: ", React.createElement('strong', {}, overallProgress.actual, "%"))
                            , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium" }, "(Impact: "
                              , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                            )
                          )
                          , React.createElement('div', {}, "Planned Progress: ", React.createElement('strong', {}, overallProgress.planned, "%"))
                          , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5" }
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
                  isTablet: isTablet
                }
                )
              )

              /* WBS Breakdown */
              , React.createElement('div', { className: "lg:col-span-1" }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3` }, "WBS Breakdown")
                , React.createElement('div', { className: "space-y-6" }
                  , React.createElement('div', {}
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2` }, "WBS Weight Distribution")
                    , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}` }
                      , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                        , React.createElement(PieChart, {}
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
                                  }
                                }

                                  , `${name}: ${(pct).toFixed(0)}%`
                                )
                              );
                            }
                          }

                            , wbsPieData.map((_, idx) => (
                              React.createElement(Cell, {
                                key: idx,
                                fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`
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
                            }
                          }
                          )
                          , React.createElement(Legend, {
                            wrapperStyle: {
                              fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px'
                            },
                            iconSize: isMobile ? 10 : isTablet ? 11 : 12,
                            layout: isMobile ? 'vertical' : 'horizontal',
                            verticalAlign: isMobile ? 'bottom' : 'top'
                          }
                          )
                        )
                      )
                    )
                  )
                  , React.createElement('div', {}
                    , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2` }, "WBS Subprocess KPIs")
                    , React.createElement('div', { className: "space-y-2" }
                      , adjustedSubProjects.map((s) => {
                        const variance = s.actualProgress - s.plannedProgress;
                        return (
                          React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50` }
                            , React.createElement('div', { className: "min-w-0 flex-1" }
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate` }, s.name)
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground` }, "Weight ", (s.weight * 100).toFixed(0), "%")
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}` }
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground` }, "Actual / Planned")
                              , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums` }
                                , s.actualProgress.toFixed(1), "% / ", s.plannedProgress.toFixed(1), "%"
                              )
                              , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}` }
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
              , React.createElement('div', { className: "lg:col-span-1" }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold mb-3` }, "S-Curves")
                , React.createElement('div', { className: "space-y-4" }
                  , subProjectTimelines.map(({ sub, timeline }) => (
                    React.createElement(PlannedVsActualChart, {
                      key: sub.id,
                      phaseName: sub.name,
                      timelineData: timeline,
                      color: phaseColor
                    }
                    )
                  ))
                )
              )
            )
          )
        ) : (
          React.createElement(Tabs, { value: tab, onValueChange: (v) => setTab(v) }
            , React.createElement(TabsList, { className: `w-full ${isMobile ? 'grid grid-cols-5' : 'justify-start flex-wrap'}` }
              , React.createElement(TabsTrigger, { value: "gantt", className: isMobile ? 'text-xs' : '' }, "Gantt")
              , React.createElement(TabsTrigger, { value: "wbs", className: isMobile ? 'text-xs' : '' }, "WBS Breakdown")
              , React.createElement(TabsTrigger, { value: "scurves", className: isMobile ? 'text-xs' : '' }, "S-Curves")
              , React.createElement(TabsTrigger, { value: "logs", className: isMobile ? 'text-xs' : '' }, "Delay Logs")
              , React.createElement(TabsTrigger, { value: "documents", className: isMobile ? 'text-xs' : '' }, "Progress Docs")
            )

            , React.createElement(TabsContent, { value: "gantt", className: "mt-4" }
              , React.createElement(GanttMini, {
                tasks: ganttTasks,
                months: months,
                baseColor: phaseColor,
                subProjects: adjustedSubProjects,
                delayLogs: delayLogs,
                onAddDelayLog: handleAddDelayLog,
                onDeleteDelayLog: handleDeleteDelayLog
              }
              )
              /* Overall Progress Summary with Delay Impact - beneath Gantt chart */
              , delayLogs.length > 0 && (
                React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 mt-4 shadow-sm" }
                  , React.createElement('div', { className: "flex items-start gap-3" }
                    , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5" })
                    , React.createElement('div', { className: "flex-1 min-w-0" }
                      , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2" }, "Delay Impact on Overall Progress"

                      )
                      , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1" }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                          , React.createElement('span', {}, "Current Progress: ", React.createElement('strong', {}, overallProgress.actual, "%"))
                          , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium" }, "(Impact: "
                            , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                          )
                        )
                        , React.createElement('div', {}, "Planned Progress: ", React.createElement('strong', {}, overallProgress.planned, "%"))
                        , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5" }
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
                isTablet: isTablet
              }
              )
            )

            , React.createElement(TabsContent, { value: "wbs", className: "mt-4" }
              , React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', {}
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2` }, "WBS Weight Distribution")
                  , React.createElement('div', { className: `w-full ${isMobile ? 'h-[280px]' : isTablet ? 'h-[320px]' : 'h-[340px]'}` }
                    , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                      , React.createElement(PieChart, {}
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
                                }
                              }

                                , `${name}: ${(pct).toFixed(0)}%`
                              )
                            );
                          }
                        }

                          , wbsPieData.map((_, idx) => (
                            React.createElement(Cell, {
                              key: idx,
                              fill: `hsl(${Math.round((idx / Math.max(1, wbsPieData.length)) * 280)} 75% 55%)`
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
                          }
                        }
                        )
                        , React.createElement(Legend, {
                          wrapperStyle: {
                            fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px'
                          },
                          iconSize: isMobile ? 10 : isTablet ? 11 : 12,
                          layout: isMobile ? 'vertical' : 'horizontal',
                          verticalAlign: isMobile ? 'bottom' : 'top'
                        }
                        )
                      )
                    )
                  )
                )
                , React.createElement('div', {}
                  , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2` }, "WBS Subprocess KPIs")
                  , React.createElement('div', { className: "space-y-2" }
                    , subProjects.map((s) => {
                      const variance = s.actualProgress - s.plannedProgress;
                      return (
                        React.createElement('div', { key: s.id, className: `flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'} bg-card/50` }
                          , React.createElement('div', { className: "min-w-0 flex-1" }
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-semibold truncate` }, s.name)
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground` }, "Weight ", (s.weight * 100).toFixed(0), "%")
                          )
                          , React.createElement('div', { className: `${isMobile ? 'text-left' : 'text-right'}` }
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground` }, "Actual / Planned")
                            , React.createElement('div', { className: `${isMobile ? 'text-xs' : 'text-sm'} font-bold tabular-nums` }
                              , s.actualProgress.toFixed(1), "% / ", s.plannedProgress.toFixed(1), "%"
                            )
                            , React.createElement('div', { className: `${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold ${variance >= 0 ? "text-emerald-600" : "text-red-600"}` }
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

            , React.createElement(TabsContent, { value: "scurves", className: "mt-4" }
              , React.createElement('div', { className: "grid gap-4 grid-cols-1" }
                , subProjectTimelines.map(({ sub, timeline }) => (
                  React.createElement(PlannedVsActualChart, {
                    key: sub.id,
                    phaseName: sub.name,
                    timelineData: timeline,
                    color: phaseColor
                  }
                  )
                ))
              )
            )

            , React.createElement(TabsContent, { value: "logs", className: "mt-4 space-y-6" }
              /* Delay Impact on Overall Progress - shown in Delay Log section */
              , delayLogs.length > 0 && (
                React.createElement('div', { className: "bg-amber-50/80 dark:bg-orange-950/30 border border-amber-200 dark:border-orange-800 rounded-xl p-4 shadow-sm" }
                  , React.createElement('div', { className: "flex items-start gap-3" }
                    , React.createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600 dark:text-orange-400 flex-shrink-0 mt-0.5" })
                    , React.createElement('div', { className: "flex-1 min-w-0" }
                      , React.createElement('div', { className: "text-sm font-bold text-amber-900 dark:text-orange-100 mb-2" }, "Delay Impact on Overall Progress"

                      )
                      , React.createElement('div', { className: "text-xs text-amber-800 dark:text-orange-200 space-y-1" }
                        , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                          , React.createElement('span', {}, "Current Progress: ", React.createElement('strong', {}, overallProgress.actual, "%"))
                          , React.createElement('span', { className: "text-amber-700 dark:text-orange-400 font-medium" }, "(Impact: "
                            , overallProgress.impact > 0 ? `-${overallProgress.impact}%` : '0%', ")"
                          )
                        )
                        , React.createElement('div', {}, "Planned Progress: ", React.createElement('strong', {}, overallProgress.planned, "%"))
                        , React.createElement('div', { className: "text-[11px] opacity-90 mt-1.5" }
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
                isTablet: isTablet
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
                isTablet: isTablet
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
                  existingLog: editingLogFromTable
                }
                )
              )
            )

            , React.createElement(TabsContent, { value: "documents", className: "mt-4 space-y-6" }
              , React.createElement('div', { className: "space-y-4" }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold` }, "Progress Pictures")
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Add photos with a timeline (month) so progress can be tracked over time. Each picture is linked to a period in the project timeline."

                )
                , React.createElement('div', { className: "flex flex-col sm:flex-row gap-3 flex-wrap" }
                  , React.createElement(Select, { value: pictureTimelineMonth || months[0], onValueChange: setPictureTimelineMonth }
                    , React.createElement(SelectTrigger, { className: "w-full sm:w-[180px]" }
                      , React.createElement(SelectValue, { placeholder: "Timeline (month)" })
                    )
                    , React.createElement(SelectContent, {}
                      , months.map((m) => (
                        React.createElement(SelectItem, { key: m, value: m }, m)
                      ))
                    )
                  )
                  , React.createElement(Input, {
                    placeholder: "Caption (optional)",
                    value: pictureCaption,
                    onChange: (e) => setPictureCaption(e.target.value),
                    className: "flex-1 min-w-[140px]"
                  }
                  )
                  , React.createElement('label', { className: "cursor-pointer" }
                    , React.createElement('input', {
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: handleAddProgressPicture
                    }
                    )
                    , React.createElement(Button, { type: "button", variant: "outline", className: "w-full sm:w-auto", asChild: true }
                      , React.createElement('span', {}, React.createElement(Upload, { className: "h-4 w-4 mr-2 inline" }), " Add Picture")
                    )
                  )
                )
                , progressPictures.length === 0 ? (
                  React.createElement('div', { className: "rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground" }, "No progress pictures yet. Select a timeline month and add a picture above."

                  )
                ) : (
                  React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" }
                    , progressPictures.map((pic) => (
                      React.createElement('div', { key: pic.id, className: "rounded-lg border border-border/60 bg-card overflow-hidden group relative" }
                        , React.createElement('div', { className: "aspect-square relative bg-muted" }
                          , React.createElement('img', { src: pic.objectUrl, alt: pic.caption || pic.fileName, className: "w-full h-full object-cover" })
                          , React.createElement(Badge, { className: "absolute top-2 left-2 text-xs bg-primary/90" }, pic.timelineMonth)
                          , React.createElement(Button, {
                            size: "icon",
                            variant: "destructive",
                            className: "absolute top-2 right-2 h-7 w-7 opacity-90",
                            onClick: () => handleRemoveProgressPicture(pic.id)
                          }

                            , React.createElement(X, { className: "h-3.5 w-3.5" })
                          )
                        )
                        , React.createElement('div', { className: "p-2" }
                          , React.createElement('p', { className: "text-xs font-medium truncate", title: pic.caption || pic.fileName }, pic.caption || pic.fileName)
                          , React.createElement('a', { href: pic.objectUrl, download: pic.fileName, className: "inline-flex items-center gap-1 text-xs text-primary mt-1" }
                            , React.createElement(Download, { className: "h-3 w-3" }), " Download"
                          )
                        )
                      )
                    ))
                  )
                )
              )

              , React.createElement('div', { className: "space-y-4 pt-4 border-t" }
                , React.createElement('h3', { className: `${isMobile ? 'text-sm' : 'text-base'} font-bold` }, "Progress Documents")
                , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Upload reports, certificates, or other documents. You can view and download them here."

                )
                , React.createElement('label', { className: "cursor-pointer inline-block" }
                  , React.createElement('input', { type: "file", accept: ".pdf,.doc,.docx,.xls,.xlsx,image/*", className: "hidden", onChange: handleAddProgressDocument })
                  , React.createElement(Button, { type: "button", variant: "outline", asChild: true }, React.createElement('span', {}, React.createElement(Upload, { className: "h-4 w-4 mr-2 inline" }), " Add Document"))
                )
                , progressDocuments.length === 0 ? (
                  React.createElement('div', { className: "rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground" }, "No documents yet. Add a document above."

                  )
                ) : (
                  React.createElement('div', { className: "space-y-2" }
                    , progressDocuments.map((doc) => (
                      React.createElement('div', { key: doc.id, className: "flex items-center justify-between rounded-lg border border-border/60 bg-card p-3" }
                        , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                          , React.createElement(FileText, { className: "h-8 w-8 text-muted-foreground flex-shrink-0" })
                          , React.createElement('span', { className: "text-sm font-medium truncate" }, doc.fileName)
                        )
                        , React.createElement('div', { className: "flex items-center gap-2 flex-shrink-0" }
                          , React.createElement('a', { href: doc.objectUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary" }
                            , React.createElement(ExternalLink, { className: "h-3.5 w-3.5" }), " View"
                          )
                          , React.createElement('a', { href: doc.objectUrl, download: doc.fileName, className: "inline-flex items-center gap-1 text-xs text-primary" }
                            , React.createElement(Download, { className: "h-3.5 w-3.5" }), " Download"
                          )
                          , React.createElement(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: () => handleRemoveProgressDocument(doc.id) }
                            , React.createElement(Trash2, { className: "h-4 w-4 text-destructive" })
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

