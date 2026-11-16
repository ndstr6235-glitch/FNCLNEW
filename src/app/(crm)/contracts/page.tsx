import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import FinalContractForm from "@/components/crm/contracts/final-contract-form";

export default async function ContractsRoute() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Only the administrator fills in and sends final contracts
  if (session.role !== "administrator") redirect("/dashboard");

  return <FinalContractForm senderName={`${session.firstName} ${session.lastName}`.trim()} />;
}
