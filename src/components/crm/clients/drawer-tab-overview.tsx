"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  CalendarDays,
  CreditCard,
  Pencil,
  Trash2,
  MapPin,
  ShieldAlert,
  Banknote,
  CalendarCheck,
} from "lucide-react";
import { fmtDate, fmtCZK } from "@/lib/crm/utils";
import CallOutcomeModal from "./call-outcome-modal";
import { getOutcomeMeta } from "@/lib/crm/call-outcomes";
import CallOutcomeBadge from "./call-outcome-badge";
import type { ClientDetail } from "@/app/actions/crm/clients";

interface DrawerTabOverviewProps {
  client: ClientDetail;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh?: () => void;
}

const META_LABELS: Record<string, string> = {
  // public
  phone_alt: "Další telefon",
  tagy: "Tagy",
  cilova_skupina: "Cílová skupina",
  zajmy: "Zájmy",
  majetek: "Majetek",
  titul_pred: "Titul",
  adresa_kontaktni_cp: "Kontaktní adresa",
  adresa_kontaktni_psc: "Kontaktní PSČ",
  okres: "Okres",
  pohlavi: "Pohlaví",
  bydleni: "Bydlení",
  vzdelani: "Vzdělání",
  vzdelani_obor: "Obor",
  rodiny_stav: "Rodinný stav",
  deti: "Děti",
  ico: "IČO",
  firma: "Firma",
  funkce: "Funkce",
  obrat: "Obrat firmy",
  zamestnavatel: "Zaměstnavatel",
  zamestnavatel_adresa: "Adresa zaměstnavatele",
  pozice: "Pozice",
  nastup: "Nástup",
  pracovni_stav: "Pracovní stav",
  spolurucitel: "Spoluručitel",
  ucel_uveru: "Účel úvěru",
  doba_splaceni: "Doba splácení",
  uver_problemy: "Problémy s úvěrem",
  uver_vyplatit: "Úvěr vyplatit",
  financni_plan: "Finanční plán",
  vydaje: "Výdaje",
  zajisteni: "Zajištění",
  nemovitost: "Nemovitost",
  adresa_nemovitosti: "Adresa nemovitosti",
  zastavitelna: "Zastavitelná",
  zastavena: "Zastavená",
  // sensitive
  rodne_cislo: "Rodné číslo",
  cislo_op: "Číslo OP",
  cislo_uctu: "Číslo účtu",
  kod_banky: "Kód banky",
  prijem_prokazatelny: "Příjem prokazatelný",
  prijem_ostatni: "Příjem ostatní",
  vyse_uveru: "Výše úvěru",
  vyse_splatek: "Výše splátek",
  zavazky: "Závazky",
  zavazky_pocet: "Počet závazků",
  zavazky_celkem: "Závazky celkem",
  zavazky_splatka: "Splátka závazků",
  vyse_exekuce: "Výše exekuce",
  exekuce: "Exekuce",
  registr: "V registru",
  zaloba: "Žaloba",
  vymahani: "Vymáhání",
  hodnota_zastavy: "Hodnota zástavy",
  hodnota_nemovitosti: "Hodnota nemovitosti",
  zamestnavatel_ico: "IČO zaměstnavatele",
  obor_zamestnani: "Obor zaměstnání",
};

function labelFor(key: string): string {
  return META_LABELS[key] ?? key.replace(/_/g, " ");
}

