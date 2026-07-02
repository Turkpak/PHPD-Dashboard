import React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

import { listProjects, getProjectGanttData } from "@/api";
import { ProjectGanttTree } from "@/components/dashboard/ProjectGanttTree";















export function ProjectGanttChart({ projectId: propProjectId, searchQuery = "" }) {
  // allow internal selection when no projectId is passed
  const [selectedProjectId, setSelectedProjectId] = useState(
    propProjectId != null ? propProjectId : null
  );
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);

  // fetch list of projects only when we need a selector
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    enabled: propProjectId == null,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDelayLog, setSelectedDelayLog] = useState(null);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });

  const loadGantt = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    try {
      setLoading(true);
      const fetchedTasks = await getProjectGanttData(selectedProjectId);
      // Backend now provides real progress in 0..100 and proper dates (including rollups for WBS nodes).
      const normalized = (fetchedTasks || []).map((t) => ({
        ...t,
        progress:
          typeof t?.progress === "number" && Number.isFinite(t.progress)
            ? Math.max(0, Math.min(100, t.progress))
            : 0,
      }));

      setTasks(normalized);

      const starts = normalized.map((t) => t.start && new Date(t.start)).filter(Boolean) ;
      const ends = normalized.map((t) => t.end && new Date(t.end)).filter(Boolean) ;
      if (starts.length && ends.length) {
        setDateRange({
          start: new Date(Math.min(...starts.map((d) => d.getTime()))),
          end: new Date(Math.max(...ends.map((d) => d.getTime()))),
        });
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load Gantt data");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadGantt();
  }, [loadGantt]);

  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000*60*60*24)) + 1;

  const getTaskPosition = (start) => {
    if (!start) return 0;
    const startDate = new Date(start);
    return ((startDate.getTime() - dateRange.start.getTime()) / (1000*60*60*24) / totalDays) * 100;
  };

  const getTaskWidth = (start, end) => {
    if (!start || !end) return 2;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return ((endDate.getTime() - startDate.getTime()) / (1000*60*60*24) + 1) / totalDays * 100;
  };

  const progressColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
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

  const filteredTasks = tasks.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQueryLocal.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQueryLocal.toLowerCase())
  );

  // if we are in selector mode and no project chosen yet, prompt user
  if (!propProjectId && !selectedProjectId) {
    return React.createElement('div', { className: "py-8 text-center text-muted-foreground"  }, "Please select a project above to view the Gantt chart."         );
  }

  if (loading) return React.createElement('div', {}, "Loading...");
  if (error || filteredTasks.length === 0) return React.createElement('div', {}, "No tasks found."  );

  return (
    React.createElement(React.Fragment, null
      /* selector UI only when propProjectId wasn't provided */
      , !propProjectId && (
        React.createElement(Card, { className: "border-none shadow-sm overflow-hidden mb-4"   }
          , React.createElement(CardHeader, { className: "pb-2"}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    }, "Select Project"

            )
          )
          , React.createElement(CardContent, { className: "pt-4"}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6"   }
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
                  value: searchQueryLocal,
                  onChange: (e) => setSearchQueryLocal(e.target.value)}
                )
              )
            )
          )
        )
      )

      , React.createElement(Card, { className: "mt-8"}
        , React.createElement(CardHeader, {}
          , React.createElement(CardTitle, {}, "Project Timeline (Gantt Chart)"   )
        )
        , React.createElement(CardContent, {}
          , React.createElement(ProjectGanttTree, {
            tasks: filteredTasks,
            projectId: selectedProjectId ?? undefined,
            projectName:
              selectedProjectId != null
                ? (projects.find((p) => p.id === selectedProjectId)?.project_name ?? `#${selectedProjectId}`)
                : undefined,
            onDelayLogSaved: loadGantt,
            onProgressSaved: loadGantt}
          )
        )
      )
    )
  );
}
