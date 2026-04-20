import React from "react";
const _jsxFileName = "";export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    React.createElement('footer', { className: "border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 5}}
      , React.createElement('div', { className: "mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 6}}
        , React.createElement('div', { className: "flex flex-col sm:flex-row items-center justify-between gap-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 7}}
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}
            , React.createElement('p', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}, "© "
               , currentYear, " All copyrights reserved for"    , " "
              , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 11}}, "NESPAK")
            )
          )
          , React.createElement('div', { className: "flex items-center gap-2 text-xs text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}}
            , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}, "PHPD Dashboard"  )
            , React.createElement('span', { className: "text-muted-foreground/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}, "•")
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 17}}, "Health & Population Department"   )
          )
        )
      )
    )
  );
}

