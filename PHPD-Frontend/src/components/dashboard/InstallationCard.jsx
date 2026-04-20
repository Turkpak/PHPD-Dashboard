const _jsxFileName = "";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";















export function InstallationCard({ 
  title, 
  percentage, 
  icon: Icon, 
  className, 
  color = "primary",
  actualProgress,
  plannedProgress,
  onClick,
  selected = false,
  nonInteractive = false,
}) {
  const showDualProgress = actualProgress !== undefined && plannedProgress !== undefined;
  const clampedPct = Math.max(0, Math.min(100, Number.isFinite(percentage) ? percentage : 0));
  
  // Calculate actual vs planned variance
  const variance = showDualProgress ? actualProgress - plannedProgress : null;
  const getColorClasses = () => {
    switch (color) {
      case "blue": return { 
        icon: "text-emerald-700", 
        iconBg: "bg-emerald-50 dark:bg-emerald-950", 
        border: "border-l-4 border-l-emerald-700", 
        progress: "bg-emerald-600",
        percentage: "text-emerald-700 dark:text-emerald-300",
        selectedRing: "ring-2 ring-emerald-600 ring-offset-2 ring-offset-background"
      };
      case "green": return { 
        icon: "text-emerald-600", 
        iconBg: "bg-emerald-50 dark:bg-emerald-950", 
        border: "border-l-4 border-l-emerald-500", 
        progress: "bg-emerald-500",
        percentage: "text-emerald-600 dark:text-emerald-400",
        selectedRing: "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
      };
      case "orange": return { 
        icon: "text-orange-600", 
        iconBg: "bg-orange-50 dark:bg-orange-950", 
        border: "border-l-4 border-l-orange-500", 
        progress: "bg-orange-500",
        percentage: "text-orange-600 dark:text-orange-400",
        selectedRing: "ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
      };
      case "purple": return { 
        icon: "text-purple-600", 
        iconBg: "bg-purple-50 dark:bg-purple-950", 
        border: "border-l-4 border-l-purple-500", 
        progress: "bg-purple-500",
        percentage: "text-purple-600 dark:text-purple-400",
        selectedRing: "ring-2 ring-purple-500 ring-offset-2 ring-offset-background"
      };
      case "red": return { 
        icon: "text-red-600", 
        iconBg: "bg-red-50 dark:bg-red-950", 
        border: "border-l-4 border-l-red-500", 
        progress: "bg-red-500",
        percentage: "text-red-600 dark:text-red-400",
        selectedRing: "ring-2 ring-red-500 ring-offset-2 ring-offset-background"
      };
      case "yellow": return { 
        icon: "text-yellow-600", 
        iconBg: "bg-yellow-50 dark:bg-yellow-950", 
        border: "border-l-4 border-l-yellow-500", 
        progress: "bg-yellow-500",
        percentage: "text-yellow-600 dark:text-yellow-400",
        selectedRing: "ring-2 ring-yellow-500 ring-offset-2 ring-offset-background"
      };
      default: return { 
        icon: "text-primary", 
        iconBg: "bg-primary/10", 
        border: "border-l-4 border-l-primary", 
        progress: "bg-primary",
        percentage: "text-primary",
        selectedRing: "ring-2 ring-primary ring-offset-2 ring-offset-background"
      };
    }
  };

  const colors = getColorClasses();
  const status =
    clampedPct === 100
      ? "Completed"
      : clampedPct >= 80
        ? "Near Complete"
        : clampedPct >= 50
          ? "In Progress"
          : "Started";

  return (
    React.createElement(Card, { className: cn(
      "relative overflow-hidden transition-all duration-300 group",
      // Modern premium feel: rounded corners, subtle lift, cohesive colors
      "rounded-3xl border border-white/40 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]",
      !nonInteractive && "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:translate-y-0",
      colors.border,
      !nonInteractive && "hover:border-primary/20",
      "bg-white/80 backdrop-blur-sm",
      onClick && !nonInteractive && "cursor-pointer select-none",
      nonInteractive && "cursor-default",
      selected && "ring-2 ring-primary ring-offset-4 shadow-xl",
      className
    ),
      role: onClick && !nonInteractive ? "button" : undefined,
      tabIndex: onClick && !nonInteractive ? 0 : undefined,
      onClick: nonInteractive ? undefined : onClick,
      onKeyDown: (e) => {
        if (!onClick || nonInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}

      /* Subtle background gradient */
      , React.createElement('div', { className: cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 -mr-12 -mt-12 transition-opacity group-hover:opacity-25",
        colors.iconBg.replace("bg-", "bg-").replace("-50", "-200")
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}})

      , React.createElement(CardHeader, { className: "relative flex flex-row items-start justify-between space-y-0 pb-3 pt-4 px-3.5"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}
        , React.createElement('div', { className: "flex-1 min-w-0 pr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}
          , React.createElement(CardTitle, { className: "text-[10px] font-extrabold text-foreground/90 uppercase tracking-[0.16em] leading-tight line-clamp-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
            , title
          )
        )
        , React.createElement('div', { className: cn(
          "flex-shrink-0 p-1.5 rounded-md shadow-sm group-hover:shadow-md transition-all",
          colors.iconBg
        ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
          , React.createElement(Icon, { className: cn("h-3.5 w-3.5", colors.icon), __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}} )
        )
      )
      , React.createElement(CardContent, { className: "relative px-3.5 pb-4 pt-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}
        , React.createElement('div', { className: "space-y-2.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}
          , React.createElement('div', { className: "flex items-end justify-between gap-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
            , React.createElement('span', { className: cn("text-2xl font-bold tabular-nums leading-none", colors.percentage), __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
              , Math.round(clampedPct)
              , React.createElement('span', { className: "text-sm font-semibold ml-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}, "%")
            )
            , React.createElement('span', { className: "text-[8px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 leading-tight"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
              , status
            )
          )

          /* Show dual progress bars if actual/planned provided */
          , showDualProgress ? (
            React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
              /* Planned Progress - Above */
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
                , React.createElement('div', { className: "flex justify-between text-[7px] mb-0.5 text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
                  , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}, "Planned")
                  , React.createElement('span', { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 171}}, plannedProgress.toFixed(1), "%")
                  , variance !== null && (
                    React.createElement('span', { className: cn(
                      "font-semibold ml-1",
                      variance >= 0 ? "text-emerald-600" : "text-red-600"
                    ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
                      , variance >= 0 ? "+" : "", variance.toFixed(1), "%"
                    )
                  )
                )
                , React.createElement('div', { className: "relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
                  , React.createElement('div', { 
                    className: cn("h-full rounded-full transition-all duration-1000 ease-out opacity-40", colors.progress),
                    style: { width: `${Math.min(100, plannedProgress)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                  )
                )
              )

              /* Actual Progress - Below */
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
                , React.createElement('div', { className: "flex justify-between text-[7px] mb-0.5 text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
                  , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}, "Actual")
                  , React.createElement('span', { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, actualProgress.toFixed(1), "%")
                )
                , React.createElement('div', { className: "relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                  , React.createElement('div', { 
                    className: cn("h-full rounded-full transition-all duration-1000 ease-out", colors.progress),
                    style: { width: `${Math.min(100, actualProgress)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
                  )
                )
              )
            )
          ) : (
            /* Single progress bar (legacy) */
            React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/40 shadow-inner"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}
              , React.createElement('div', { 
                className: cn(
                  "h-full rounded-full transition-all duration-1000 ease-out shadow-md relative overflow-hidden",
                  colors.progress
                ),
                style: { width: `${clampedPct}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}

                , clampedPct > 0 && (
                  React.createElement('div', { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}} )
                )
              )
              )
          )
        )
      )
    )
  );
}

