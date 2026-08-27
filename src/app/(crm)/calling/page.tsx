import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getNextLeadToCall, getCallingProgress } from "@/app/actions/crm/calling";
import CallingFocusMode from "@/components/crm/calling/calling-focus-mode";

export default async function CallingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "broker") redirect("/dashboard");

  const [lead, progress] = await Promise.all([
    getNextLeadToCall(),
    getCallingProgress(),
  ]);

  return <CallingFocusMode initialLead={lead} initialProgress={progress} />;
}
