import React from "react";
import { createContext, useContext, useMemo, useState } from "react";

const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={useMemo(
        () => ({
          isCollapsed,
          toggleSidebar,
          setCollapsed: setIsCollapsed,
          mobileSidebarOpen,
          setMobileSidebarOpen,
        }),
        [isCollapsed, mobileSidebarOpen]
      )}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
