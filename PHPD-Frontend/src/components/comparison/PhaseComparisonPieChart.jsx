const _jsxFileName = "";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";









const COLORS = [
  "#2F8F6C", "#2E7D32", "#f59e0b", "#a855f7", "#ef4444", 
  "#eab308", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899"
];

export function PhaseComparisonPieChart({ phaseName, cityData }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const sortedData = [...cityData].sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 cities

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 26}}
      , React.createElement(CardHeader, { className: "pb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}
        , React.createElement(CardTitle, { className: "font-heading text-lg font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}, phaseName)
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}}, "Top 6 cities comparison"   )
      )
      , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 31}}
        /* Pie Chart */
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '220px' : isTablet ? '260px' : '280px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
            , React.createElement(PieChart, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 35}}
              , React.createElement(Pie, {
                data: sortedData,
                cx: "50%",
                cy: "50%",
                label: false,
                outerRadius: isMobile ? 60 : isTablet ? 80 : 100,
                innerRadius: isMobile ? 20 : isTablet ? 30 : 40,
                fill: "#8884d8",
                dataKey: "value",
                paddingAngle: 3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}

              , sortedData.map((entry, index) => (
                React.createElement(Cell, { key: `cell-${index}`, fill: COLORS[index % COLORS.length], stroke: "white", strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}} )
              ))
            )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                padding: isMobile ? "4px 6px" : "8px 12px",
                fontSize: isMobile ? '10px' : '12px'
              },
              formatter: (value, name, props) => [
                `${props.payload.city}: ${value}%`,
                "Progress"
              ], __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
            )
          )
        )
        )

        /* Legend with City Names */
        , React.createElement('div', { className: "flex flex-wrap justify-center gap-3 text-xs"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
          , sortedData.map((entry, index) => (
            React.createElement('div', { key: entry.city, className: "flex items-center gap-1.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
              , React.createElement('div', { 
                className: "w-3 h-3 rounded-full flex-shrink-0"   , 
                style: { backgroundColor: COLORS[index % COLORS.length] }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
              )
              , React.createElement('span', { className: "text-muted-foreground font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
                , entry.city, ": " , entry.value, "%"
              )
            )
          ))
        )
      )
    )
  );
}
