const _jsxFileName = "";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, ArrowRight } from "lucide-react";

// Monument/Specialty Image Mapping
const getMonumentImage = (title) => {
  if (!title) return null;
  const t = title.toLowerCase();
  if (t.includes('lahore')) return 'url("https://images.unsplash.com/photo-1584442628467-2c262cb473ca?auto=format&fit=crop&q=80&w=400")'; // Badshahi Mosque
  if (t.includes('multan')) return 'url("https://images.unsplash.com/photo-1627874254881-807dbe637013?auto=format&fit=crop&q=80&w=400")'; // Shrine vibes
  if (t.includes('faisalabad')) return 'url("https://images.unsplash.com/photo-1563605658686-2c5e5fb3922d?auto=format&fit=crop&q=80&w=400")'; // Clock tower/Industrial
  if (t.includes('bahawalpur')) return 'url("https://images.unsplash.com/photo-1626084048476-d98da55a9094?auto=format&fit=crop&q=80&w=400")'; // Noor Mahal vibes
  if (t.includes('chiniot')) return 'url("https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=400")'; // Wooden Furniture/Crafts
  if (t.includes('rawalpindi')) return 'url("https://images.unsplash.com/photo-1596485888242-df21ef884260?auto=format&fit=crop&q=80&w=400")'; 
  if (t.includes('sargodha')) return 'url("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=400")'; 
  if (t.includes('gujranwala')) return 'url("https://images.unsplash.com/photo-1563725171731-0df8e8a61d15?auto=format&fit=crop&q=80&w=400")';
  // Default architecture texture placeholder
  return 'url("https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&q=80&w=400")';
};

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
      bg: "bg-emerald-50/90 dark:bg-emerald-950/80",
      text: "text-emerald-600 dark:text-emerald-400",
      progress: "bg-emerald-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900"
    },
    blue: {
      border: "border-emerald-600",
      bg: "bg-emerald-50/90 dark:bg-emerald-950/80",
      text: "text-emerald-700 dark:text-emerald-300",
      progress: "bg-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900"
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-50/90 dark:bg-orange-950/80",
      text: "text-orange-600 dark:text-orange-400",
      progress: "bg-orange-500",
      iconBg: "bg-orange-100 dark:bg-orange-900"
    },
    red: {
      border: "border-red-500",
      bg: "bg-red-50/90 dark:bg-red-950/80",
      text: "text-red-600 dark:text-red-400",
      progress: "bg-red-500",
      iconBg: "bg-red-100 dark:bg-red-900"
    },
    purple: {
      border: "border-purple-500",
      bg: "bg-purple-50/90 dark:bg-purple-950/80",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500",
      iconBg: "bg-purple-100 dark:bg-purple-900"
    },
    indigo: {
      border: "border-indigo-500",
      bg: "bg-indigo-50/90 dark:bg-indigo-950/80",
      text: "text-indigo-600 dark:text-indigo-400",
      progress: "bg-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-900"
    },
    teal: {
      border: "border-teal-500",
      bg: "bg-teal-50/90 dark:bg-teal-950/80",
      text: "text-teal-600 dark:text-teal-400",
      progress: "bg-teal-500",
      iconBg: "bg-teal-100 dark:bg-teal-900"
    },
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-50/90 dark:bg-cyan-950/80",
      text: "text-cyan-600 dark:text-cyan-400",
      progress: "bg-cyan-500",
      iconBg: "bg-cyan-100 dark:bg-cyan-900"
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-50/90 dark:bg-amber-950/80",
      text: "text-amber-600 dark:text-amber-400",
      progress: "bg-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900"
    }
  };

  const colors = colorClasses[cardColor] || colorClasses.blue;
  const bgImage = getMonumentImage(title);

  return (
    React.createElement(Card, { 
      className: cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "rounded-lg border border-border/60",
        className
      ),
      onClick: onClick, __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}

      /* Image Background Layer with Overlay */
      , React.createElement('div', { 
        className: "absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105", 
        style: { backgroundImage: bgImage, opacity: 0.10 },
        __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}
      })
      , React.createElement('div', { className: cn("absolute inset-0 z-0", colors.bg), __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}})
      
      /* Subtle light blow effect */
      , React.createElement('div', { className: cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 opacity-20 group-hover:opacity-35 transition-opacity z-0 bg-white/50"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}})

      , React.createElement(CardContent, { className: "relative z-10 p-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
        , React.createElement('div', { className: "flex flex-col gap-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
          /* Title row (simple, no inner panel) */
          , React.createElement('div', { className: "flex items-start justify-between gap-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}
            , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
              , React.createElement('h3', { className: "truncate text-[13px] sm:text-sm font-bold font-heading text-slate-800 dark:text-white", __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
                , title
              )
              , React.createElement('div', { className: "mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700/80 dark:text-slate-200 border border-white/40 bg-white/35", __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                , status
              )
            )
            , React.createElement('div', { className: cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 shadow-sm bg-white/50", colors.iconBg), __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}
              , React.createElement(TrendingUp, { className: cn("h-4 w-4", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}} )
            )
          )

          /* Value row */
          , React.createElement('div', { className: "flex items-end justify-between", __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}
            , React.createElement('div', { className: "flex items-baseline gap-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}
              , React.createElement('span', { className: cn("text-[22px] sm:text-[24px] font-extrabold font-heading tabular-nums tracking-tight leading-none", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
                , progressLabel
              )
              , React.createElement('span', { className: cn("text-[11px] font-bold opacity-80", colors.text), __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, "%")
            )
            , React.createElement(ArrowRight, { className: cn("h-5 w-5 text-slate-600/60 group-hover:translate-x-1 group-hover:text-slate-900 transition-all"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}} )
          )

          /* Progress bar (slimmer, cleaner like your 3rd example) */
          , React.createElement('div', { className: "relative h-2 w-full overflow-hidden rounded-full bg-white/50 border border-white/40 shadow-inner", __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
            , React.createElement('div', {
              className: cn("h-full rounded-full transition-all duration-700 ease-out", colors.progress),
              style: { width: `${progress}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
            )
          )
        )
      )
    )
  );
}

