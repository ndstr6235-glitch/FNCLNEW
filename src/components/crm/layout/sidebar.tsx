"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  UserCog,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  PhoneCall,
  Ticket,
  Database,
  type LucideIcon,
} from "lucide-react";
import { NAV_SECTIONS, ROLE_META } from "@/lib/crm/constants";
import { cn } from "@/lib/crm/utils";
import { useSidebar } from "./sidebar-context";
import type { Role } from "@/lib/crm/types";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  calling: PhoneCall,
  clients: Users,
  database: Database,
  tickets: Ticket,
  calendar: Calendar,
  emails: Mail,
  contracts: FileText,
  documents: FileText,
  users: UserCog,
  templates: FileText,
  settings: Settings,
};

interface SidebarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(user.role)),
  })).filter((section) => section.items.length > 0);

  const activeKey = pathname.split("/")[1] || "dashboard";
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  function handleNav(key: string) {
    router.push(`/${key}`);
  }

  const sidebarContent = (isOverlay: boolean) => {
    const isCompact = !isOverlay && collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 shrink-0 border-b border-white/[0.06]",
          isCompact ? "px-3 py-4 justify-center" : "px-5 py-5"
        )}>
          <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-[0_0_16px_rgba(184,145,42,0.35)]">
            P
          </div>
          {(isOverlay || !collapsed) && (
            <div className="min-w-0">
              <span className="text-[15px] font-bold text-white whitespace-nowrap leading-tight block">
                Puskin & Partners
              </span>
              <span className="text-[10px] font-medium text-white/30 tracking-[0.5px] whitespace-nowrap">
                CRM
              </span>
            </div>
          )}
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-2 overflow-y-auto pb-2 mt-3">
          {visibleSections.map((section, sectionIdx) => (
            <div key={section.title}>
              {isCompact ? (
                sectionIdx > 0 && (
                  <div className="mx-2 my-3 h-px bg-white/[0.05]" />
                )
              ) : (
                <div className="px-3 mt-5 mb-2 text-[10px] uppercase tracking-[1.5px] font-bold text-white/30">
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeKey === item.key;
                  const Icon = ICON_MAP[item.key] || LayoutDashboard;

                  return (
                    <div key={item.key} className="relative group">
                      <button
                        onClick={() => handleNav(item.key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 text-left relative",
                          isActive
                            ? "bg-gradient-to-r from-amber-600/15 to-amber-600/0 text-amber-400"
                            : "text-white/55 hover:text-white hover:bg-white/[0.08] hover:translate-x-0.5",
                          isCompact && "justify-center px-2.5"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-amber-500" />
                        )}
                        <Icon size={17} className="shrink-0" />
                        {(isOverlay || !collapsed) && (
                          <span className="whitespace-nowrap flex-1">{item.label}</span>
                        )}
                      </button>
                      {isCompact && !isOverlay && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-[6px] bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md border border-white/10 z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        {!isOverlay && (
          <div className="hidden lg:block px-2 mb-2">
            <button
              onClick={toggleCollapsed}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all text-sm"
            >
              <ChevronLeft
                size={15}
                className={cn(
                  "transition-transform duration-250",
                  collapsed ? "rotate-180" : ""
                )}
              />
              {!collapsed && (
                <span className="whitespace-nowrap text-[12px]">Sbalit</span>
              )}
            </button>
          </div>
        )}

        {/* Bottom — user + logout */}
        <div className="border-t border-white/[0.06] px-3 pt-3 pb-4 shrink-0">
          <div className={cn(
            "flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-white/[0.05] transition-colors cursor-pointer mb-3",
            isCompact && "justify-center p-2"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-600/10 ring-1 ring-amber-500/40 flex items-center justify-center text-[11px] font-bold text-amber-400 shrink-0">
              {initials}
            </div>
            {(isOverlay || !collapsed) && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-white/35 truncate mt-0.5">
                  {ROLE_META[user.role as keyof typeof ROLE_META]?.label ?? user.role}
                </p>
              </div>
            )}
          </div>

          <form action="/api/crm/logout" method="POST">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm",
                isCompact && "justify-center px-2"
              )}
            >
              <LogOut size={15} className="shrink-0" />
              {(isOverlay || !collapsed) && (
                <span className="whitespace-nowrap text-[13px]">Odhlasit</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar (lg+) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-dvh bg-gray-950 z-40 transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Tablet sidebar (md to lg) — always collapsed */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-dvh w-[68px] bg-gray-950 z-40 overflow-hidden">
        {sidebarContent(false)}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-gray-950 flex flex-col">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
