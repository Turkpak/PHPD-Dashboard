const _jsxFileName = "";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, ArrowRight } from "lucide-react";









export function HierarchyCard({ title, overallProgress, onClick, className, color }) {
  const clampPct = (n) => Math.max(0, Math.min(100, n));
  const progress = clampPct(Number.isFinite(overallProgress) ? overallProgress : 0);
  const progressLabel = progress.toFixed(2);
  const status = overallProgress === 100 
    ? "Completed" 
    : overallProgress >= 80 
    ? "Near Complete" 
    : overallProgress >= 50 
    ? "In Progress" 
    : "Started";
  
  // Use provided color or default based on progress
  const cardColor = color || (overallProgress === 100
    ? "emerald"
    : overallProgress >= 80
    ? "blue"
    : overallProgress >= 50
    ? "orange"
    : "red");

  const colorClasses = {
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      progress: "bg-emerald-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900"
    },
    blue: {
      border: "border-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-300",
      progress: "bg-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900"
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      text: "text-orange-600 dark:text-orange-400",
      progress: "bg-orange-500",
      iconBg: "bg-orange-100 dark:bg-orange-900"
    },
    red: {
      border: "border-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
      text: "text-red-600 dark:text-red-400",
      progress: "bg-red-500",
      iconBg: "bg-red-100 dark:bg-red-900"
    },
    purple: {
      border: "border-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500",
      iconBg: "bg-purple-100 dark:bg-purple-900"
    },
    indigo: {
      border: "border-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      text: "text-indigo-600 dark:text-indigo-400",
      progress: "bg-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-900"
    },
    teal: {
      border: "border-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
      text: "text-teal-600 dark:text-teal-400",
      progress: "bg-teal-500",
      iconBg: "bg-teal-100 dark:bg-teal-900"
    },
    pink: {
      border: "border-pink-500",
      bg: "bg-pink-50 dark:bg-pink-950/30",
      text: "text-pink-600 dark:text-pink-400",
      progress: "bg-pink-500",
      iconBg: "bg-pink-100 dark:bg-pink-900"
    },
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
      text: "text-cyan-600 dark:text-cyan-400",
      progress: "bg-cyan-500",
      iconBg: "bg-cyan-100 dark:bg-cyan-900"
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      progress: "bg-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900"
    }
  };

  const colors = colorClasses[cardColor] || colorClasses.blue;

  return (
    React.createElement(Card, { 
      className: cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group",
        "border-l-4",
        colors.border,
        "border-r border-t border-b border-border/40 hover:border-opacity-100",
        colors.bg,
        className
      ),
      onClick: onClick, __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}

      /* Background gradient */
      , React.createElement('div', { className: cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity", colors.bg), __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}})

      , React.createElement(CardContent, { className: "relative p-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
        , React.createElement('div', { className: "flex flex-col space-y-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
          /* Header */
          , React.createElement('div', { className: "flex items-start justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
            , React.createElement('div', { className: "flex-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
              , React.createElement('h3', { className: "text-base font-bold font-heading text-foreground mb-0.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}
                , title
              )
              , React.createElement('p', { className: "text-xs text-muted-foreground uppercase tracking-wide"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
                , status
              )
            )
            , React.createElement('div', { className: cn(
              "p-2 rounded-lg transition-colors",
              colors.iconBg
            ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
              , React.createElement(TrendingUp, { className: cn("h-4 w-4", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}} )
            )
          )

          /* Progress Section */
          , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
            , React.createElement('div', { className: "flex items-baseline justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
              , React.createElement('span', { className: cn("text-2xl font-bold font-heading tabular-nums", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
                , progressLabel
                , React.createElement('span', { className: "text-base ml-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}, "%")
              )
              , React.createElement(ArrowRight, { className: cn("h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-all", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}} )
            )

            /* Progress Bar */
            , React.createElement('div', { className: "relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60 shadow-inner"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
              , React.createElement('div', { 
                className: cn(
                  "h-full transition-all duration-1000 ease-out rounded-full shadow-lg relative overflow-hidden",
                  colors.progress
                ),
                style: { width: `${progress}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}

                , React.createElement('div', { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}})
              )
            )
          )
        )
      )
    )
  );
}

