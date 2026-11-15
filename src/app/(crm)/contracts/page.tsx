import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import FinalContractForm from "@/components/crm/contracts/final-contract-form";

export default async function ContractsRoute() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Brokers cannot access contracts
  if (session.role === "broker") redirect("/dashboard");

  return <FinalContractForm />;
}
