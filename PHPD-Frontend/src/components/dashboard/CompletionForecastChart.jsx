import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";






export function CompletionForecastChart({ currentProgress, cityKey = "default" }) {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  // Generate forecast data based on current progress
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = "Jun";
  
  // Calculate forecast based on current progress rate
  const progressRate = currentProgress / 6; // Average monthly progress
  const remainingMonths = months.length;
  
  const forecastData = [
    { month: currentMonth, progress: currentProgress, type: "Actual" },
    ...months.map((month, index) => {
      const projected = Math.min(100, currentProgress + (progressRate * (index + 1)));
      return {
        month,
        progress: Math.round(projected),
        type: "Forecast"
      };
    })
  ];

  const gradientId = `forecastGradient-${cityKey}`;

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    }
      , React.createElement(CardHeader, { className: "pb-4"}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  }, "Completion Forecast" )
        , React.createElement(CardDescription, { className: "text-sm"}, "Projected completion timeline based on current progress rate"       )
      )
      , React.createElement(CardContent, {}
        , React.createElement('div', { className: "w-full", style: { height: isMobile ? '240px' : isTablet ? '280px' : '300px' }}
          , React.createElement(ResponsiveContainer, { width: "100%", height: "100%"}
            , React.createElement(LineChart, { data: forecastData, margin: { 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: isMobile ? 5 : 0 
            }, key: cityKey}
              , React.createElement('defs', {}
                , React.createElement('linearGradient', { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1"}
                  , React.createElement('stop', { offset: "5%", stopColor: "#2E7D32", stopOpacity: 0.3})
                  , React.createElement('stop', { offset: "95%", stopColor: "#2E7D32", stopOpacity: 0})
                )
              )
              , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))"} )
              , React.createElement(XAxis, { 
                dataKey: "month", 
                axisLine: false, 
                tickLine: false, 
                tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }} 
              )
              , React.createElement(YAxis, { 
                domain: [0, 100],
                axisLine: false, 
                tickLine: false, 
                width: isMobile ? 35 : 50,
                tick: { fontSize: isMobile ? 10 : isTablet ? 11 : 12, fill: "hsl(var(--muted-foreground))" }} 
              )
            , React.createElement(Tooltip, { 
              contentStyle: { 
                backgroundColor: "hsl(var(--card))", 
                borderColor: "hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: isMobile ? '10px' : '12px',
                padding: isMobile ? '4px 6px' : '8px 12px'
              },
              formatter: (value) => [`${value}%`, "Progress"]}
            )
            , React.createElement(ReferenceLine, { y: 100, stroke: "#2E7D32", strokeDasharray: "5 5" , label: { value: "Target", position: "right", style: { fontSize: isMobile ? '9px' : '11px' } }} )
            , React.createElement(Line, { 
              type: "monotone", 
              dataKey: "progress", 
              stroke: "#2E7D32", 
              strokeWidth: isMobile ? 2 : 3,
              dot: { fill: "#2E7D32", r: isMobile ? 4 : 5 },
              activeDot: { r: isMobile ? 6 : 7 },
              strokeDasharray: forecastData[0].type === "Actual" ? "0" : "5 5"}
            )
          )
        )
        )
        , React.createElement('div', { className: "mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground"      }
          , React.createElement('div', { className: "flex items-center gap-2"  }
            , React.createElement('div', { className: "w-3 h-3 rounded-full bg-green-700"   })
            , React.createElement('span', {}, "Projected Completion" )
          )
          , React.createElement('div', { className: "flex items-center gap-2"  }
            , React.createElement('div', { className: "w-3 h-3 rounded-full bg-green-700 border-2 border-green-300"     })
            , React.createElement('span', {}, "Current Progress" )
          )
        )
      )
    )
  );
}

