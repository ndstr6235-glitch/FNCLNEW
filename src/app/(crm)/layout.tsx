import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/crm/layout/sidebar-context";
import Sidebar from "@/components/crm/layout/sidebar";
import DashboardMain from "@/components/crm/layout/dashboard-main";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Allow login page without auth
  if (!session) {
    return <>{children}</>;
  }

  const user = {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    role: session.role,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh overflow-x-hidden max-w-[100dvw]">
        <Sidebar user={user} />
        <DashboardMain
          firstName={user.firstName}
          lastName={user.lastName}
        >
          {children}
        </DashboardMain>
      </div>
    </SidebarProvider>
  );
}
