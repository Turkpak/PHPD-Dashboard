import React from "react";
const _jsxFileName = ""; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// ProjectActivityManagement.tsx
import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { listProjects, getProjectGanttData } from "@/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";











export default function ProjectActivityManagement() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ganttTasks, setGanttTasks] = useState([]);
  const [loadingGantt, setLoadingGantt] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [updates, setUpdates] = useState({});
  const [selectedDelayLog, setSelectedDelayLog] = useState(null);

  const parseDate = (d) => (d ? new Date(d) : null);

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  // Fetch Gantt tasks whenever project changes
  useEffect(() => {
    const fetchGantt = async () => {
      if (!selectedProjectId) {
        setGanttTasks([]);
        return;
      }
      setLoadingGantt(true);
      try {
        const tasks = await getProjectGanttData(selectedProjectId);
        setGanttTasks(tasks);
      } catch (err) {
        console.error(err);
        setGanttTasks([]);
      } finally {
        setLoadingGantt(false);
      }
    };
    fetchGantt();
  }, [selectedProjectId]);

  const filteredTasks = ganttTasks.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const childMap = useMemo(() => {
    const map = {};
    filteredTasks.forEach((task) => {
      if (task.parent) {
        if (!map[task.parent]) map[task.parent] = [];
        map[task.parent].push(task);
      }
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.start || "").localeCompare(b.start || "")));
    return map;
  }, [filteredTasks]);

  




  const displayTasks = [];
  const addChildren = (parentId, indent) => {
    if (!childMap[parentId]) return;
    childMap[parentId].forEach((child) => {
      const upd = updates[child.id];
      const isUpdated = updates[child.id] !== undefined;
      const childToPush = {
        ...child,
        start: _optionalChain([upd, 'optionalAccess', _ => _.start]) || child.start,
        end: _optionalChain([upd, 'optionalAccess', _2 => _2.end]) || child.end,
        isUpdated,
        indent,
      };
      displayTasks.push(childToPush);
      if (expandedTasks.has(child.id)) addChildren(child.id, indent + 1);
    });
  };

  filteredTasks.forEach((t) => {
    if (t.parent) return;
    const upd = updates[t.id];
    const isUpdated = updates[t.id] !== undefined;
    const taskToPush = {
      ...t,
      start: _optionalChain([upd, 'optionalAccess', _3 => _3.start]) || t.start,
      end: _optionalChain([upd, 'optionalAccess', _4 => _4.end]) || t.end,
      isUpdated,
    };
    displayTasks.push(taskToPush);
    if (expandedTasks.has(t.id)) addChildren(t.id, 1);
  });

  // Gantt calculations
  const allDates = ganttTasks
    .flatMap((t) => [t.start ? new Date(t.start) : null, t.end ? new Date(t.end) : null])
    .filter((d) => d !== null);

  const projectStart = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
  const projectEnd = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;
  const projectDuration = projectStart && projectEnd
    ? Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000*60*60*24)) + 1
    : 0;

  const dateRange = projectStart && projectEnd ? { start: projectStart, end: projectEnd } : { start: new Date(), end: new Date() };
  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000*60*60*24)) + 1;

  const getTaskPosition = (start) => {
    const startDate = parseDate(start);
    if (!startDate) return 0;
    return ((startDate.getTime() - dateRange.start.getTime()) / (1000*60*60*24) / totalDays) * 100;
  };
  const getTaskWidth = (start, end) => {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    if (!startDate || !endDate) return 2;
    const days = (endDate.getTime() - startDate.getTime()) / (1000*60*60*24) + 1;
    return (days / totalDays) * 100;
  };

  const monthsArray = useMemo(() => {
    const months = [];
    const current = new Date(dateRange.start);
    current.setDate(1);
    while (current <= dateRange.end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }, [dateRange]);

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000*60*60*24)) + 1;
  };

  return (
    React.createElement(Layout, { title: "Project Activities" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}

        /* Project Selector */
        , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}, "Select Project"

            )
          )
          , React.createElement(CardContent, { className: "pt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                , React.createElement(Label, { htmlFor: "project-select", className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}, "Project "
                   , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "*")
                )
                , React.createElement(Select, {
                  value: selectedProjectId ? String(selectedProjectId) : "",
                  onValueChange: (v) => setSelectedProjectId(v ? Number(v) : null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}}

                  , React.createElement(SelectTrigger, { className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                    , React.createElement(SelectValue, { placeholder: "Choose project" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
                    , projects.map((p) => (
                      React.createElement(SelectItem, { key: p.id, value: String(p.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
                        , p.project_name || `#${p.id}`
                      )
                    ))
                  )
                )
              )

              , React.createElement('div', { className: "relative w-full sm:w-72 mt-4 md:mt-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}} )
                , React.createElement(Input, {
                  placeholder: "Filter activities..." ,
                  className: "pl-10 h-10" ,
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
                )
              )
            )
          )
        )

        /* Gantt Chart */
        , selectedProjectId && (
          React.createElement(Card, { className: "mt-8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
            , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
              , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}, "Project Timeline (Gantt Chart)"   )
            )
            , React.createElement(CardContent, { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}
              , React.createElement('div', { className: "min-w-[1400px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
                /* Header */
                , React.createElement('div', { className: "flex border-b mb-4 text-xs font-semibold"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}
                  , React.createElement('div', { className: "w-48", __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}}, "Activity")
                  , React.createElement('div', { className: "w-20 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}, "Duration")
                  , React.createElement('div', { className: "w-32 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}, "Start Date" )
                  , React.createElement('div', { className: "w-32 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}, "Finish Date" )
                  , React.createElement('div', { className: "flex-1 grid grid-flow-col auto-cols-[120px] text-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
                    , monthsArray.map((d, i) => (
                      React.createElement('div', { key: i, className: "border-l py-1 font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
                        , d.toLocaleDateString("en-US", { month: "short" })
                        , React.createElement('div', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}, d.getFullYear())
                      )
                    ))
                  )
                )

                /* Main Project Row */
                , React.createElement('div', { className: "flex items-center gap-2 font-semibold bg-gray-100 px-2 py-1 rounded"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
                  , React.createElement('div', { className: "w-48 truncate" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
                    , _optionalChain([projects, 'access', _5 => _5.find, 'call', _6 => _6(p => p.id === selectedProjectId), 'optionalAccess', _7 => _7.project_name]), " (" , selectedProjectId, ")"
                  )
                  , React.createElement('div', { className: "w-20 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}, projectDuration, "d")
                  , React.createElement('div', { className: "w-32 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}, projectStart ? projectStart.toLocaleDateString() : "—")
                  , React.createElement('div', { className: "w-32 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}, projectEnd ? projectEnd.toLocaleDateString() : "—")
                  , React.createElement('div', { className: "flex-1 relative h-8 rounded overflow-visible bg-transparent"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}}
                    /* Plan Bar */
                    , projectStart && projectEnd && (
                      React.createElement('div', {
                        className: "absolute h-4 bg-emerald-500 rounded top-1"    ,
                        style: {
                          left: 0,
                          width: "100%",
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}
                      )
                    )
                    /* Actual Bar */
                    , React.createElement('div', {
                      className: "absolute h-2 bg-emerald-700 rounded top-4"    ,
                      style: {
                        left: 0,
                        width: `${totalDays}%`,
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}
                    )
                  )
                )

                /* Tasks */
                , React.createElement('div', { className: "space-y-2 mt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
                  , displayTasks.map((task) => {
                    const left = getTaskPosition(task.start);
                    const width = getTaskWidth(task.start, task.end);
                    const actualWidth = width * task.progress;
                    const duration = calculateDuration(task.start, task.end);
                    const delayLog =
                      task.end && task.progress < 1 && new Date(task.end) < new Date()
                        ? [`Task delayed by ${Math.ceil((new Date().getTime() - new Date(task.end).getTime())/(1000*60*60*24))} days`]
                        : [];

                    return (
                      React.createElement('div', { key: task.id, className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}}
                        /* Activity Name + Expand */
                        , React.createElement('div', { className: "w-48 truncate" , style: { paddingLeft: `${(task.indent || 0) * 16}px` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}}
                          , childMap[task.id] && childMap[task.id].length > 0 && (
                            React.createElement('button', {
                              onClick: () => {
                                const copy = new Set(expandedTasks);
                                copy.has(task.id) ? copy.delete(task.id) : copy.add(task.id);
                                setExpandedTasks(copy);
                              },
                              className: "text-xs mr-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}

                              , expandedTasks.has(task.id) ? '▾' : '▸'
                            )
                          )
                          , task.label, task.activity_id ? ` (${task.activity_id})` : ''
                        )

                        /* Duration */
                        , React.createElement('div', { className: "w-20 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}, duration, "d")

                        /* Start Date */
                        , React.createElement('div', { className: "w-32 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}, task.start ? new Date(task.start).toLocaleDateString() : "—")

                        /* Finish Date */
                        , React.createElement('div', { className: "w-32 text-center text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}, task.end ? new Date(task.end).toLocaleDateString() : "—")

                        /* Timeline Bar */
                        , React.createElement('div', { className: "flex-1 relative h-8 rounded overflow-visible bg-transparent"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}
                          , React.createElement('div', { className: "absolute h-4 bg-red-400 rounded top-1"    , style: { left: `${left}%`, width: `${width}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 304}} )
                          , React.createElement('div', { className: "absolute h-2 bg-red-700 rounded top-4"    , style: { left: `${left}%`, width: `${actualWidth}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 305}} )
                          , delayLog.length > 0 && (
                            React.createElement('div', {
                              className: "absolute h-full bg-red-900 opacity-70 cursor-pointer"    ,
                              style: { left: `${left + actualWidth}%`, width: `${width - actualWidth}%` },
                              onClick: () => setSelectedDelayLog(delayLog), __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}
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

        /* Delay Modal */
        , selectedDelayLog && (
          React.createElement(Dialog, { open: true, onOpenChange: () => setSelectedDelayLog(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}}
            , React.createElement(DialogContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}
              , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 328}}
                , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}, "Delay Log" )
              )
              , React.createElement('ul', { className: "list-disc pl-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}
                , selectedDelayLog.map((log, i) => React.createElement('li', { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}, log))
              )
            )
          )
        )

      )
    )
  );
}