export default function DrawerTabOverview({
  client,
  onEdit,
  onDelete,
  onRefresh,
}: DrawerTabOverviewProps) {
  const [callOpen, setCallOpen] = useState(false);
  const hasAddress = client.street || client.city || client.zip;
  const publicEntries = Object.entries(client.metadataPublic);
  const sensitiveEntries = Object.entries(client.metadataSensitive);
  const lastOutcome = client.lastCallOutcome
    ? getOutcomeMeta(client.lastCallOutcome)
    : null;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Contact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard
          icon={<Phone size={14} className="text-text-dim" />}
          label="Telefon"
          value={client.phone}
        />
        <InfoCard
          icon={<Mail size={14} className="text-text-dim" />}
          label="Email"
          value={client.email || "—"}
        />
        <InfoCard
          icon={<CalendarDays size={14} className="text-text-dim" />}
          label="Datum hovoru"
          value={fmtDate(client.callDate) || "—"}
        />
        <InfoCard
          icon={<CreditCard size={14} className="text-text-dim" />}
          label="Příští platba"
          value={fmtDate(client.nextPaymentDate) || "—"}
        />
        {client.investmentAmount > 0 && (
          <InfoCard
            icon={<Banknote size={14} className="text-text-dim" />}
            label="Plánovaný vklad"
            value={fmtCZK(client.investmentAmount)}
          />
        )}
        {client.paymentReceivedDate && (
          <InfoCard
            icon={<CalendarCheck size={14} className="text-text-dim" />}
            label="Platba připsána"
            value={fmtDate(client.paymentReceivedDate)}
          />
        )}
      </div>

      {/* Address */}
      {hasAddress && (
        <div className=" border border-border bg-surface-hover p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={14} className="text-text-dim" />
            <span className="text-[10px] uppercase tracking-wider text-text-dim">
              Adresa
            </span>
          </div>
          <p className="text-sm text-text">
            {[client.street, client.city, client.zip]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}

      {/* Note */}
      <div className=" border-2 border-gold-border bg-gold-pale p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-mid uppercase tracking-wider">
            Poznámka
          </span>
          <button
            onClick={onEdit}
            className="text-text-dim hover:text-gold transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className="text-sm text-text leading-relaxed">
          {client.note || "Žádná poznámka"}
        </p>
      </div>

      {/* Public extra metadata (visible to all roles) */}
      {publicEntries.length > 0 && (
        <MetadataSection
          title="Doplňující info"
          entries={publicEntries}
          tone="neutral"
        />
      )}

      {/* Sensitive metadata — server returns empty for brokers */}
      {sensitiveEntries.length > 0 && (
        <MetadataSection
          title="Citlivé údaje (admin / supervisor)"
          entries={sensitiveEntries}
          tone="warning"
        />
      )}

      {/* Po hovoru — primary CTA for call-center workflow */}
      {client.dnc ? (
        <div className=" border-2 border-ruby-border bg-ruby-pale p-4 flex items-center gap-2">
          <span className="text-lg">🚫</span>
          <div>
            <p className="text-sm font-semibold text-ruby">
              Klient v Do-Not-Call listu
            </p>
            <p className="text-[11px] text-ruby/70">
              Tento klient si nepřeje další kontakt. Nevolat.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCallOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brass text-white text-sm font-semibold"
        >
          <Phone size={14} />
          Po hovoru — zaznamenat výsledek
        </button>
      )}

      {lastOutcome && (
        <div className="flex items-center justify-center gap-2 -mt-2">
          <CallOutcomeBadge outcome={client.lastCallOutcome} />
          {client.lastCalledAt && (
            <span className="text-[11px] text-text-dim">
              {fmtDate(client.lastCalledAt)}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-sm font-medium text-text-mid hover:text-text hover:bg-surface-hover transition-colors"
        >
          <Pencil size={14} />
          Upravit klienta
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-ruby-border text-sm font-medium text-ruby hover:bg-ruby-pale transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <CallOutcomeModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        onSuccess={onRefresh}
        clientId={client.id}
        clientName={`${client.firstName} ${client.lastName}`}
      />
    </div>
  );
}

function MetadataSection({
  title,
  entries,
  tone,
}: {
  title: string;
  entries: [string, string][];
  tone: "neutral" | "warning";
}) {
  const isWarn = tone === "warning";
  return (
    <div
      className={
        isWarn
          ? " border border-ruby-border bg-ruby-pale p-4"
          : " border border-border bg-surface-hover p-4"
      }
    >
      <div className="flex items-center gap-1.5 mb-3">
        {isWarn && <ShieldAlert size={14} className="text-ruby" />}
        <span
          className={
            isWarn
              ? "text-[10px] uppercase tracking-wider text-ruby font-medium"
              : "text-[10px] uppercase tracking-wider text-text-dim"
          }
        >
          {title}
        </span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-[10px] uppercase tracking-wider text-text-dim">
              {labelFor(k)}
            </dt>
            <dd className="text-text break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-hover p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-text-dim">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-text truncate">{value}</p>
    </div>
  );
}
