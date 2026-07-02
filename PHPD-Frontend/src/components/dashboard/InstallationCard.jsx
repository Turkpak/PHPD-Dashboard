const _jsxFileName = "";
import React from "react";
import { Card } from "@/components/ui/card";
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
  const clampedPct = Math.max(0, Math.min(100, Number.isFinite(percentage) ? percentage : 0));
  
  const getColorClasses = () => {
    switch (color) {
      case "blue": return { 
        stroke: "text-[#054332] dark:text-emerald-500", // Dark green mapping
        selectedRing: "ring-2 ring-[#054332]"
      };
      case "green": return { 
        stroke: "text-[#10b981] dark:text-emerald-400", 
        selectedRing: "ring-2 ring-[#10b981]"
      };
      case "orange": return { 
        stroke: "text-[#f97316] dark:text-orange-400", 
        selectedRing: "ring-2 ring-[#f97316]"
      };
      case "purple": return { 
        stroke: "text-[#581c87] dark:text-purple-400", 
        selectedRing: "ring-2 ring-[#581c87]"
      };
      case "red": return { 
        stroke: "text-[#b91c1c] dark:text-red-500", 
        selectedRing: "ring-2 ring-[#b91c1c]"
      };
      case "yellow": return { 
        stroke: "text-[#eab308] dark:text-yellow-400", 
        selectedRing: "ring-2 ring-[#eab308]"
      };
      default: return { 
        stroke: "text-[#054332]", 
        selectedRing: "ring-2 ring-[#054332]"
      };
    }
  };

  const colors = getColorClasses();
  
  // Custom status text mappings
  const getStatusText = (pct) => {
    if (pct >= 40) return "Phase 1 Complete";
    if (pct >= 25) return "Ground Testing";
    if (pct >= 20) return "Resource Allocation";
    if (pct >= 10) return "Critical Delay";
    if (pct > 0) return "Initial Tender";
    return "Not Started";
  };
  const status = getStatusText(clampedPct);

  // SVG parameters for radial progress
  const size = 95;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    React.createElement(Card, { className: cn(
      "relative overflow-hidden transition-all duration-300 group flex flex-col items-center justify-center p-6",
      "rounded-lg border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]",
      !nonInteractive && "hover:shadow-xl hover:-translate-y-[2px] active:translate-y-0",
      "bg-white",
      onClick && !nonInteractive && "cursor-pointer select-none",
      nonInteractive && "cursor-default",
      selected && cn("shadow-xl", colors.selectedRing),
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
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}

      , React.createElement('div', { className: "relative w-[95px] h-[95px] mb-5 flex items-center justify-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
        , React.createElement('svg', { 
            width: size, 
            height: size, 
            viewBox: `0 0 ${size} ${size}`, 
            className: "transform -rotate-90 overflow-visible",
            __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}
          , React.createElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r: radius,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: strokeWidth,
            className: "text-[#f3f4f6]" // Background ring
            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}
          )
          , React.createElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r: radius,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: strokeWidth,
            strokeLinecap: "butt", // Keep flat for matching design
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            className: cn("transition-all duration-1000 ease-out", colors.stroke)
            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
          )
        )
        , React.createElement('div', { className: "absolute inset-0 flex items-center justify-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
          , React.createElement('span', { className: "text-lg font-bold text-[#0f172a] tracking-tight", __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
            , Math.round(clampedPct), "%"
          )
        )
      )

      , React.createElement('div', { className: "flex flex-col items-center text-center px-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}
        , React.createElement('h3', { className: "text-[#0f172a] dark:text-white font-bold text-base mb-1.5 line-clamp-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
          , title
        )
        , React.createElement('p', { className: "text-[#64748b] dark:text-gray-400 text-[12px] leading-tight font-medium w-[120%]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
          , status
        )
      )
    )
  );
}

