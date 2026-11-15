"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import Modal from "@/components/crm/ui/modal";
import { useToast } from "@/components/crm/ui/toast";
import { importLeadChunk, finishLeadImport } from "@/app/actions/crm/lead-import";
import {
  LEAD_FIELD_LABELS,
  guessMapping,
  guessSheetMapping,
  looksLikeHeader,
  parseLeadRows,
  type LeadField,
} from "@/lib/crm/lead-parse";

const CHUNK = 300;
const FIELDS = Object.keys(LEAD_FIELD_LABELS) as LeadField[];

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Sheet {
  name: string;
  rows: unknown[][];
}

interface Result {
  inserted: number;
  duplicatesInDb: number;
}

export default function ImportLeadsModal({ open, onClose }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [mapping, setMapping] = useState<Partial<Record<LeadField, number>>>({});
  // Some exports start straight with data — then row 1 is a lead, not a header
  const [hasHeader, setHasHeader] = useState(true);
  // Upload only part of the file — rows "from–to" (1-based, of the data rows)
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [source, setSource] = useState("");
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const sheet = sheets[sheetIdx];
  const header = sheet?.rows[0] ?? [];
  const dataRows = useMemo(
    () => (sheet ? (hasHeader ? sheet.rows.slice(1) : sheet.rows) : []),
    [sheet, hasHeader]
  );
  const from = Math.max(1, parseInt(rangeFrom) || 1);
  const to = Math.min(dataRows.length, parseInt(rangeTo) || dataRows.length);
  const pickedRows = useMemo(() => dataRows.slice(from - 1, Math.max(from - 1, to)), [dataRows, from, to]);
  const summary = useMemo(
    () => (sheet ? parseLeadRows(pickedRows, mapping) : null),
    [sheet, pickedRows, mapping]
  );
  const width = Math.max(header.length, ...dataRows.slice(0, 20).map((r) => r.length));
  const columnLabel = (i: number) => {
    const letter = String.fromCharCode(65 + (i % 26));
    if (hasHeader) return String(header[i] || `Sloupec ${letter}`);
    const example = String(dataRows.find((r) => String(r[i] ?? "").trim())?.[i] ?? "").slice(0, 24);
    return example ? `Sloupec ${letter} – např. „${example}“` : `Sloupec ${letter}`;
  };

  function applySheet(rows: unknown[][]) {
    const withHeader = looksLikeHeader(rows[0] ?? []);
    setHasHeader(withHeader);
    setMapping(guessSheetMapping(rows, withHeader));
  }

  function toggleHeader(value: boolean) {
    if (!sheet) return;
    setHasHeader(value);
    setMapping(guessSheetMapping(sheet.rows, value));
  }

  function reset() {
    setSheets([]);
    setSheetIdx(0);
    setMapping({});
    setHasHeader(true);
    setRangeFrom("");
    setRangeTo("");
    setSource("");
    setProgress(null);
    setResult(null);
  }

  function close() {
    if (progress !== null && !result) return; // import running
    reset();
    onClose();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const parsed: Sheet[] = wb.SheetNames.map((name) => ({
        name,
        // Blank rows (e.g. the title row of a Numbers export) carry nothing
        rows: XLSX.utils
          .sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, defval: "", raw: false })
          .filter((r) => r.some((c) => String(c ?? "").trim())),
      })).filter((s) => s.rows.length > 0);
      if (parsed.length === 0) {
        toast("Soubor neobsahuje žádná data", "error");
        return;
      }
      setSheets(parsed);
      setSheetIdx(0);
      applySheet(parsed[0].rows);
      setSource(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      toast("Soubor se nepodařilo přečíst", "error");
    } finally {
      setReading(false);
    }
  }

  function selectSheet(i: number) {
    setSheetIdx(i);
    applySheet(sheets[i].rows);
  }

  async function handleImport() {
    if (!summary || summary.leads.length === 0) return;
    const total: Result = { inserted: 0, duplicatesInDb: 0 };
    setProgress(0);
    for (let i = 0; i < summary.leads.length; i += CHUNK) {
      const res = await importLeadChunk(summary.leads.slice(i, i + CHUNK), source);
      if (!res.success) {
        toast(res.error, "error");
        setProgress(null);
        return;
      }
      total.inserted += res.inserted;
      total.duplicatesInDb += res.duplicatesInDb;
      setProgress(Math.min(summary.leads.length, i + CHUNK));
    }
    await finishLeadImport(source, total.inserted);
    setResult(total);
    router.refresh();
  }

  const hasName =
    mapping.fullName !== undefined ||
    mapping.firstName !== undefined ||
    mapping.lastName !== undefined;
  const canImport =
    !!summary && summary.leads.length > 0 && hasName && source.trim() !== "" && progress === null;

  return (
    <Modal open={open} onClose={close} title="Nahrát leady">
      {result ? (
        <div className="space-y-4 text-center py-4">
          <CheckCircle2 size={40} className="mx-auto text-emerald" />
          <p className="text-sm text-text">
            Do databáze přibylo{" "}
            <strong>{result.inserted.toLocaleString("cs-CZ")}</strong> leadů.
            {result.duplicatesInDb > 0 &&
              ` ${result.duplicatesInDb.toLocaleString("cs-CZ")} už v CRM bylo.`}
          </p>
          <p className="text-xs text-text-dim">
            Makléři dostanou leady při ranním rozdělování, nebo hned tlačítkem
            „Distribuovat teď“ na dashboardu.
          </p>
          <div className="flex gap-2">
            <button
              onClick={close}
              className="flex-1 px-4 py-2.5 border border-border text-sm font-semibold text-text"
            >
              Zavřít
            </button>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-2.5 bg-brass text-white text-sm font-semibold"
            >
              Na dashboard
            </Link>
          </div>
        </div>
      ) : !sheet ? (
        <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-10 cursor-pointer hover:bg-surface-hover">
          {reading ? (
            <Loader2 size={24} className="animate-spin text-text-dim" />
          ) : (
            <Upload size={24} className="text-text-dim" />
          )}
          <span className="text-sm font-semibold text-text">
            {reading ? "Čtu soubor…" : "Vyberte soubor"}
          </span>
          <span className="text-xs text-text-dim">Excel (.xlsx, .xls) nebo CSV</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            disabled={reading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {sheets.length > 1 && (
            <Field label="List">
              <select
                value={sheetIdx}
                onChange={(e) => selectSheet(Number(e.target.value))}
                className="w-full border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                {sheets.map((s, i) => (
                  <option key={s.name} value={i}>
                    {s.name} ({s.rows.length.toLocaleString("cs-CZ")} řádků)
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Název zdroje (uvidí ho makléř u leadu)">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => toggleHeader(e.target.checked)}
              className="accent-brass"
            />
            První řádek je záhlaví (názvy sloupců)
          </label>

          <div>
            <div className="text-xs font-semibold text-text-mid mb-2">
              Nahrát jen část (nepovinné) — soubor má {dataRows.length.toLocaleString("cs-CZ")} kontaktů
            </div>
            <div className="flex items-center gap-2 text-sm text-text">
              od
              <input
                type="number"
                min={1}
                max={dataRows.length}
                value={rangeFrom}
                placeholder="1"
                onChange={(e) => setRangeFrom(e.target.value)}
                className="w-24 border border-border bg-surface px-2 py-1.5 text-sm text-text"
              />
              do
              <input
                type="number"
                min={1}
                max={dataRows.length}
                value={rangeTo}
                placeholder={String(dataRows.length)}
                onChange={(e) => setRangeTo(e.target.value)}
                className="w-24 border border-border bg-surface px-2 py-1.5 text-sm text-text"
              />
              <span className="text-xs text-text-dim">prázdné = celý soubor</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-text-mid mb-2">Sloupce v souboru</div>
            <div className="grid grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <label key={f} className="text-xs text-text-dim">
                  {LEAD_FIELD_LABELS[f]}
                  <select
                    value={mapping[f] ?? ""}
                    onChange={(e) =>
                      setMapping((m) => ({
                        ...m,
                        [f]: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full border border-border bg-surface px-2 py-1.5 text-sm text-text"
                  >
                    <option value="">—</option>
                    {Array.from({ length: width }, (_, i) => (
                      <option key={i} value={i}>
                        {columnLabel(i)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          {summary && (
            <ul className="bg-surface-hover p-3 text-xs text-text-mid space-y-1">
              <li>
                Řádků v souboru: <strong>{summary.total.toLocaleString("cs-CZ")}</strong>
              </li>
              <li>
                K nahrání:{" "}
                <strong className="text-text">
                  {summary.leads.length.toLocaleString("cs-CZ")}
                </strong>
              </li>
              <li>Bez platného telefonu (přeskočí se): {summary.withoutPhone.toLocaleString("cs-CZ")}</li>
              <li>Duplicitní telefon v souboru: {summary.duplicatesInFile.toLocaleString("cs-CZ")}</li>
            </ul>
          )}

          {progress !== null && summary && (
            <div className="h-1.5 bg-surface-hover">
              <div
                className="h-full bg-brass transition-all"
                style={{ width: `${(progress / summary.leads.length) * 100}%` }}
              />
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!canImport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brass text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {progress !== null ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {progress !== null
              ? `Nahrávám… ${progress.toLocaleString("cs-CZ")}`
              : "Nahrát do databáze"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-text-mid">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
