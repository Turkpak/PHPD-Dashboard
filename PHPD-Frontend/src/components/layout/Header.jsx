const _jsxFileName = "";
import React from "react";
import { Bell, Menu, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/contexts/SidebarContext";

export function Header({ title, actions = null }) {
  const { setMobileSidebarOpen } = useSidebar();

  return (
    <header className="relative flex h-14 sm:h-16 items-center border-b bg-card/25 backdrop-blur px-3 sm:px-8 sticky top-0 z-20 min-w-0">
      <div className="flex w-full items-center gap-2 min-w-0">

        {/* Hamburger — mobile only */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-8 w-8 shrink-0 bg-card/90 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Title — grows to fill available space */}
        <h1 className="flex-1 min-w-0 text-base sm:text-xl md:text-2xl font-heading font-bold text-foreground truncate md:whitespace-normal md:overflow-visible">
          <span className="sm:hidden">
            {title.trim().toLowerCase() === "phpd progress dashboard"
              ? "PHPD Dashboard"
              : title.length > 22 ? title.slice(0, 20) + "…" : title}
          </span>
          <span className="hidden sm:inline">{title}</span>
        </h1>

        {/* Desktop actions + bell */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {actions}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          </Button>
        </div>

        {/* Mobile: show actions in a dropdown if provided, otherwise just bell */}
        <div className="flex md:hidden items-center gap-1 shrink-0">
          {actions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2 min-w-[180px]">
                {actions}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5 bg-secondary" />
    </header>
  );
}
