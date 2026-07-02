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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectGanttTree } from "@/components/dashboard/ProjectGanttTree";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjectById, getProjectGanttData } from "@/api";


export default function ProjectDetailApi() {
  const [location, setLocation] = useLocation();

  // URL format: /project/:tehsil/:projectId
  const pathParts = location.split("/").filter(Boolean);
  const tehsilName = pathParts[1] || "";
  const projectId = pathParts[2] || "";

  const projectNumericId = useMemo(() => {
    const n = Number(projectId);
    return Number.isFinite(n) ? n : null;
  }, [projectId]);

  const { data: project, isFetching: projectLoading } = useQuery({
    queryKey: ["project-detail", projectNumericId],
    queryFn: async () => {
      if (projectNumericId == null) return null;
      return await getProjectById(projectNumericId);
    },
    enabled: projectNumericId != null,
    staleTime: 30 * 1000,
  });

  const { data: ganttTasks = [], isFetching: ganttLoading } = useQuery({
    queryKey: ["project-detail", "gantt", projectNumericId],
    queryFn: async () => {
      if (projectNumericId == null) return [];
      const tasks = await getProjectGanttData(projectNumericId);
      return Array.isArray(tasks) ? tasks : [];
    },
    enabled: projectNumericId != null,
    staleTime: 30 * 1000,
  });

  const backHref = tehsilName ? `/tehsil/${tehsilName}` : "/";

  return (
    React.createElement(Layout, { title: _optionalChain([project, 'optionalAccess', _ => _.project_name]) ? `Project â€” ${project.project_name}` : "Project Detail"}
      , React.createElement('div', { className: "p-4 sm:p-6 space-y-4"  }
        , React.createElement('div', { className: "flex items-center justify-between gap-3"   }
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setLocation(backHref), className: "shrink-0"}
            , React.createElement(ArrowLeft, { className: "h-4 w-4 mr-2"  } ), "Back"

          )
        )

        , projectNumericId == null ? (
          React.createElement(Card, { className: "border-border/60"}
            , React.createElement(CardHeader, {}
              , React.createElement(CardTitle, { className: "flex items-center gap-2"  }
                , React.createElement(AlertTriangle, { className: "h-5 w-5 text-secondary"  } ), "Invalid project id"

              )
              , React.createElement(CardDescription, {}, "This page expects a numeric project id at the end of the URL."            )
            )
          )
        ) : (
          React.createElement(React.Fragment, null
            , React.createElement(Card, { className: "border-border/60"}
              , React.createElement(CardHeader, {}
                , React.createElement(CardTitle, { className: "font-heading"}
                  , projectLoading ? React.createElement(Skeleton, { className: "h-6 w-72" } ) : _optionalChain([project, 'optionalAccess', _2 => _2.project_name]) || `Project #${projectNumericId}`
                )
                , React.createElement(CardDescription, {}
                  , projectLoading ? (
                    React.createElement(Skeleton, { className: "h-4 w-96" } )
                  ) : (
                    React.createElement(React.Fragment, null, "Division: "
                       , _nullishCoalesce(_optionalChain([project, 'optionalAccess', _3 => _3.division_name]), () => ( "â€”")), " â€¢ District: "   , _nullishCoalesce(_optionalChain([project, 'optionalAccess', _4 => _4.district_name]), () => ( "â€”")), " â€¢ Tehsil:"  , " "
                      , _nullishCoalesce(_optionalChain([project, 'optionalAccess', _5 => _5.tehsil_name]), () => ( "â€”"))
                    )
                  )
                )
              )
              , React.createElement(CardContent, { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm"    }
                , React.createElement('div', { className: "rounded-lg border border-border/50 p-3 bg-background"    }
                  , React.createElement('div', { className: "text-xs text-muted-foreground font-semibold"  }, "Budget")
                  , React.createElement('div', { className: "font-bold"}, _nullishCoalesce(_optionalChain([project, 'optionalAccess', _6 => _6.allocated_budget]), () => ( "â€”")))
                )
                , React.createElement('div', { className: "rounded-lg border border-border/50 p-3 bg-background"    }
                  , React.createElement('div', { className: "text-xs text-muted-foreground font-semibold"  }, "Start date" )
                  , React.createElement('div', { className: "font-bold"}, _nullishCoalesce(_optionalChain([project, 'optionalAccess', _7 => _7.start_date]), () => ( "â€”")))
                )
                , React.createElement('div', { className: "rounded-lg border border-border/50 p-3 bg-background"    }
                  , React.createElement('div', { className: "text-xs text-muted-foreground font-semibold"  }, "End date" )
                  , React.createElement('div', { className: "font-bold"}, _nullishCoalesce(_optionalChain([project, 'optionalAccess', _8 => _8.end_date]), () => ( "â€”")))
                )
              )
            )

            , React.createElement(Card, { className: "border-border/60"}
              , React.createElement(CardHeader, {}
                , React.createElement(CardTitle, { className: "font-heading"}, "Project Gantt" )
                , React.createElement(CardDescription, {}, "Timeline/tasks for this project."   )
              )
              , React.createElement(CardContent, {}
                , ganttLoading ? (
                  React.createElement('div', { className: "space-y-3"}
                    , React.createElement(Skeleton, { className: "h-5 w-72" } )
                    , React.createElement(Skeleton, { className: "h-72 w-full" } )
                  )
                ) : ganttTasks.length === 0 ? (
                  React.createElement('p', { className: "text-sm text-muted-foreground" }, "No Gantt data found for this project yet."       )
                ) : (
                  React.createElement(ProjectGanttTree, {
                    tasks: ganttTasks ,
                    projectName: _nullishCoalesce(_optionalChain([project, 'optionalAccess', _9 => _9.project_name]), () => ( undefined)),
                    projectId: projectNumericId,
                    readOnly: true}
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

