const _jsxFileName = "";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";










const COLORS = {
  surveys: "#2F8F6C",
  foundations: "#2E7D32",
  cabinet: "#f59e0b",
  cable: "#a855f7",
  controlRoom: "#ef4444",
  ppic3: "#eab308",
};

const getColor = (phase) => {
  const key = phase.toLowerCase().replace(/\s+/g, "");
  if (key.includes("survey")) return COLORS.surveys;
  if (key.includes("foundation")) return COLORS.foundations;
  if (key.includes("cabinet")) return COLORS.cabinet;
  if (key.includes("cable")) return COLORS.cable;
  if (key.includes("control")) return COLORS.controlRoom;
  if (key.includes("ppic")) return COLORS.ppic3;
  return "#6b7280";
};

export function PhaseBreakdownChart({ data }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const chartData = data.map(item => ({
    ...item,
    phase: item.phase.length > (isMobile ? 15 : 20) ? item.phase.substring(0, isMobile ? 15 : 20) + "..." : item.phase,
  }));

  // Create a unique key based on data to force re-render
  const dataKey = JSON.stringify(data);

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}, "Phase Breakdown" )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}, "Installation progress by phase"   )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '240px' : isTablet ? '280px' : '300px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
            , React.createElement(BarChart, { data: chartData, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 80 : 60 
            }, key: dataKey, __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
              , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}} )
              , React.createElement(XAxis, { 
                dataKey: "phase", 
                angle: isMobile ? -60 : -45,
                textAnchor: "end",
                height: isMobile ? 100 : 80,
                tick: { fontSize: isMobile ? 9 : isTablet ? 10 : 11, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
              )
              , React.createElement(YAxis, { 
                domain: [0, 100],
                tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" },
                axisLine: false,
                tickLine: false,
                width: isMobile ? 35 : 50, __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
              )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              },
              formatter: (value) => [`${value}%`, "Progress"], __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
            )
            , React.createElement(Bar, { dataKey: "percentage", radius: [4, 4, 0, 0], __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
              , chartData.map((entry, index) => (
                React.createElement(Cell, { key: `cell-${index}`, fill: getColor(entry.phase), __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}} )
              ))
            )
          )
        )
        )
      )
    )
  );
}

