import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getNextLeadToCall, getCallingProgress, getHandoverBrokers } from "@/app/actions/crm/calling";
import CallingFocusMode from "@/components/crm/calling/calling-focus-mode";

export default async function CallingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if ((session.role !== "broker" && session.role !== "operator")) redirect("/dashboard");

  const isOperator = session.role === "operator";
  const [lead, progress, brokers] = await Promise.all([
    getNextLeadToCall(),
    getCallingProgress(),
    isOperator ? getHandoverBrokers() : Promise.resolve([]),
  ]);

  return (
    <CallingFocusMode
      initialLead={lead}
      initialProgress={progress}
      handoverBrokers={isOperator ? brokers : null}
    />
  );
}
