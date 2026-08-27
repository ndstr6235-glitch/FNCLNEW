import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getUsers } from "@/app/actions/crm/users";
import UsersPageClient from "@/components/crm/users/users-page-client";

export default async function UsersRoute() {
  const session = await getSession();
  if (!session) return null;

  // Only admin + supervisor can access
  if (session.role === "broker") {
    redirect("/dashboard");
  }

  const users = await getUsers();
  const isAdmin = session.role === "administrator";
  const currentUserId = session.id;

  return (
    <UsersPageClient
      users={users}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  );
}
