/** Odkaz na dokument přes přihlášené CRM (soubory v úložišti jsou soukromé). */
export function documentHref(documentId: string): string {
  return `/api/crm/documents/${documentId}`;
}
