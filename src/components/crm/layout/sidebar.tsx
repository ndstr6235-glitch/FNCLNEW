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
  Globe,
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
  cms: Globe,
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
          "flex items-center gap-3 shrink-0 border-b border-[rgba(239,234,225,0.08)]",
          isCompact ? "px-3 py-4 justify-center" : "px-5 py-5"
        )}>
          <div className="shrink-0">
            <div className="font-heading text-[15px] text-on-dark tracking-[.2em] uppercase leading-tight">PUSKIN</div>
            {(isOverlay || !collapsed) && (
              <div className="text-[9px] text-brass tracking-[.35em] uppercase font-medium">PARTNERS</div>
            )}
          </div>
          {(isOverlay || !collapsed) && (
            <div className="min-w-0 ml-auto">
              <span className="text-[10px] font-medium text-on-dark/30 tracking-[0.5px] whitespace-nowrap">
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
                  <div className="mx-2 my-3 h-px bg-[rgba(239,234,225,0.06)]" />
                )
              ) : (
                <div className="px-3 mt-5 mb-2 text-[10px] uppercase tracking-[1.5px] font-bold text-on-dark/30">
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
                          "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left relative",
                          isActive
                            ? "bg-[rgba(169,136,78,0.12)] text-brass-dark"
                            : "text-on-dark/55 hover:text-on-dark hover:bg-[rgba(239,234,225,0.06)] hover:translate-x-0.5",
                          isCompact && "justify-center px-2.5"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] bg-brass" />
                        )}
                        <Icon size={17} className="shrink-0" />
                        {(isOverlay || !collapsed) && (
                          <span className="whitespace-nowrap flex-1">{item.label}</span>
                        )}
                      </button>
                      {isCompact && !isOverlay && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-ink text-on-dark text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity border border-[rgba(239,234,225,0.1)] z-50">
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-on-dark/30 hover:text-on-dark/60 hover:bg-[rgba(239,234,225,0.04)] transition-all text-sm"
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
        <div className="border-t border-[rgba(239,234,225,0.08)] px-3 pt-3 pb-4 shrink-0">
          <div className={cn(
            "flex items-center gap-3 p-2.5 hover:bg-[rgba(239,234,225,0.04)] transition-colors cursor-pointer mb-3",
            isCompact && "justify-center p-2"
          )}>
            <div className="w-8 h-8 bg-[rgba(169,136,78,0.15)] border border-brass/30 flex items-center justify-center text-[11px] font-bold text-brass shrink-0">
              {initials}
            </div>
            {(isOverlay || !collapsed) && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-dark truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-on-dark/35 truncate mt-0.5">
                  {ROLE_META[user.role as keyof typeof ROLE_META]?.label ?? user.role}
                </p>
              </div>
            )}
          </div>

          <form action="/api/crm/logout" method="POST">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-on-dark/35 hover:text-ruby hover:bg-ruby/10 transition-all text-sm",
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
          "hidden lg:flex flex-col fixed left-0 top-0 h-dvh bg-ink z-40 transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Tablet sidebar (md to lg) — always collapsed */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-dvh w-[68px] bg-ink z-40 overflow-hidden">
        {sidebarContent(false)}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-ink flex flex-col">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
