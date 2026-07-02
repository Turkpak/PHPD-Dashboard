const _jsxFileName = "";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";






export function Layout({ children, title = "Dashboard", showHeader = true, headerActions = null }) {
  const { isCollapsed } = useSidebar();

  return (
    React.createElement('div', { 
      className: "min-h-screen w-full overflow-x-hidden transition-colors duration-500 bg-background",
       __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}
      , React.createElement(Sidebar, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 17}} )
      , React.createElement('div', { className: cn(
        "flex flex-col min-h-screen min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 18}}
        , showHeader ? React.createElement(Header, { title: title, actions: headerActions, __self: this, __source: {fileName: _jsxFileName, lineNumber: 22}} ) : null
        , React.createElement('main', { className: "flex-1 min-h-0 p-3 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-[1600px] mx-auto min-w-0 box-border"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}
          , children
        )
        , React.createElement(Footer, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 26}} )
      )
    )
  );
}