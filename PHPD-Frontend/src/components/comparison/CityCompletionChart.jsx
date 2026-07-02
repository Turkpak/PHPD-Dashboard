import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";

const getColor = (completion) => {
  if (completion >= 80) return "#2E7D32"; // forest green
  if (completion >= 60) return "#2F8F6C"; // teal
  if (completion >= 40) return "#f59e0b"; // orange
  return "#ef4444"; // red
};

export function CityCompletionChart({ cityData, description = "District Wise Progress" }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const sortedData = Array.isArray(cityData)
    ? [...cityData].sort((a, b) => Number(b.completion || 0) - Number(a.completion || 0))
    : [];

  // Keep bar width visually consistent even when the number of items changes.
  const barSize = isMobile ? 28 : isTablet ? 34 : 42;
  const tickLabel = (s) => String(s || "").replace(/\s*Division\s*$/i, "");

  return (
    <Card className="rounded-lg shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-lg sm:text-xl font-bold leading-tight">
          Zone Phasewise (Completion %)
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="w-full"
          style={{ height: isMobile ? "320px" : isTablet ? "380px" : "380px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              barCategoryGap={isMobile ? 12 : 18}
              barGap={4}
              margin={{
                top: isMobile ? 5 : 10,
                right: isMobile ? 5 : 10,
                left: isMobile ? 10 : 30,
                bottom: isMobile ? 80 : isTablet ? 110 : 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="city"
                tickFormatter={tickLabel}
                angle={0}
                textAnchor="middle"
                height={isMobile ? 40 : isTablet ? 50 : 40}
                tick={{
                  fontSize: isMobile ? 8 : isTablet ? 10 : 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: isMobile ? 9 : isTablet ? 10 : 12,
                  fill: "hsl(var(--muted-foreground))",
                }}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 30 : isTablet ? 40 : 50}
                label={{
                  value: "Completion %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: isMobile ? "9px" : isTablet ? "10px" : "12px" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  padding: isMobile ? "4px 6px" : isTablet ? "6px 8px" : "8px 12px",
                }}
                formatter={(value) => [`${value}%`, "Completion"]}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: isMobile ? "8px" : isTablet ? "15px" : "8px",
                  fontSize: isMobile ? "9px" : isTablet ? "10px" : "12px",
                }}
                iconType="circle"
              />
              <Bar dataKey="completion" radius={[4, 4, 0, 0]} barSize={barSize}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(Number(entry.completion || 0))} />
                ))}
                {!isMobile && (
                  <LabelList
                    dataKey="completion"
                    position="insideTop"
                    offset={6}
                    formatter={(value) => `${value}%`}
                    style={{
                      fontSize: isTablet ? "9px" : "11px",
                      fill: "hsl(var(--foreground))",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

