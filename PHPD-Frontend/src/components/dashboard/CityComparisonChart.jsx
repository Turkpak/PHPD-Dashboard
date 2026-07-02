const _jsxFileName = "";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";






export function CityComparisonChart({ cityData, selectedCity }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const chartData = Object.entries(cityData)
    .map(([key, data]) => ({
      city: data.name,
      progress: data.overall,
    }))
    .sort((a, b) => b.progress - a.progress);

  const getColor = (progress) => {
    if (progress >= 80) return "#2E7D32";
    if (progress >= 60) return "#2F8F6C";
    if (progress >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 30}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 31}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}, "City Comparison" )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}, "Overall installation progress across all cities"     )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 35}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '280px' : isTablet ? '320px' : '350px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
            , React.createElement(BarChart, { data: chartData, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 80 : 20 
            }, key: selectedCity, __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}}
              , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}} )
              , React.createElement(XAxis, { 
                dataKey: "city", 
                angle: isMobile ? -60 : -45,
                textAnchor: "end",
                height: isMobile ? 100 : 80,
                tick: { fontSize: isMobile ? 9 : isTablet ? 10 : 11, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}
              )
              , React.createElement(YAxis, { 
                domain: [0, 100],
                tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" },
                axisLine: false,
                tickLine: false,
                width: isMobile ? 35 : 50, __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
              )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              },
              formatter: (value) => [`${value}%`, "Overall Progress"], __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
            )
            , React.createElement(Bar, { dataKey: "progress", radius: [4, 4, 0, 0], __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
              , chartData.map((entry, index) => (
                React.createElement(Cell, { key: `cell-${index}`, fill: getColor(entry.progress), __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}} )
              ))
            )
          )
        )
        )
      )
    )
  );
}

