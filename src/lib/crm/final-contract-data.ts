import type { ProposalPdfData } from "@/lib/crm/proposal-pdf";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Form of the "Smlouva k tisku" page → data for the final contract PDF. */
export function finalContractFromForm(body: Record<string, unknown>): ProposalPdfData {
  const clientName = [str(body.firstName), str(body.lastName)].filter(Boolean).join(" ") || undefined;
  return {
    clientName,
    amount: num(body.amount),
    interestRate: num(body.interestRate),
    duration: str(body.duration),
    payoutFrequency: str(body.payoutFrequency),
    birthDate: str(body.birthDate),
    street: str(body.street),
    city: str(body.city),
    zip: str(body.zip),
    bankAccount: str(body.bankAccount),
    variableSymbol: str(body.variableSymbol),
    startDate: str(body.startDate),
  };
}

/** "Tomáš Marný" → "Tomas-Marny" for the attachment file name. */
export function contractFileName(clientName?: string) {
  const safe =
    (clientName || "prazdna")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "prazdna";
  return `Smlouva-${safe}.pdf`;
}
