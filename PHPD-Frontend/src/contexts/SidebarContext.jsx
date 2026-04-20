const _jsxFileName = "";
import React from "react";
import { createContext, useContext, useMemo, useState, } from "react";









const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    React.createElement(SidebarContext.Provider, {
      value: useMemo(
        () => ({
          isCollapsed,
          toggleSidebar,
          setCollapsed: setIsCollapsed,
          mobileSidebarOpen,
          setMobileSidebarOpen,
        }),
        [isCollapsed, mobileSidebarOpen],
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 22}}

      , children
    )
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

