import React from "react";
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
        React.createElement('div', { className: "bg-card border border-border rounded-lg p-3 shadow-lg"     }
          , React.createElement('p', { className: "font-semibold text-sm mb-1"  }, data.fullName)
          , React.createElement('p', { className: "text-primary font-bold text-lg"  }, `${data.value}%`)
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
        style: { pointerEvents: "none" }}

        , `${Number(payload?.value ?? 0).toFixed(2)}%`
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
      }}

      , React.createElement(CardHeader, { className: "pb-4"}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  }, title)
        , React.createElement(CardDescription, { className: "text-sm"}, description)
      )
      , React.createElement(CardContent, {}
        , React.createElement('div', { className: "flex flex-col lg:flex-row gap-4 min-w-0"    }
          /* Pie Chart */
          , React.createElement('div', { className: "flex-1 min-w-0" }
            , React.createElement('div', { className: "w-full", style: { height: isMobile ? '220px' : isTablet ? '260px' : '280px' }}
              , React.createElement(ResponsiveContainer, { width: "100%", height: "100%"}
              , React.createElement(PieChart, {
                key: dataKey,
                margin: { top: 12, right: 12, bottom: 12, left: 12 }}

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
                  paddingAngle: 2}

                  , chartData.map((entry, index) => (
                    React.createElement(Cell, { key: `cell-${index}`, fill: entry.color, stroke: "white", strokeWidth: 2} )
                  ))
                )
                , React.createElement(Tooltip, { content: React.createElement(CustomTooltip, {} )} )
              )
            )
            )
          )

          /* Custom Legend */
          , React.createElement('div', { className: "w-full lg:w-auto lg:min-w-[220px]"  }
            , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2"    }
            , chartData.map((entry, index) => (
              React.createElement('div', {
                key: index,
                className: "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-0"       }

                , React.createElement('div', {
                  className: "w-4 h-4 rounded-sm flex-shrink-0"   ,
                  style: { backgroundColor: entry.color }}
                )
                , React.createElement('div', { className: "flex-1 min-w-0" }
                  , React.createElement('p', { className: "text-xs font-semibold text-foreground leading-tight break-words"    }
                    , entry.fullName
                  )
                )
                , React.createElement('div', { className: "flex-shrink-0"}
                  , React.createElement('p', { className: "text-sm font-bold tabular-nums"  , style: { color: entry.color }}
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

