const _jsxFileName = "";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";









const getColor = (completion) => {
  if (completion >= 80) return "#2E7D32"; // forest green
  if (completion >= 60) return "#2F8F6C"; // azure
  if (completion >= 40) return "#f59e0b"; // orange
  return "#ef4444"; // red
};

export function CityCompletionChart({ cityData, description = "District Wise Progress" }) {
  const { width } = useWindowSize();
  const sortedData = [...cityData].sort((a, b) => b.completion - a.completion);
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  // Keep bar width visually consistent even when the number of divisions changes.
  const barSize = isMobile ? 28 : isTablet ? 34 : 42;
  const tickLabel = (s) => (s || "").replace(/\s*Division\s*$/i, "");

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 30}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 31}}
        , React.createElement(CardTitle, { className: "font-heading text-lg sm:text-xl font-bold leading-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}, "Smart Safe Cities Phase I (Completion %)"      )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}, description)
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 35}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '320px' : isTablet ? '380px' : '380px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
            , React.createElement(BarChart, { 
              data: sortedData, 
              barCategoryGap: isMobile ? 12 : 18,
              barGap: 4,
              margin: { 
                top: isMobile ? 5 : 10, 
                right: isMobile ? 5 : 10, 
                left: isMobile ? 10 : 30, 
                bottom: isMobile ? 80 : isTablet ? 110 : 70 
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}}

              , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}} )
              , React.createElement(XAxis, { 
                dataKey: "city", 
                tickFormatter: tickLabel,
                angle: isMobile ? -35 : -45,
                textAnchor: "end",
                height: isMobile ? 80 : isTablet ? 110 : 80,
                tick: { 
                  fontSize: isMobile ? 8 : isTablet ? 10 : 11, 
                  fill: "hsl(var(--muted-foreground))" 
                },
                interval: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
              )
              , React.createElement(YAxis, { 
                domain: [0, 100],
                tick: { 
                  fontSize: isMobile ? 9 : isTablet ? 10 : 12, 
                  fill: "hsl(var(--muted-foreground))" 
                },
                axisLine: false,
                tickLine: false,
                width: isMobile ? 30 : isTablet ? 40 : 50,
                label: { 
                  value: "Completion %", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { fontSize: isMobile ? '9px' : isTablet ? '10px' : '12px' }
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
              )
              , React.createElement(Tooltip, { 
                contentStyle: { 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))", 
                  borderRadius: "8px",
                  fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
                  padding: isMobile ? '4px 6px' : isTablet ? '6px 8px' : '8px 12px'
                },
                formatter: (value) => [`${value}%`, "Completion"], __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
              )
              , React.createElement(Legend, { 
                wrapperStyle: { 
                  paddingTop: isMobile ? "8px" : isTablet ? "15px" : "8px",
                  fontSize: isMobile ? '9px' : isTablet ? '10px' : '12px'
                },
                iconType: "circle", __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
              )
              , React.createElement(Bar, {
                dataKey: "completion",
                radius: [4, 4, 0, 0],
                barSize: barSize, __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}

                , sortedData.map((entry, index) => (
                  React.createElement(Cell, { key: `cell-${index}`, fill: getColor(entry.completion), __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}} )
                ))
                , !isMobile && (
                  React.createElement(LabelList, { 
                    dataKey: "completion", 
                    // Use insideTop so the "100%" label never overlaps the 100% grid line.
                    position: "insideTop",
                    offset: 6,
                    formatter: (value) => `${value}%`,
                    style: { 
                      fontSize: isTablet ? "9px" : "11px", 
                      fill: "hsl(var(--foreground))", 
                      fontWeight: "bold" 
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
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

