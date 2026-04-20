const _jsxFileName = "";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";



























export function SubProjectCard({ subProject, color, isExpanded = false }) {
  const variance = subProject.actualProgress - subProject.plannedProgress;
  const varianceColor = variance >= 0 ? "text-emerald-600" : "text-red-600";
  const status = variance >= 0 ? "Ahead" : "Behind";
  
  return (
    React.createElement(Card, { className: cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      "border-l-2 border-l-current",
      "bg-card/50"
    ), style: { borderLeftColor: color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
      , React.createElement(CardContent, { className: "p-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}
        , React.createElement('div', { className: "flex items-center justify-between mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}
          , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}
            , React.createElement('h4', { className: "text-sm font-semibold text-foreground truncate"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}
              , subProject.name
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}, "Weight: "
               , (subProject.weight * 100).toFixed(0), "%"
            )
          )
          , React.createElement('div', { className: cn("text-xs font-bold px-2 py-1 rounded", varianceColor, "bg-muted/50"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
            , status, " " , Math.abs(variance).toFixed(1), "%"
          )
        )

        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
          /* Actual Progress */
          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
            , React.createElement('div', { className: "flex justify-between text-xs mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
              , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}, "Actual")
              , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}, subProject.actualProgress.toFixed(1), "%")
            )
            , React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/50"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
              , React.createElement('div', { 
                className: "h-full rounded-full transition-all duration-500"   ,
                style: { width: `${Math.min(100, subProject.actualProgress)}%`, backgroundColor: color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
              )
            )
          )

          /* Planned Progress */
          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
            , React.createElement('div', { className: "flex justify-between text-xs mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}
              , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}, "Planned")
              , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}, subProject.plannedProgress.toFixed(1), "%")
            )
            , React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/50"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
              , React.createElement('div', { 
                className: "h-full rounded-full transition-all duration-500 border-2 border-dashed"     ,
                style: { 
                  width: `${Math.min(100, subProject.plannedProgress)}%`, 
                  backgroundColor: "transparent",
                  borderColor: color,
                  opacity: 0.5
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
              )
            )
          )
        )
      )
    )
  );
}

