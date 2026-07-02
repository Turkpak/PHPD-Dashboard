import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Car, Users, Activity } from "lucide-react";

const INCIDENTS = [
  { id: 1, type: "Traffic", location: "Mall Road Junction", time: "2 min ago", priority: "high", icon: Car },
  { id: 2, type: "Crowd", location: "Liberty Market", time: "5 min ago", priority: "medium", icon: Users },
  { id: 3, type: "Emergency", location: "General Hospital", time: "12 min ago", priority: "critical", icon: Activity },
  { id: 4, type: "Traffic", location: "Canal Bank Road", time: "15 min ago", priority: "low", icon: Car },
  { id: 5, type: "Crowd", location: "Gaddafi Stadium", time: "22 min ago", priority: "medium", icon: Users },
  { id: 6, type: "Traffic", location: "Ferozepur Road", time: "30 min ago", priority: "high", icon: Car },
];

export function IncidentList() {
  return (
    React.createElement('div', { className: "rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col"       }
      , React.createElement('div', { className: "p-4 pb-2" }
        , React.createElement('h3', { className: "font-heading font-semibold text-lg flex items-center gap-2"     }
          , React.createElement(AlertTriangle, { className: "h-5 w-5 text-destructive"  } ), "Live Incidents"

          , React.createElement(Badge, { variant: "destructive", className: "ml-auto animate-pulse" }, "3 Active" )
        )
      )
      , React.createElement(ScrollArea, { className: "flex-1 h-[300px] md:h-auto p-2"   }
        , React.createElement('div', { className: "space-y-2"}
          , INCIDENTS.map((inc) => (
            React.createElement('div', { key: inc.id, className: "flex items-start gap-2 p-2 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors"        }
              , React.createElement('div', { className: `p-1.5 rounded-full shrink-0 ${
                inc.priority === 'critical' ? 'bg-destructive/20 text-destructive' :
                inc.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                'bg-emerald-600/20 text-emerald-600'
              }`}
                , React.createElement(inc.icon, { className: "h-3.5 w-3.5" } )
              )
              , React.createElement('div', { className: "flex-1 space-y-0.5 min-w-0"  }
                , React.createElement('div', { className: "flex items-center justify-between gap-2"   }
                  , React.createElement('p', { className: "text-sm font-medium leading-tight truncate"   }, inc.type, " Alert" )
                  , React.createElement('span', { className: "text-xs text-muted-foreground shrink-0"  }, inc.time)
                )
                , React.createElement('p', { className: "text-xs text-muted-foreground truncate"  }, inc.location)
              )
              , inc.priority === 'critical' && (
                React.createElement('div', { className: "h-2 w-2 rounded-full bg-destructive animate-ping mt-1 shrink-0"      } )
              )
            )
          ))
        )
      )
    )
  );
}
