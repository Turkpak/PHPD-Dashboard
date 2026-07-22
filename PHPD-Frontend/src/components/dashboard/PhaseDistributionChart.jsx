import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";










const COLORS = ["#2F8F6C", "#2E7D32", "#f59e0b", "#a855f7", "#ef4444", "#eab308"];

export function PhaseDistributionChart({
  data,
  title = "Phase Distribution",
  description = "Progress distribution across milestone progress",
}) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const chartData = data.map((item, index) => ({
    name: item.phase,
    value: item.percentage,
    fullName: item.phase,
    color: COLORS[index % COLORS.length],
  }));

  // Create a unique key based on data to force re-render
  const dataKey = JSON.stringify(data);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        React.createElement('div', { className: "bg-card border border-border rounded-lg p-3 shadow-lg"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}}
          , React.createElement('p', { className: "font-semibold text-sm mb-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 40}}, data.fullName)
          , React.createElement('p', { className: "text-primary font-bold text-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}, `${data.value}%`)
        )
      );
    }
    return null;
  };

  // Custom label function - only show percentage on slice, no text
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
    const RADIAN = Math.PI / 180;
    // Bias towards the outer edge so text doesn't fall into the donut hole.
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is large enough (>5%)
    if (percent < 0.05) return null;

    return (
      React.createElement('text', {
        x: x,
        y: y,
        fill: "white",
        textAnchor: "middle",
        dominantBaseline: "central",
        fontSize: 12,
        fontWeight: "bold",
        style: { pointerEvents: "none" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}

        , `${Number(_nullishCoalesce(_optionalChain([payload, 'optionalAccess', _ => _.value]), () => ( 0))).toFixed(2)}%`
      )
    );
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
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}

      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, title)
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}, description)
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}
        , React.createElement('div', { className: "flex flex-col lg:flex-row gap-4 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}
          /* Pie Chart */
          , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
            , React.createElement('div', { className: "w-full", style: { height: isMobile ? '220px' : isTablet ? '260px' : '280px' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}
              , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}
              , React.createElement(PieChart, {
                key: dataKey,
                margin: { top: 12, right: 12, bottom: 12, left: 12 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}

                , React.createElement(Pie, {
                  data: chartData,
                  cx: "50%",
                  cy: "50%",
                  labelLine: false,
                  label: renderCustomLabel,
                  outerRadius: isMobile ? 56 : isTablet ? 70 : 84,
                  innerRadius: isMobile ? 18 : isTablet ? 24 : 30,
                  fill: "#8884d8",
                  dataKey: "value",
                  paddingAngle: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}

                  , chartData.map((entry, index) => (
                    React.createElement(Cell, { key: `cell-${index}`, fill: entry.color, stroke: "white", strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}} )
                  ))
                )
                , React.createElement(Tooltip, { content: React.createElement(CustomTooltip, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
              )
            )
            )
          )

          /* Custom Legend */
          , React.createElement('div', { className: "w-full lg:w-auto lg:min-w-[220px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
            , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
            , chartData.map((entry, index) => (
              React.createElement('div', {
                key: index,
                className: "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}

                , React.createElement('div', {
                  className: "w-4 h-4 rounded-sm flex-shrink-0"   ,
                  style: { backgroundColor: entry.color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
                )
                , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                  , React.createElement('p', { className: "text-xs font-semibold text-foreground leading-tight break-words"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                    , entry.fullName
                  )
                )
                , React.createElement('div', { className: "flex-shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}
                  , React.createElement('p', { className: "text-sm font-bold tabular-nums"  , style: { color: entry.color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
                    , entry.value, "%"
                  )
                )
              )
            ))
            )
          )
        )
      )
    )
  );
}

