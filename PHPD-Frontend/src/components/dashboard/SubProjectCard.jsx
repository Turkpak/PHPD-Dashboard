import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";



























export function SubProjectCard({ subProject, color, isExpanded = false }) {
  const variance = subProject.actualProgress - subProject.plannedProgress;
  const varianceColor = variance >= 0 ? "text-emerald-600" : "text-red-600";
  const status = variance >= 0 ? "Ahead" : "Behind";
  
  return (
    React.createElement(Card, { className: cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      "border-l-2 border-l-current",
      "bg-card/50"
    ), style: { borderLeftColor: color }}
      , React.createElement(CardContent, { className: "p-3"}
        , React.createElement('div', { className: "flex items-center justify-between mb-2"   }
          , React.createElement('div', { className: "flex-1 min-w-0" }
            , React.createElement('h4', { className: "text-sm font-semibold text-foreground truncate"   }
              , subProject.name
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  }, "Weight: "
               , (subProject.weight * 100).toFixed(0), "%"
            )
          )
          , React.createElement('div', { className: cn("text-xs font-bold px-2 py-1 rounded", varianceColor, "bg-muted/50")}
            , status, " " , Math.abs(variance).toFixed(1), "%"
          )
        )

        , React.createElement('div', { className: "space-y-2"}
          /* Actual Progress */
          , React.createElement('div', {}
            , React.createElement('div', { className: "flex justify-between text-xs mb-1"   }
              , React.createElement('span', { className: "text-muted-foreground"}, "Actual")
              , React.createElement('span', { className: "font-semibold text-foreground" }, subProject.actualProgress.toFixed(1), "%")
            )
            , React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/50"     }
              , React.createElement('div', { 
                className: "h-full rounded-full transition-all duration-500"   ,
                style: { width: `${Math.min(100, subProject.actualProgress)}%`, backgroundColor: color }}
              )
            )
          )

          /* Planned Progress */
          , React.createElement('div', {}
            , React.createElement('div', { className: "flex justify-between text-xs mb-1"   }
              , React.createElement('span', { className: "text-muted-foreground"}, "Planned")
              , React.createElement('span', { className: "font-semibold text-foreground" }, subProject.plannedProgress.toFixed(1), "%")
            )
            , React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/50"     }
              , React.createElement('div', { 
                className: "h-full rounded-full transition-all duration-500 border-2 border-dashed"     ,
                style: { 
                  width: `${Math.min(100, subProject.plannedProgress)}%`, 
                  backgroundColor: "transparent",
                  borderColor: color,
                  opacity: 0.5
                }}
              )
            )
          )
        )
      )
    )
  );
}

