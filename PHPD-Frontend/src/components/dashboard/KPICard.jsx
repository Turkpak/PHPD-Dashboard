const _jsxFileName = "";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";










export function KPICard({ title, value, trend, trendLabel = "vs last hour", icon: Icon, className }) {
  const isPositive = trend && trend > 0;
  const isNeutral = trend === 0;

  return (
    React.createElement(Card, { className: className, __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}}
      , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}
        , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}
          , title
        )
        , React.createElement(Icon, { className: "h-4 w-4 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}} )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 25}}
        , React.createElement('div', { className: "text-2xl font-bold font-heading"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 26}}, value)
        , trend !== undefined && (
          React.createElement('p', { className: "text-xs text-muted-foreground flex items-center mt-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}
            , isPositive ? (
              React.createElement(ArrowUpRight, { className: "h-4 w-4 text-emerald-500 mr-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 30}} )
            ) : isNeutral ? (
              React.createElement(Minus, { className: "h-4 w-4 text-yellow-500 mr-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}} )
            ) : (
              React.createElement(ArrowDownRight, { className: "h-4 w-4 text-rose-500 mr-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}} )
            )
            , React.createElement('span', { className: isPositive ? "text-emerald-500 font-medium" : isNeutral ? "text-yellow-500" : "text-rose-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
              , Math.abs(trend), "%"
            )
            , React.createElement('span', { className: "ml-1 opacity-70" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}}, trendLabel)
          )
        )
      )
    )
  );
}