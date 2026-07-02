import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";















export function TrendChart({ cityData, cityKey = "default" }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  // Default data if no cityData provided
  const defaultData = [
    { month: "Jan", surveys: 45, foundations: 20, cabinet: 15, cable: 10, controlRoom: 5, ppic3: 2, overall: 20 },
    { month: "Feb", surveys: 65, foundations: 45, cabinet: 30, cable: 20, controlRoom: 12, ppic3: 5, overall: 30 },
    { month: "Mar", surveys: 80, foundations: 65, cabinet: 50, cable: 35, controlRoom: 25, ppic3: 12, overall: 45 },
    { month: "Apr", surveys: 90, foundations: 80, cabinet: 70, cable: 55, controlRoom: 40, ppic3: 25, overall: 60 },
    { month: "May", surveys: 95, foundations: 90, cabinet: 85, cable: 75, controlRoom: 60, ppic3: 45, overall: 75 },
    { month: "Jun", surveys: 100, foundations: 95, cabinet: 92, cable: 85, controlRoom: 75, ppic3: 65, overall: 85 },
];

  const data = cityData || defaultData;
  const gradientId1 = `colorOverall-${cityKey}`;
  const gradientId2 = `colorSurveys-${cityKey}`;

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    }
      , React.createElement(CardHeader, { className: "pb-4"}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  }, "Installation Progress Timeline"  )
        , React.createElement(CardDescription, { className: "text-sm"}, "Monthly Progress Overview (Last 6 Months)"     )
      )
      , React.createElement(CardContent, {}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '240px' : isTablet ? '280px' : '320px' }}
        , React.createElement(ResponsiveContainer, { width: "100%", height: "100%"}
            , React.createElement(AreaChart, { data: data, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 5 : 0 
            }, key: cityKey}
            , React.createElement('defs', {}
              , React.createElement('linearGradient', { id: gradientId1, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "hsl(var(--primary))", stopOpacity: 0})
                , React.createElement('stop', { offset: "95%", stopColor: "hsl(var(--primary))", stopOpacity: 0})
              )
              , React.createElement('linearGradient', { id: gradientId2, x1: "0", y1: "0", x2: "0", y2: "1"}
                , React.createElement('stop', { offset: "5%", stopColor: "#2F8F6C", stopOpacity: 0})
                , React.createElement('stop', { offset: "95%", stopColor: "#2F8F6C", stopOpacity: 0})
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
                axisLine: false, 
                tickLine: false, 
                width: isMobile ? 35 : 50,
                tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }, 
                domain: [0, 100]} 
              )
            , React.createElement(Tooltip, { 
                contentStyle: { 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))", 
                  borderRadius: "8px",
                  fontSize: isMobile ? '10px' : '12px',
                  padding: isMobile ? '4px 6px' : '8px 12px'
                },
              itemStyle: { color: "hsl(var(--foreground))" }}
            )
              , React.createElement(Area, { type: "monotone", dataKey: "overall", stroke: "hsl(var(--primary))", fillOpacity: 0, fill: `url(#${gradientId1})`, strokeWidth: isMobile ? 1.5 : 2} )
              , React.createElement(Area, { type: "monotone", dataKey: "surveys", stroke: "#2F8F6C", fillOpacity: 0, fill: `url(#${gradientId2})`, strokeWidth: isMobile ? 1 : 1.5, strokeDasharray: "5 5" } )
          )
        )
        )
      )
    )
  );
}
