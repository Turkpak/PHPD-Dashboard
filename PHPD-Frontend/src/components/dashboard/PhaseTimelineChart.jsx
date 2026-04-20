const _jsxFileName = "";
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
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}

      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}, "Phase Evolution Timeline"  )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}, "All milestone progress over time"    )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '280px' : isTablet ? '320px' : '350px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
            , React.createElement(AreaChart, { data: timelineData, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 5 : 0 
            }, key: cityKey, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
            , React.createElement('defs', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
              , React.createElement('linearGradient', { id: gradientIds.surveys, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
                , React.createElement('stop', { offset: "5%", stopColor: "#2F8F6C", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}})
                , React.createElement('stop', { offset: "95%", stopColor: "#2F8F6C", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}})
              )
              , React.createElement('linearGradient', { id: gradientIds.foundations, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
                , React.createElement('stop', { offset: "5%", stopColor: "#2E7D32", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}})
                , React.createElement('stop', { offset: "95%", stopColor: "#2E7D32", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}})
              )
              , React.createElement('linearGradient', { id: gradientIds.cabinet, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
                , React.createElement('stop', { offset: "5%", stopColor: "#f59e0b", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}})
                , React.createElement('stop', { offset: "95%", stopColor: "#f59e0b", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}})
              )
              , React.createElement('linearGradient', { id: gradientIds.cable, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}
                , React.createElement('stop', { offset: "5%", stopColor: "#a855f7", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}})
                , React.createElement('stop', { offset: "95%", stopColor: "#a855f7", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}})
              )
              , React.createElement('linearGradient', { id: gradientIds.controlRoom, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
                , React.createElement('stop', { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}})
                , React.createElement('stop', { offset: "95%", stopColor: "#ef4444", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}})
              )
              , React.createElement('linearGradient', { id: gradientIds.ppic3, x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
                , React.createElement('stop', { offset: "5%", stopColor: "#eab308", stopOpacity: 0.0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}})
                , React.createElement('stop', { offset: "95%", stopColor: "#eab308", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}})
              )
            )
            , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}} )
            , React.createElement(XAxis, { 
              dataKey: "month", 
              axisLine: false, 
              tickLine: false, 
              tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}} 
            )
            , React.createElement(YAxis, { 
              domain: [0, 100],
              axisLine: false, 
              tickLine: false, 
              width: isMobile ? 35 : 50,
              tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}} 
            )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              },
              formatter: (value, name) => [`${value}%`, name], __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
            )
            , React.createElement(Legend, { 
              wrapperStyle: { fontSize: isMobile ? '10px' : '12px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
            )
            , React.createElement(Area, { type: "monotone", dataKey: "surveys", stackId: "1", stroke: "#2F8F6C", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}} )
            , React.createElement(Area, { type: "monotone", dataKey: "foundations", stackId: "1", stroke: "#2E7D32", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}} )
            , React.createElement(Area, { type: "monotone", dataKey: "cabinet", stackId: "1", stroke: "#f59e0b", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}} )
            , React.createElement(Area, { type: "monotone", dataKey: "cable", stackId: "1", stroke: "#a855f7", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
            , React.createElement(Area, { type: "monotone", dataKey: "controlRoom", stackId: "1", stroke: "#ef4444", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}} )
            , React.createElement(Area, { type: "monotone", dataKey: "ppic3", stackId: "1", stroke: "#eab308", fill: "transparent", strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}} )
          )
        )
        )
      )
    )
  );
}

