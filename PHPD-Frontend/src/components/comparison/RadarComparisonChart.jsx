const _jsxFileName = "";
import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";









const COLORS = [
  "#2F8F6C", "#2E7D32", "#f59e0b", "#a855f7", "#ef4444", 
  "#eab308", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899"
];

export function RadarComparisonChart({ data, cities }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const topCities = cities.slice(0, isMobile ? 3 : 5); // Show fewer cities on mobile

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 26}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}
        , React.createElement(CardTitle, { className: "font-heading text-lg sm:text-xl font-bold leading-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}, "Multi-City Phase Comparison"  )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}}, "Radar chart comparing top "    , isMobile ? 3 : 5, " cities across all phases"    )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 31}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '320px' : isTablet ? '400px' : '500px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}
            , React.createElement(RadarChart, { data: data, __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
              , React.createElement(PolarGrid, { stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}} )
              , React.createElement(PolarAngleAxis, { 
                dataKey: "phase", 
                tick: { fontSize: isMobile ? 9 : isTablet ? 10 : 11, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
              )
              , React.createElement(PolarRadiusAxis, { 
                angle: 90, 
                domain: [0, 100],
                tick: { fontSize: isMobile ? 8 : isTablet ? 9 : 10, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 40}}
              )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}
            )
            , React.createElement(Legend, { 
              wrapperStyle: { fontSize: isMobile ? '10px' : '12px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
            )
            , topCities.map((city, index) => (
              React.createElement(Radar, {
                key: city,
                name: city,
                dataKey: city,
                stroke: COLORS[index % COLORS.length],
                fill: COLORS[index % COLORS.length],
                fillOpacity: 0.3,
                strokeWidth: isMobile ? 1.5 : 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
              )
            ))
          )
        )
        )
      )
    )
  );
}

