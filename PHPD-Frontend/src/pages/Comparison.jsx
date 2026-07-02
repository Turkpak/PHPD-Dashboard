import React from "react";
import { Layout } from "@/components/layout/Layout";
import { CityCompletionChart } from "@/components/comparison/CityCompletionChart";
import { useQuery } from "@tanstack/react-query";
import { getProjectGanttAll, listDistricts, listDivisions, listProjects, listTehsils } from "@/api";

import { useMemo } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
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

export default function Comparison() {
  const { width } = useWindowSize();
  const isMobile = width < 640;

  const {
    data: divisions = [],
    isLoading: divisionsLoading,
  } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => listDivisions(),
  });

  const {
    data: districts = [],
    isLoading: districtsLoading,
  } = useQuery({
    queryKey: ["districts"],
    queryFn: () => listDistricts(),
  });

  const {
    data: tehsils = [],
    isLoading: tehsilsLoading,
  } = useQuery({
    queryKey: ["tehsils"],
    queryFn: () => listTehsils(),
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  // Project progress source of truth: root gantt task `_id:"1"` progress per project.
  const { data: projectGanttAll = [], isLoading: ganttLoading } = useQuery({
    queryKey: ["project-gantt-all"],
    queryFn: () => getProjectGanttAll(),
  });

  const ganttProgressByProjectId = useMemo(() => {
    const clampPct = (n) => Math.max(0, Math.min(100, n));
    const toPct = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? clampPct(n) : 0;
    };

    const findNodeById = (
      nodes,
      targetId,
    ) => {
      for (const n of nodes) {
        if (String(_nullishCoalesce(_nullishCoalesce(_optionalChain([n, 'optionalAccess', _ => _._id]), () => (_optionalChain([n, 'optionalAccess', _2 => _2.id]))), () => (""))) === targetId) return n;
        const children = Array.isArray(_optionalChain([n, 'optionalAccess', _3 => _3.subtasks])) ? n.subtasks : [];
        const hit = children.length ? findNodeById(children, targetId) : null;
        if (hit) return hit;
      }
      return null;
    };

    const map = new Map();
    for (const s of projectGanttAll) {
      const pid = Number(_optionalChain([s, 'optionalAccess', _4 => _4._id]));
      if (!Number.isFinite(pid)) continue;
      const tasks = Array.isArray(_optionalChain([s, 'optionalAccess', _5 => _5.tasks])) ? s.tasks : [];
      const root = _nullishCoalesce(_nullishCoalesce(findNodeById(tasks, "1"), () => (tasks[0])), () => (null));
      map.set(pid, toPct(_optionalChain([root, 'optionalAccess', _6 => _6.progress])));
    }
    return map;
  }, [projectGanttAll]);

  const divisionCompletionData = useMemo(() => {
    if (
      divisionsLoading ||
      districtsLoading ||
      tehsilsLoading ||
      projectsLoading ||
      ganttLoading
    )
      return [];
    if (!Array.isArray(divisions) || divisions.length === 0) return [];

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
      return count > 0 ? Math.max(0, Math.min(100, sum / count)) : 0;
    };

    // Hierarchical rollup:
    // tehsil overall = avg(project root progress in tehsil)
    // district overall = avg(tehsil overalls in district)
    // division overall = avg(district overalls in division)
    return divisions
      .map((div) => {
        const divDistricts = districts.filter((d) => d.division === div.id);
        const districtOveralls = [];

        for (const dist of divDistricts) {
          const distTehsils = tehsils.filter((t) => t.district === dist.id);
          const tehsilOveralls = [];

          for (const tehsil of distTehsils) {
            const tehsilProjects = projects.filter((p) => p.tehsil === tehsil.id);
            // Only count tehsils that have at least one project with gantt progress.
            const overall = calcProjectsOverall(tehsilProjects);
            if (tehsilProjects.length > 0) tehsilOveralls.push(overall);
          }

          if (tehsilOveralls.length > 0) {
            districtOveralls.push(avg(tehsilOveralls));
          } else {
            // If a district has no tehsils/projects, treat it as 0% rather than skipping it.
            districtOveralls.push(0);
          }
        }

        const completion = Math.round(avg(districtOveralls));

        return {
          city: `${div.division_name} Division`,
          completion: Math.min(100, Math.max(0, completion)),
        };
      })
      .sort((a, b) => b.completion - a.completion);
  }, [
    divisionsLoading,
    districtsLoading,
    tehsilsLoading,
    projectsLoading,
    ganttLoading,
    divisions,
    districts,
    tehsils,
    projects,
    ganttProgressByProjectId,
  ]);


  return (
    React.createElement(Layout, { title: isMobile ? "CITY COMPARISON" : "City Comparison - Smart Safe Cities" }
      , React.createElement('div', { className: "flex flex-col gap-4 sm:gap-6 w-full min-w-0" }
        /* Header Section */


        /* City Completion Comparison Chart */
        , React.createElement(CityCompletionChart, {
          cityData: divisionCompletionData,
          description: "Zone Wise Progress"
        }
        )
      )
    )
  );
}