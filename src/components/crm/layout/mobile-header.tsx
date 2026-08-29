"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

interface MobileHeaderProps {
  firstName: string;
  lastName: string;
}

export default function MobileHeader({ firstName, lastName }: MobileHeaderProps) {
  const { toggleMobileOpen } = useSidebar();
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <header
      className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 bg-paper border-b border-border"
      style={{
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <button
        onClick={toggleMobileOpen}
        className="w-12 h-12 -ml-1 flex items-center justify-center hover:bg-surface-hover transition-colors"
        aria-label="Menu"
      >
        <Menu size={22} className="text-ink" />
      </button>

      <div>
        <span className="font-heading text-sm text-ink tracking-[.15em] uppercase">PUSKIN</span>
        <span className="text-[9px] text-brass tracking-[.25em] uppercase font-medium ml-1">PARTNERS</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="w-9 h-9 bg-[rgba(169,136,78,0.12)] flex items-center justify-center text-xs font-bold text-brass">
          {initials}
        </div>
      </div>
    </header>
  );
}
