import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LucideBanknote,
  LayoutDashboard,
  Map as MapIcon,
  LogOut,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Navigation2,
  Users,
  FolderKanban,
  UserCog,
  Plus,
  Eye,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { getPermissionForPath } from "@/utils/permissionPaths";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Stakeholders", href: "/stakeholder-management" },
  {
    icon: Navigation2,
    label: "Area Management",
    subItems: [
      { icon: MapPin, label: "Province", href: "/province-management" },
      { icon: MapPin, label: "Division", href: "/division-management" },
      { icon: MapPin, label: "District", href: "/district-management" },
      { icon: MapPin, label: "Tehsil", href: "/tehsil-management" },
    ],
  },
  {
    icon: FolderKanban,
    label: "Projects",
    subItems: [
      { icon: Plus, label: "Create New Project", href: "/project-management/create" },
      { icon: Eye, label: "View All Projects", href: "/project-management/view" },
    ],
  },
  { icon: LucideBanknote, label: "Finance & Budget", href: "/finance" },
  { icon: MapIcon, label: "GIS Layers", href: "/gis" },
  { icon: BarChart3, label: "Citywise Comparison", href: "/comparison" },
  { icon: UserCog, label: "User Management", href: "/user-management", roles: ["super_admin"] },
];

// Active pill: dark green bg + white text
const ACTIVE_CLS = "bg-[#054332] text-white font-bold shadow-md font-heading tracking-wide";
// Inactive: dark slate text, hover light green tint
const INACTIVE_CLS = "text-slate-600 hover:bg-[#054332]/8 hover:text-[#054332] font-semibold font-heading tracking-wide";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { canView, isSuperAdmin } = usePermissions();

  const userRole = (
    (user?.role ?? localStorage.getItem("userRole")) || ""
  ).trim().toLowerCase() || null;

  const { isCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const [accordionValue, setAccordionValue] = useState(undefined);

  useEffect(() => {
    setMobileSidebarOpen(false);
    const itemWithSelectedSub = NAV_ITEMS.find((item) =>
      item.subItems?.some((sub) => location === sub.href)
    );
    if (itemWithSelectedSub) setAccordionValue(itemWithSelectedSub.label);
  }, [location]);

  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (item.roles && (!userRole || !item.roles.includes(userRole))) return false;
      if (item.href) {
        const perm = getPermissionForPath(item.href);
        if (!perm) return true;
        if (isSuperAdmin) return true;
        return canView(perm.sidebar_label, perm.sub_label);
      }
      if (item.subItems?.length > 0) {
        const visibleSubs = item.subItems.filter((sub) => {
          const perm = getPermissionForPath(sub.href);
          if (!perm) return true;
          if (isSuperAdmin) return true;
          return canView(perm.sidebar_label, perm.sub_label);
        });
        return visibleSubs.length > 0;
      }
      return true;
    }).map((item) => {
      if (item.subItems?.length > 0) {
        const visibleSubs = item.subItems.filter((sub) => {
          const perm = getPermissionForPath(sub.href);
          if (!perm) return true;
          if (isSuperAdmin) return true;
          return canView(perm.sidebar_label, perm.sub_label);
        });
        return { ...item, subItems: visibleSubs };
      }
      return item;
    });
  }, [userRole, canView, isSuperAdmin]);

  const NavContent = ({ collapsed }) => (
    <div className="flex h-full flex-col gap-2">

      {/* ── HEADER ─────────────────────────────────── */}
      <div className={cn(
        "flex h-[96px] items-center border-b border-slate-100 transition-all duration-300",
        collapsed ? "px-2 justify-center" : "px-3 justify-between"
      )}>
        {!collapsed && (
          <Link href="/" className="flex items-center h-full">
            <img
              src="/Assets/PHPD.png"
              alt="PHPD Logo"
              className="h-[84px] w-auto object-contain drop-shadow-sm"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="flex items-center justify-center">
            <img
              src="/Assets/PHPD.png"
              alt="PHPD Logo"
              className="h-[56px] w-auto object-contain"
            />
          </Link>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-slate-400 hover:text-[#054332] hover:bg-[#054332]/8 hidden md:flex flex-shrink-0"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* ── NAV ITEMS ──────────────────────────────── */}
      <div className="flex-1 overflow-auto py-3 scrollbar-hide">
        <nav className={cn(
          "grid items-start text-sm space-y-0.5 transition-all duration-300",
          collapsed ? "px-2" : "px-3"
        )}>
          {visibleNavItems.map((item) =>
            item.subItems ? (
              <TooltipProvider key={item.label}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>
                      {collapsed ? (
                        <div className={cn(
                          "flex items-center rounded-xl px-2 py-2.5 justify-center transition-all cursor-pointer",
                          item.subItems.some((sub) => location === sub.href)
                            ? ACTIVE_CLS
                            : INACTIVE_CLS
                        )}>
                          <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                        </div>
                      ) : (
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full border-none"
                          value={accordionValue === item.label ? item.label : undefined}
                          onValueChange={(value) => {
                            const hasSelectedSub = item.subItems?.some((sub) => location === sub.href);
                            if (hasSelectedSub && value === undefined) {
                              setAccordionValue(item.label);
                            } else {
                              setAccordionValue(value);
                            }
                          }}
                        >
                          <AccordionItem value={item.label} className="border-none">
                            <AccordionTrigger className={cn(
                              "flex items-center rounded-xl px-3 py-2.5 gap-3 transition-all hover:no-underline",
                              item.subItems.some((sub) => location === sub.href)
                                ? ACTIVE_CLS
                                : INACTIVE_CLS
                            )}>
                              <div className="flex items-center gap-3">
                                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                                <span className="text-[14px] whitespace-nowrap">{item.label}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-1">
                              <div className="flex flex-col gap-0.5 pl-4 ml-4 border-l-2 border-slate-100">
                                {item.subItems.map((sub) => (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-[13px] font-heading",
                                      location === sub.href
                                        ? "text-[#054332] font-bold bg-[#054332]/8"
                                        : "text-slate-500 hover:text-[#054332] hover:bg-[#054332]/5 font-semibold"
                                    )}
                                  >
                                    <sub.icon className="h-3.5 w-3.5" />
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <div className="space-y-1">
                        <p className="font-semibold">{item.label}</p>
                        <div className="space-y-0.5">
                          {item.subItems.map((sub) => (
                            <Link key={sub.href} href={sub.href} className="block text-xs text-muted-foreground hover:text-foreground">
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider key={item.href}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-xl transition-all text-[14px]",
                          collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5 gap-3",
                          location === item.href ? ACTIVE_CLS : INACTIVE_CLS
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      </Link>
                    </div>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          )}
        </nav>
      </div>

      {/* ── USER / LOGOUT FOOTER ───────────────────── */}
      <div className={cn(
        "border-t border-slate-100 mt-auto transition-all duration-300",
        collapsed ? "p-2" : "p-3"
      )}>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <Link
                  href="/auth"
                  onClick={(e) => { e.preventDefault(); logout(); setLocation("/auth"); }}
                  className={cn(
                    "flex items-center rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-red-50 hover:border-red-100 transition-all group",
                    collapsed ? "justify-center" : "justify-between gap-3"
                  )}
                >
                  <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                    <div className="h-9 w-9 rounded-full bg-[#054332]/10 flex items-center justify-center text-[#054332] text-xs font-black border border-[#054332]/20 flex-shrink-0">
                      {userRole === "client" ? "CL" : "AD"}
                    </div>
                    {!collapsed && (
                      <div className="text-xs font-heading">
                        <p className="font-bold text-slate-700 tracking-tight">
                          {userRole === "client" ? "Client Authority" : "Admin Officer"}
                        </p>
                        <p className="text-slate-400 group-hover:text-red-400 transition-colors font-semibold">
                          {userRole === "client" ? "Governance Wing" : "Command Center"}
                        </p>
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <LogOut className="h-4 w-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                  )}
                </Link>
              </div>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <div className="text-xs">
                  <p className="font-semibold">{userRole === "client" ? "Client Authority" : "Admin Officer"}</p>
                  <p className="text-muted-foreground">{userRole === "client" ? "Governance Wing" : "Command Center"}</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      <div className={cn(
        "hidden border-r border-slate-100 bg-sidebar md:block fixed inset-y-0 left-0 z-30 shadow-[2px_0_20px_rgba(0,0,0,0.04)] transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <NavContent collapsed={isCollapsed} />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-none">
          <NavContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
