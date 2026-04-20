const _jsxFileName = "";
import React from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

export function Header({ title }) {
  const { setMobileSidebarOpen } = useSidebar();

  return (
    React.createElement('header', { className: "relative flex h-16 sm:h-16 items-center border-b bg-card/25 backdrop-blur px-2 sm:px-8 sticky top-0 z-20 min-w-0"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}
      , React.createElement('div', { className: "grid w-full grid-cols-3 items-center"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 10}}
        , React.createElement('div', { className: "flex items-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 11}}
          , React.createElement(Button, {
            variant: "outline",
            size: "icon",
            className: "md:hidden h-8 w-8 bg-card/90 backdrop-blur-sm transform-none"     ,
            onClick: () => setMobileSidebarOpen(true),
            'aria-label': "Open sidebar" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}

            , React.createElement(Menu, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}} )
          )
        )

        , React.createElement('h1', {
          className: "col-start-2 text-center text-xl sm:text-xl md:text-2xl lg:text-2xl font-heading font-bold text-foreground break-words leading-tight block uppercase\r md:normal-case md:col-start-1 md:col-span-2 md:text-left whitespace-normal"
              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}

          /* Mobile shows shorter header to avoid wrapping */
          , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}
            , title.trim().toLowerCase() === "phpd progress dashboard"
              ? "PHPD Dashboard"
              : title
          )
          , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}, title)
        )

        , React.createElement('div', { className: "col-start-3 justify-self-end hidden md:flex items-center gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
          , React.createElement(Button, { variant: "ghost", size: "icon", className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
            , React.createElement(Bell, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}} )
            , React.createElement('span', { className: "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}} )
          )
        )
      )
      , React.createElement('div', { className: "pointer-events-none absolute left-0 right-0 bottom-0 h-0.5 bg-secondary"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}} )
    )
  );
}