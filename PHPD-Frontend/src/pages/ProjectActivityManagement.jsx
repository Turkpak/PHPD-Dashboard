import React from "react";
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
// Transpiler-compatibility helpers
const _nullishCoalesce = (lhs, rhsFn) => lhs != null ? lhs : rhsFn();
const _optionalChain = (ops) => {
  let lastAccessLHS;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i]; const fn = ops[i + 1]; i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) return undefined;
    if (op === "access" || op === "optionalAccess") { lastAccessLHS = value; value = fn(value); }
    else if (op === "call" || op === "optionalCall") { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; }
  }
  return value;
};











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
    React.createElement(Layout, { title: "Project Activities" }
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       }

        /* Project Selector */
        , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  }
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    }, "Select Project"

            )
          )
          , React.createElement(CardContent, { className: "pt-4"}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"    }
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, { htmlFor: "project-select", className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    }, "Project "
                   , React.createElement('span', { className: "text-destructive"}, "*")
                )
                , React.createElement(Select, {
                  value: selectedProjectId ? String(selectedProjectId) : "",
                  onValueChange: (v) => setSelectedProjectId(v ? Number(v) : null)}

                  , React.createElement(SelectTrigger, { className: "h-10"}
                    , React.createElement(SelectValue, { placeholder: "Choose project" } )
                  )
                  , React.createElement(SelectContent, {}
                    , projects.map((p) => (
                      React.createElement(SelectItem, { key: p.id, value: String(p.id)}
                        , p.project_name || `#${p.id}`
                      )
                    ))
                  )
                )
              )

              , React.createElement('div', { className: "relative w-full sm:w-72 mt-4 md:mt-0"    }
                , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      } )
                , React.createElement(Input, {
                  placeholder: "Filter activities..." ,
                  className: "pl-10 h-10" ,
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value)}
                )
              )
            )
          )
        )

        /* Gantt Chart */
        , selectedProjectId && (
          React.createElement(Card, { className: "mt-8"}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, {}, "Project Timeline (Gantt Chart)"   )
            )
            , React.createElement(CardContent, { className: "overflow-x-auto"}
              , React.createElement('div', { className: "min-w-[1400px]"}
                /* Header */
                , React.createElement('div', { className: "flex border-b mb-4 text-xs font-semibold"    }
                  , React.createElement('div', { className: "w-48"}, "Activity")
                  , React.createElement('div', { className: "w-20 text-center" }, "Duration")
                  , React.createElement('div', { className: "w-32 text-center" }, "Start Date" )
                  , React.createElement('div', { className: "w-32 text-center" }, "Finish Date" )
                  , React.createElement('div', { className: "flex-1 grid grid-flow-col auto-cols-[120px] text-center"    }
                    , monthsArray.map((d, i) => (
                      React.createElement('div', { key: i, className: "border-l py-1 font-medium"  }
                        , d.toLocaleDateString("en-US", { month: "short" })
                        , React.createElement('div', { className: "text-[10px] text-muted-foreground" }, d.getFullYear())
                      )
                    ))
                  )
                )

                /* Main Project Row */
                , React.createElement('div', { className: "flex items-center gap-2 font-semibold bg-gray-100 px-2 py-1 rounded"       }
                  , React.createElement('div', { className: "w-48 truncate" }
                    , _optionalChain([projects, 'access', _5 => _5.find, 'call', _6 => _6(p => p.id === selectedProjectId), 'optionalAccess', _7 => _7.project_name]), " (" , selectedProjectId, ")"
                  )
                  , React.createElement('div', { className: "w-20 text-center text-xs"  }, projectDuration, "d")
                  , React.createElement('div', { className: "w-32 text-center text-xs"  }, projectStart ? projectStart.toLocaleDateString() : "â€”")
                  , React.createElement('div', { className: "w-32 text-center text-xs"  }, projectEnd ? projectEnd.toLocaleDateString() : "â€”")
                  , React.createElement('div', { className: "flex-1 relative h-8 rounded overflow-visible bg-transparent"     }
                    /* Plan Bar */
                    , projectStart && projectEnd && (
                      React.createElement('div', {
                        className: "absolute h-4 bg-emerald-500 rounded top-1"    ,
                        style: {
                          left: 0,
                          width: "100%",
                        }}
                      )
                    )
                    /* Actual Bar */
                    , React.createElement('div', {
                      className: "absolute h-2 bg-emerald-700 rounded top-4"    ,
                      style: {
                        left: 0,
                        width: `${totalDays}%`,
                      }}
                    )
                  )
                )

                /* Tasks */
                , React.createElement('div', { className: "space-y-2 mt-2" }
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
                      React.createElement('div', { key: task.id, className: "flex items-center gap-2"  }
                        /* Activity Name + Expand */
                        , React.createElement('div', { className: "w-48 truncate" , style: { paddingLeft: `${(task.indent || 0) * 16}px` }}
                          , childMap[task.id] && childMap[task.id].length > 0 && (
                            React.createElement('button', {
                              onClick: () => {
                                const copy = new Set(expandedTasks);
                                copy.has(task.id) ? copy.delete(task.id) : copy.add(task.id);
                                setExpandedTasks(copy);
                              },
                              className: "text-xs mr-1" }

                              , expandedTasks.has(task.id) ? 'â–¾' : 'â–¸'
                            )
                          )
                          , task.label, task.activity_id ? ` (${task.activity_id})` : ''
                        )

                        /* Duration */
                        , React.createElement('div', { className: "w-20 text-center text-xs"  }, duration, "d")

                        /* Start Date */
                        , React.createElement('div', { className: "w-32 text-center text-xs"  }, task.start ? new Date(task.start).toLocaleDateString() : "â€”")

                        /* Finish Date */
                        , React.createElement('div', { className: "w-32 text-center text-xs"  }, task.end ? new Date(task.end).toLocaleDateString() : "â€”")

                        /* Timeline Bar */
                        , React.createElement('div', { className: "flex-1 relative h-8 rounded overflow-visible bg-transparent"     }
                          , React.createElement('div', { className: "absolute h-4 bg-red-400 rounded top-1"    , style: { left: `${left}%`, width: `${width}%` }} )
                          , React.createElement('div', { className: "absolute h-2 bg-red-700 rounded top-4"    , style: { left: `${left}%`, width: `${actualWidth}%` }} )
                          , delayLog.length > 0 && (
                            React.createElement('div', {
                              className: "absolute h-full bg-red-900 opacity-70 cursor-pointer"    ,
                              style: { left: `${left + actualWidth}%`, width: `${width - actualWidth}%` },
                              onClick: () => setSelectedDelayLog(delayLog)}
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
          React.createElement(Dialog, { open: true, onOpenChange: () => setSelectedDelayLog(null)}
            , React.createElement(DialogContent, {}
              , React.createElement(DialogHeader, {}
                , React.createElement(DialogTitle, {}, "Delay Log" )
              )
              , React.createElement('ul', { className: "list-disc pl-6" }
                , selectedDelayLog.map((log, i) => React.createElement('li', { key: i}, log))
              )
            )
          )
        )

      )
    )
  );
}