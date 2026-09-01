"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Globe, BarChart3, Type, X, Save } from "lucide-react";
import {
  upsertEmission,
  deleteEmission,
  upsertStat,
  deleteStat,
  upsertContent,
  deleteContent,
} from "@/app/actions/crm/cms";

type Tab = "emissions" | "stats" | "content";

interface Emission {
  id: string;
  name: string;
  location: string;
  yieldPa: string;
  maturity: string;
  minEntry: string;
  active: boolean;
  sortOrder: number;
}

interface Stat {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
}

interface Content {
  key: string;
  value: string;
}

interface Props {
  emissions: Emission[];
  stats: Stat[];
  contents: Content[];
}

const TABS: { key: Tab; label: string; icon: typeof Globe }[] = [
  { key: "emissions", label: "Emise", icon: Globe },
  { key: "stats", label: "Čísla", icon: BarChart3 },
  { key: "content", label: "Texty", icon: Type },
];

export default function CmsPageClient({ emissions, stats, contents }: Props) {
  const [tab, setTab] = useState<Tab>("emissions");

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">
          Web (CMS)
        </h1>
        <p className="mt-0.5 text-sm text-text-mid">
          Správa obsahu veřejného webu
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-brass text-brass"
                  : "border-transparent text-text-mid hover:text-text"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "emissions" && <EmissionsTab emissions={emissions} />}
      {tab === "stats" && <StatsTab stats={stats} />}
      {tab === "content" && <ContentTab contents={contents} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Emissions Tab
// ---------------------------------------------------------------------------

function EmissionsTab({ emissions }: { emissions: Emission[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Partial<Emission> | null>(null);

  async function handleSave() {
    if (!editing?.name) return;
    const res = await upsertEmission({
      id: editing.id || undefined,
      name: editing.name,
      location: editing.location || "",
      yieldPa: editing.yieldPa || "",
      maturity: editing.maturity || "",
      minEntry: editing.minEntry || "",
      active: editing.active !== false,
      sortOrder: editing.sortOrder || 0,
    });
    if (res.success) {
      setEditing(null);
      startTransition(() => router.refresh());
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat emisi?")) return;
    await deleteEmission(id);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-mid">{emissions.length} emisí</p>
        <button
          onClick={() =>
            setEditing({ name: "", location: "", yieldPa: "", maturity: "", minEntry: "", active: true, sortOrder: emissions.length + 1 })
          }
          className="flex items-center gap-2 px-4 py-2 bg-brass text-white text-sm font-semibold"
        >
          <Plus size={15} />
          Přidat emisi
        </button>
      </div>

      {editing && (
        <EmissionForm
          data={editing}
          onChange={setEditing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="px-4 py-3 text-left font-medium text-text-mid">#</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Projekt</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Lokalita</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Výnos</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Splatnost</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Min. vstup</th>
              <th className="px-4 py-3 text-left font-medium text-text-mid">Aktivní</th>
              <th className="px-4 py-3 text-right font-medium text-text-mid">Akce</th>
            </tr>
          </thead>
          <tbody>
            {emissions.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50">
                <td className="px-4 py-3 text-text-dim">{e.sortOrder}</td>
                <td className="px-4 py-3 font-medium text-text">{e.name}</td>
                <td className="px-4 py-3 text-text-mid">{e.location}</td>
                <td className="px-4 py-3 text-text-mid">{e.yieldPa}</td>
                <td className="px-4 py-3 text-text-mid">{e.maturity}</td>
                <td className="px-4 py-3 text-text-mid">{e.minEntry}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${e.active ? "bg-emerald" : "bg-text-faint"}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditing(e)}
                      className="p-1.5 text-text-dim hover:text-brass transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={isPending}
                      className="p-1.5 text-text-dim hover:text-ruby transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmissionForm({
  data,
  onChange,
  onSave,
  onCancel,
}: {
  data: Partial<Emission>;
  onChange: (d: Partial<Emission>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white border border-brass/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">
          {data.id ? "Upravit emisi" : "Nová emise"}
        </h3>
        <button onClick={onCancel} className="text-text-dim hover:text-text">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <input
          placeholder="Název projektu"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="px-3 py-2 border border-border text-sm"
        />
        <input
          placeholder="Lokalita"
          value={data.location || ""}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          className="px-3 py-2 border border-border text-sm"
        />
        <input
          placeholder="Výnos p.a. (např. 9,0 %)"
          value={data.yieldPa || ""}
          onChange={(e) => onChange({ ...data, yieldPa: e.target.value })}
          className="px-3 py-2 border border-border text-sm"
        />
        <input
          placeholder="Splatnost (rok)"
          value={data.maturity || ""}
          onChange={(e) => onChange({ ...data, maturity: e.target.value })}
          className="px-3 py-2 border border-border text-sm"
        />
        <input
          placeholder="Min. vstup (např. 500 000 Kč)"
          value={data.minEntry || ""}
          onChange={(e) => onChange({ ...data, minEntry: e.target.value })}
          className="px-3 py-2 border border-border text-sm"
        />
        <input
          placeholder="Pořadí"
          type="number"
          value={data.sortOrder ?? 0}
          onChange={(e) => onChange({ ...data, sortOrder: parseInt(e.target.value) || 0 })}
          className="px-3 py-2 border border-border text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-text-mid">
          <input
            type="checkbox"
            checked={data.active !== false}
            onChange={(e) => onChange({ ...data, active: e.target.checked })}
          />
          Aktivní (zobrazit na webu)
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-text-mid border border-border hover:bg-surface-hover">
            Zrušit
          </button>
          <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-brass text-white">
            <Save size={14} />
            Uložit
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Tab
// ---------------------------------------------------------------------------

function StatsTab({ stats }: { stats: Stat[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Partial<Stat> | null>(null);

  async function handleSave() {
    if (!editing?.value || !editing?.label) return;
    const res = await upsertStat({
      id: editing.id || undefined,
      value: editing.value,
      label: editing.label,
      sortOrder: editing.sortOrder || 0,
    });
    if (res.success) {
      setEditing(null);
      startTransition(() => router.refresh());
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat statistiku?")) return;
    await deleteStat(id);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-mid">{stats.length} statistik</p>
        <button
          onClick={() => setEditing({ value: "", label: "", sortOrder: stats.length + 1 })}
          className="flex items-center gap-2 px-4 py-2 bg-brass text-white text-sm font-semibold"
        >
          <Plus size={15} />
          Přidat číslo
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-brass/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">
              {editing.id ? "Upravit" : "Nové číslo"}
            </h3>
            <button onClick={() => setEditing(null)} className="text-text-dim hover:text-text">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Hodnota (např. 350+)"
              value={editing.value || ""}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              className="px-3 py-2 border border-border text-sm"
            />
            <input
              placeholder="Popisek (např. DOKONČENÝCH PROJEKTŮ)"
              value={editing.label || ""}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              className="px-3 py-2 border border-border text-sm"
            />
            <input
              placeholder="Pořadí"
              type="number"
              value={editing.sortOrder ?? 0}
              onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border border-border text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-text-mid border border-border hover:bg-surface-hover">
              Zrušit
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-brass text-white">
              <Save size={14} />
              Uložit
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.id} className="bg-white border border-border p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-display font-bold text-text">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-text-dim mt-1">{s.label}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(s)} className="p-1.5 text-text-dim hover:text-brass">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={isPending} className="p-1.5 text-text-dim hover:text-ruby">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-text-faint mt-2">Pořadí: {s.sortOrder}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content Tab
// ---------------------------------------------------------------------------

function ContentTab({ contents }: { contents: Content[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<{ key: string; value: string; isNew?: boolean } | null>(null);

  async function handleSave() {
    if (!editing?.key) return;
    const res = await upsertContent(editing.key, editing.value);
    if (res.success) {
      setEditing(null);
      startTransition(() => router.refresh());
    }
  }

  async function handleDelete(key: string) {
    if (!confirm("Smazat text?")) return;
    await deleteContent(key);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-mid">{contents.length} textů</p>
        <button
          onClick={() => setEditing({ key: "", value: "", isNew: true })}
          className="flex items-center gap-2 px-4 py-2 bg-brass text-white text-sm font-semibold"
        >
          <Plus size={15} />
          Přidat text
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-brass/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">
              {editing.isNew ? "Nový text" : `Upravit: ${editing.key}`}
            </h3>
            <button onClick={() => setEditing(null)} className="text-text-dim hover:text-text">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Klíč (např. hero_title)"
              value={editing.key}
              onChange={(e) => setEditing({ ...editing, key: e.target.value })}
              disabled={!editing.isNew}
              className="w-full px-3 py-2 border border-border text-sm disabled:opacity-50"
            />
            <textarea
              placeholder="Obsah"
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-text-mid border border-border hover:bg-surface-hover">
              Zrušit
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-brass text-white">
              <Save size={14} />
              Uložit
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {contents.map((c) => (
          <div key={c.key} className="bg-white border border-border p-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono text-brass font-medium">{c.key}</div>
              <div className="text-sm text-text mt-1 whitespace-pre-wrap break-words">{c.value}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing({ key: c.key, value: c.value })} className="p-1.5 text-text-dim hover:text-brass">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(c.key)} disabled={isPending} className="p-1.5 text-text-dim hover:text-ruby">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {contents.length === 0 && (
          <div className="text-center py-12 text-text-dim text-sm">
            Zatím žádné texty. Přidejte první.
          </div>
        )}
      </div>
    </div>
  );
}
