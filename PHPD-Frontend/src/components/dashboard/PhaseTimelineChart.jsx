import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";














export function PhaseTimelineChart({ timelineData, cityKey = "default" }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  if (!timelineData || timelineData.length === 0) {
    return null;
  }

  const gradientIds = {
    surveys: `gradient-surveys-${cityKey}`,
    foundations: `gradient-foundations-${cityKey}`,
    cabinet: `gradient-cabinet-${cityKey}`,
    cable: `gradient-cable-${cityKey}`,
    controlRoom: `gradient-controlRoom-${cityKey}`,
    ppic3: `gradient-ppic3-${cityKey}`,
  };

  return (
    React.createElement(Card, {
      className: "shadow-lg border-2 transition-colors"  ,
      style: {
        borderColor: "var(--progress-accent-border, hsl(var(--border)))",
        boxShadow: "0 12px 30px var(--progress-accent-glow, transparent)",
        backgroundImage: [
          "radial-gradient(650px circle at 18% 14%, var(--progress-accent-soft, transparent), transparent 55%)",
          "linear-gradient(180deg, var(--progress-accent-soft, transparent), transparent 55%)",
        ].join(", "),
      }}

      , React.createElement(CardHeader, { className: "pb-4"}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  }, "Phase Evolution Timeline"  )
        , React.createElement(CardDescription, { className: "text-sm"}, "All milestone progress over time"    )
      )
      , React.createElement(CardContent, {}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '280px' : isTablet ? '320px' : '350px' }}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%"}
            , React.createElement(AreaChart, { data: timelineData, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 5 : 0 
            }, key: cityKey}
            , React.createElement('defs', {}
              , React.createElement('linearGradient', { id: gradientIds.surveys, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#2F8F6C", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#2F8F6C", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientIds.foundations, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#2E7D32", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#2E7D32", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientIds.cabinet, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#f59e0b", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#f59e0b", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientIds.cable, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#a855f7", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#a855f7", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientIds.controlRoom, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#ef4444", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientIds.ppic3, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#eab308", stopOpacity: 0.0})
                , React.createElement('stop', { offset: "95%", stopColor: "#eab308", stopOpacity: 0})
              )
            )
            , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))"} )
            , React.createElement(XAxis, { 
              dataKey: "month", 
              axisLine: false, 
              tickLine: false, 
              tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }} 
            )
            , React.createElement(YAxis, { 
              domain: [0, 100],
              axisLine: false, 
              tickLine: false, 
              width: isMobile ? 35 : 50,
              tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }} 
            )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              },
              formatter: (value, name) => [`${value}%`, name]}
            )
            , React.createElement(Legend, { 
              wrapperStyle: { fontSize: isMobile ? '10px' : '12px' }}
            )
            , React.createElement(Area, { type: "monotone", dataKey: "surveys", stackId: "1", stroke: "#2F8F6C", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
            , React.createElement(Area, { type: "monotone", dataKey: "foundations", stackId: "1", stroke: "#2E7D32", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
            , React.createElement(Area, { type: "monotone", dataKey: "cabinet", stackId: "1", stroke: "#f59e0b", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
            , React.createElement(Area, { type: "monotone", dataKey: "cable", stackId: "1", stroke: "#a855f7", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
            , React.createElement(Area, { type: "monotone", dataKey: "controlRoom", stackId: "1", stroke: "#ef4444", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
            , React.createElement(Area, { type: "monotone", dataKey: "ppic3", stackId: "1", stroke: "#eab308", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2} )
          )
        )
        )
      )
    )
  );
}

