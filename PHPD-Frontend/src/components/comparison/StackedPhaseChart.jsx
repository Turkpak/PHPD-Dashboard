const _jsxFileName = "";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";













const PHASE_COLORS = {
  surveys: "#2F8F6C",
  foundations: "#2E7D32",
  cabinet: "#f59e0b",
  cable: "#a855f7",
  controlRoom: "#ef4444",
  ppic3: "#eab308",
};

export function StackedPhaseChart({ data }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  // Calculate average progress for each city and transform data
  // Each phase segment will be proportional to its value, but total bar height = average (0-100)
  const transformedData = data.map(city => {
    const average = (city.surveys + city.foundations + city.cabinet + city.cable + city.controlRoom + city.ppic3) / 6;
    const total = city.surveys + city.foundations + city.cabinet + city.cable + city.controlRoom + city.ppic3;
    
    // Scale each phase proportionally so total equals average
    // Each segment = (phase_value / total) * average
    return {
      city: city.city,
      surveys: total > 0 ? (city.surveys / total) * average : 0,
      foundations: total > 0 ? (city.foundations / total) * average : 0,
      cabinet: total > 0 ? (city.cabinet / total) * average : 0,
      cable: total > 0 ? (city.cable / total) * average : 0,
      controlRoom: total > 0 ? (city.controlRoom / total) * average : 0,
      ppic3: total > 0 ? (city.ppic3 / total) * average : 0,
      average: average // Store for sorting
    };
  });

  const sortedData = [...transformedData].sort((a, b) => {
    return b.average - a.average;
  });

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Phase Progress Comparison"  )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}, "Stacked view of best performing projects citywise"      )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '320px' : isTablet ? '380px' : '450px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
            , React.createElement(BarChart, { 
              data: sortedData, 
              margin: { 
                top: isMobile ? 5 : 10, 
                right: isMobile ? 5 : 10, 
                left: isMobile ? 5 : 10, 
                bottom: isMobile ? 110 : isTablet ? 90 : 80 
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}

              , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}} )
              , React.createElement(XAxis, { 
                dataKey: "city", 
                angle: isMobile ? -60 : -45,
                textAnchor: "end",
                height: isMobile ? 130 : isTablet ? 110 : 100,
                tick: { 
                  fontSize: isMobile ? 8 : isTablet ? 10 : 11, 
                  fill: "hsl(var(--muted-foreground))" 
                },
                interval: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}
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
                  value: "Average Progress (%)", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { fontSize: isMobile ? '9px' : isTablet ? '10px' : '12px' }
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
              )
              , React.createElement(Tooltip, { 
                contentStyle: { 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))", 
                  borderRadius: "8px",
                  fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
                  padding: isMobile ? '4px 6px' : isTablet ? '6px 8px' : '8px 12px'
                },
                formatter: (value, name) => [`${value}%`, name], __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
              )
              , React.createElement(Legend, { 
                wrapperStyle: { 
                  paddingTop: isMobile ? "8px" : isTablet ? "15px" : "20px",
                  fontSize: isMobile ? '9px' : isTablet ? '10px' : '12px'
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
              )
              , React.createElement(Bar, { dataKey: "surveys", stackId: "a", fill: PHASE_COLORS.surveys, __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
              , React.createElement(Bar, { dataKey: "foundations", stackId: "a", fill: PHASE_COLORS.foundations, __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}} )
              , React.createElement(Bar, { dataKey: "cabinet", stackId: "a", fill: PHASE_COLORS.cabinet, __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}} )
              , React.createElement(Bar, { dataKey: "cable", stackId: "a", fill: PHASE_COLORS.cable, __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}} )
              , React.createElement(Bar, { dataKey: "controlRoom", stackId: "a", fill: PHASE_COLORS.controlRoom, __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}} )
              , React.createElement(Bar, { dataKey: "ppic3", stackId: "a", fill: PHASE_COLORS.ppic3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}} )
            )
          )
        )
      )
    )
  );
}

