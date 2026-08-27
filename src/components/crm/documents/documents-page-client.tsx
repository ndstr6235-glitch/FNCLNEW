"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Download,
  Search,
  ExternalLink,
  Mail,
  AlertTriangle,
  CircleCheck,
  RefreshCw,
  Loader2,
  Zap,
  Upload,
} from "lucide-react";
import { fmtDate } from "@/lib/crm/utils";
import { useToast } from "@/components/crm/ui/toast";
import {
  regenerateContractPdf,
  regenerateAllMissingPdfs,
} from "@/app/actions/crm/regenerate-pdf";
import { uploadPdfToSentEmail } from "@/app/actions/crm/upload-to-sent";
import type { SentDocumentRow } from "@/app/actions/crm/documents";

interface Props {
  documents: SentDocumentRow[];
  currentSearch: string;
  currentType: string;
}

function fmtSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeMeta(row: SentDocumentRow) {
  const isSmlouva =
    row.name.includes("Smlouva") || row.templateLabel === "Smlouva finální";
  const isNavrh =
    row.name.includes("Návrh") || row.templateLabel === "Návrh smlouvy";
  if (isSmlouva)
    return { label: "Smlouva finální", color: "emerald" };
  if (isNavrh) return { label: "Návrh smlouvy", color: "gold" };
  return { label: "Dokument", color: "sapphire" };
}

