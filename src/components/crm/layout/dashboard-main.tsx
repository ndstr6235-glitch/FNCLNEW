"use client";

import { cn } from "@/lib/crm/utils";
import { useSidebar } from "./sidebar-context";
import MobileHeader from "./mobile-header";
import NotificationBell from "./notification-bell";

interface DashboardMainProps {
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function DashboardMain({
  firstName,
  lastName,
  isAdmin,
  children,
}: DashboardMainProps) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-w-0 w-full overflow-x-hidden transition-[margin] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "md:ml-[68px]",
        collapsed ? "lg:ml-[68px]" : "lg:ml-[220px]"
      )}
    >
      <MobileHeader firstName={firstName} lastName={lastName} isAdmin={isAdmin} />

      {/* Desktop notification bell — the mobile one lives in the header */}
      <div className="hidden md:flex justify-end px-6 pt-4 -mb-2">
        <NotificationBell isAdmin={isAdmin} />
      </div>
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 lg:py-8 lg:px-9">
        {children}
      </main>
    </div>
  );
}
