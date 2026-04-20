const _jsxFileName = "";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";













const getColorIntensity = (value) => {
  if (value >= 90) return "bg-emerald-600";
  if (value >= 80) return "bg-emerald-500";
  if (value >= 70) return "bg-emerald-600";
  if (value >= 60) return "bg-emerald-500";
  if (value >= 50) return "bg-orange-400";
  if (value >= 40) return "bg-orange-500";
  if (value >= 30) return "bg-red-500";
  return "bg-red-600";
};

export function HeatmapChart({ data }) {
  const phases = [
    { key: "surveys", label: "Surveys" },
    { key: "foundations", label: "Foundations" },
    { key: "cabinet", label: "Cabinet" },
    { key: "cable", label: "Cable" },
    { key: "controlRoom", label: "Control Room" },
    { key: "ppic3", label: "PPIC3" },
  ];

  const sortedData = [...data].sort((a, b) => {
    const avgA = (a.surveys + a.foundations + a.cabinet + a.cable + a.controlRoom + a.ppic3) / 6;
    const avgB = (b.surveys + b.foundations + b.cabinet + b.cable + b.controlRoom + b.ppic3) / 6;
    return avgB - avgA;
  });

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50 border-2 transition-colors hover:border-primary/60"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}
        , React.createElement(CardTitle, { className: "font-heading text-lg sm:text-xl font-bold leading-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}, "Progress Heatmap" )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}}, "Visual comparison of all phases across all cities"       )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
        , React.createElement('div', { className: "-mx-4 sm:mx-0 overflow-x-auto overflow-x-touch"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
          , React.createElement('div', { className: "min-w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
            , React.createElement('table', { className: "w-full border-collapse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
              , React.createElement('thead', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
                , React.createElement('tr', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
                  , React.createElement('th', { className: "text-left p-3 font-semibold text-sm border-b sticky left-0 bg-card z-10"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, "City")
                  , phases.map((phase) => (
                    React.createElement('th', { key: phase.key, className: "text-center p-3 font-semibold text-sm border-b min-w-[88px] sm:min-w-[100px]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
                      , phase.label
                    )
                  ))
                )
              )
              , React.createElement('tbody', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
                , sortedData.map((city, index) => (
                  React.createElement('tr', { key: city.city, className: index % 2 === 0 ? "bg-muted/30" : "", __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
                    , React.createElement('td', { className: "p-3 font-semibold text-sm border-b sticky left-0 bg-inherit z-10"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
                      , city.city
                    )
                    , phases.map((phase) => {
                      const value = city[phase.key ] ;
                      return (
                        React.createElement('td', { key: phase.key, className: "p-2 sm:p-3 text-center border-b"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
                          , React.createElement('div', { className: "flex flex-col items-center gap-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
                            , React.createElement('div', { className: `w-14 sm:w-16 h-8 rounded ${getColorIntensity(value)} flex items-center justify-center`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}
                              , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}, value, "%")
                            )
                          )
                        )
                      );
                    })
                  )
                ))
              )
            )
          )
        )

        /* Legend */
        , React.createElement('div', { className: "mt-6 pt-4 border-t"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
          , React.createElement('div', { className: "flex flex-col gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
            , React.createElement('h4', { className: "text-sm font-semibold text-foreground mb-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, "Progress Legend" )
            , React.createElement('div', { className: "flex flex-wrap items-center gap-4 text-xs"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-emerald-600 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}, "100%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "90-100%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-emerald-500 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, "85%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}, "80-89%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-emerald-600 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}, "75%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, "70-79%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-emerald-500 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, "65%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}, "60-69%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-orange-400 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}, "55%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, "50-59%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-orange-500 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}, "45%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}, "40-49%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-red-500 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "35%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}, "30-39%")
              )
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
                , React.createElement('div', { className: "w-12 h-6 rounded bg-red-600 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                  , React.createElement('span', { className: "text-white text-xs font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}, "25%")
                )
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}, "<30%")
              )
            )
          )
        )
      )
    )
  );
}

