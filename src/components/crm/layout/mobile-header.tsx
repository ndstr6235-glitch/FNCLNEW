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
      className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 bg-white border-b border-gray-200 shadow-sm"
      style={{
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <button
        onClick={toggleMobileOpen}
        className="w-12 h-12 -ml-1 flex items-center justify-center rounded-[8px] hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <Menu size={22} className="text-gray-900" />
      </button>

      <span className="text-sm font-bold text-gray-900">
        Puskin & Partners
      </span>

      <div className="flex items-center gap-1">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
          {initials}
        </div>
      </div>
    </header>
  );
}