export default function DocumentsPageClient({
  documents,
  currentSearch,
  currentType,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [search, setSearch] = useState(currentSearch);
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set());
  const [bulkPending, startBulkTransition] = useTransition();

  async function handleRegenerate(rowId: string) {
    // rowId pro SentEmail je prefixované "se-"
    const sentEmailId = rowId.startsWith("se-") ? rowId.slice(3) : rowId;
    setRegenerating((prev) => new Set(prev).add(rowId));
    const res = await regenerateContractPdf(sentEmailId);
    setRegenerating((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    if (res.success) {
      toast("PDF zregenerováno a archivováno");
      router.refresh();
    } else {
      toast(res.error || "Regenerace selhala", "error");
    }
  }

  async function handleUpload(rowId: string, file: File) {
    const sentEmailId = rowId.startsWith("se-") ? rowId.slice(3) : rowId;
    setRegenerating((prev) => new Set(prev).add(rowId));
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadPdfToSentEmail(sentEmailId, fd);
    setRegenerating((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    if (res.success) {
      toast("PDF nahráno a archivováno");
      router.refresh();
    } else {
      toast(res.error || "Upload selhal", "error");
    }
  }

  function handlePickFile(rowId: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleUpload(rowId, f);
    };
    input.click();
  }

  function handleBulkRegenerate() {
    if (
      !confirm(
        "Zregenerovat PDF pro VŠECHNY záznamy bez PDF? Může to chvíli trvat."
      )
    )
      return;
    startBulkTransition(async () => {
      const res = await regenerateAllMissingPdfs();
      if (res.success) {
        toast(
          `Hotovo: ${res.generated} zregenerováno, ${res.failed} selhalo`
        );
        router.refresh();
      } else {
        toast("Bulk regenerace selhala", "error");
      }
    });
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (search === currentSearch) return;
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (currentType !== "all") params.set("type", currentType);
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
  }, [search, currentSearch, currentType, pathname, router]);

  function setType(type: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (type !== "all") params.set("type", type);
    router.push(`${pathname}?${params.toString()}`);
  }

  const archivedCount = documents.filter((d) => d.archived).length;
  const noPdfCount = documents.length - archivedCount;

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Dokumenty a odeslané smlouvy
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            Archiv všech odeslaných smluv a návrhů.{" "}
            <span className="text-emerald font-medium">
              {archivedCount} s PDF
            </span>
            {noPdfCount > 0 && (
              <>
                {" · "}
                <span className="text-amber font-medium">
                  {noPdfCount} bez PDF
                </span>
              </>
            )}
            {" · celkem "}
            <span className="font-medium">{documents.length}</span>
          </p>
        </div>
        {noPdfCount > 0 && (
          <button
            onClick={handleBulkRegenerate}
            disabled={bulkPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-60"
            title="Pokusit se zregenerovat PDF pro všechny řádky 'Bez PDF' z uložených dat"
          >
            {bulkPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            {bulkPending ? "Generuji…" : `Zregenerovat všech ${noPdfCount}`}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat klienta, e-mail příjemce, předmět…"
            className="w-full pl-10 pr-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>
        <div className="flex gap-2">
          {[
            { v: "all", l: "Vše" },
            { v: "smlouva", l: "Smlouvy" },
            { v: "navrh", l: "Návrhy" },
          ].map((opt) => {
            const active = currentType === opt.v;
            return (
              <button
                key={opt.v}
                onClick={() => setType(opt.v)}
                className={`flex-1 sm:flex-none px-4 py-2 min-h-[44px] rounded-[10px] text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold text-white shadow-sm"
                    : "bg-surface border border-border text-text-mid hover:bg-surface-hover"
                }`}
              >
                {opt.l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-[12px] border border-border">
          <FileText size={36} className="mx-auto text-text-dim mb-3" />
          <p className="text-sm text-text-dim">Žádné dokumenty</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-surface rounded-[12px] border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-hover">
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-dim">
                  <th className="px-4 py-3 font-medium">Klient</th>
                  <th className="px-4 py-3 font-medium">Typ</th>
                  <th className="px-4 py-3 font-medium">Předmět / Název</th>
                  <th className="px-4 py-3 font-medium">Komu</th>
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Velikost</th>
                  <th className="px-4 py-3 font-medium">Operátor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((d) => {
                  const t = typeMeta(d);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <a
                          href={`/clients?open=${d.clientId}`}
                          className="text-text hover:underline font-medium"
                        >
                          {d.clientName}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-${t.color}-pale text-${t.color} border border-${t.color}-border whitespace-nowrap`}
                        >
                          {t.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-mid">
                        <div
                          className="truncate max-w-[280px]"
                          title={d.emailSubject || d.name}
                        >
                          {d.emailSubject || d.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-dim whitespace-nowrap">
                        {d.emailTo ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail size={11} />
                            {d.emailTo}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-dim whitespace-nowrap">
                        {fmtDate(d.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-dim whitespace-nowrap">
                        {fmtSize(d.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-dim">
                        {d.uploaderName}
                      </td>
                      <td className="px-4 py-3">
                        {d.archived ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald">
                            <CircleCheck size={11} />
                            Archivováno
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber"
                            title="PDF nebylo archivováno — odesláno před zavedením archivace dnes"
                          >
                            <AlertTriangle size={11} />
                            Bez PDF
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {d.archived ? (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] text-text-mid hover:text-text hover:bg-surface transition-colors"
                              title="Otevřít"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <a
                              href={d.fileUrl}
                              download={d.fileName}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-gold text-white text-xs font-medium hover:bg-gold/90 transition-colors"
                            >
                              <Download size={12} />
                              Stáhnout
                            </a>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePickFile(d.id)}
                              disabled={regenerating.has(d.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-sapphire-border bg-sapphire-pale text-sapphire text-xs font-medium hover:bg-sapphire/10 transition-colors disabled:opacity-60"
                              title="Nahrát originální PDF (např. z odchozí pošty)"
                            >
                              <Upload size={11} />
                              Nahrát
                            </button>
                            <button
                              onClick={() => handleRegenerate(d.id)}
                              disabled={regenerating.has(d.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-amber-border bg-amber-pale text-amber text-xs font-medium hover:bg-amber/10 transition-colors disabled:opacity-60"
                              title="Zregenerovat PDF z uložených dat klienta + audit logu"
                            >
                              {regenerating.has(d.id) ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <RefreshCw size={11} />
                              )}
                              {regenerating.has(d.id)
                                ? "Generuji…"
                                : "Regenerovat"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {documents.map((d) => {
              const t = typeMeta(d);
              return (
                <div
                  key={d.id}
                  className="bg-surface rounded-[12px] border border-border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={`/clients?open=${d.clientId}`}
                      className="text-sm font-semibold text-text hover:underline"
                    >
                      {d.clientName}
                    </a>
                    <span
                      className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-${t.color}-pale text-${t.color} border border-${t.color}-border`}
                    >
                      {t.label}
                    </span>
                  </div>
                  <p
                    className="text-xs text-text-mid truncate"
                    title={d.emailSubject || d.name}
                  >
                    {d.emailSubject || d.name}
                  </p>
                  {d.emailTo && (
                    <p className="text-[11px] text-text-dim">
                      <Mail size={10} className="inline mr-1" />
                      {d.emailTo}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-text-dim">
                    <span>
                      {fmtDate(d.createdAt)} · {fmtSize(d.fileSize)}
                    </span>
                    <span>{d.uploaderName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    {d.archived ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald font-medium">
                        <CircleCheck size={11} /> Archivováno
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber font-medium">
                        <AlertTriangle size={11} /> Bez PDF
                      </span>
                    )}
                    {d.archived && (
                      <a
                        href={d.fileUrl}
                        download={d.fileName}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-gold text-white text-xs font-medium"
                      >
                        <Download size={12} />
                        Stáhnout
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {documents.length === 500 && (
        <p className="text-center text-xs text-text-dim mt-4">
          Zobrazeno 500 nejnovějších. Pro starší použij hledání nebo filter.
        </p>
      )}
    </div>
  );
}
