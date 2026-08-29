"use client";

import { useState, useCallback, useEffect } from "react";
import { UserPlus, List, Columns3 } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import ClientsFilters from "./clients-filters";
import ClientsTable from "./clients-table";
import ClientsCards from "./clients-cards";
import ClientsEmpty from "./clients-empty";
import ClientDrawer from "./client-drawer";
import ClientForm from "./client-form";
import PipelineBoard from "./pipeline-board";
import BulkActionBar from "./bulk-action-bar";

export interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;
  lastCallOutcome: string;
  isInvestor: boolean;
  totalDeposit: number;
  totalProfit: number;
  brokerName: string;
  brokerId: string;
  stage: string;
  score: string;
}

interface ClientsPageClientProps {
  clients: ClientRow[];
  brokers: { id: string; name: string }[];
  isBroker: boolean;
  userRole: "administrator" | "supervisor" | "broker";
  totalCount: number;
  hasFilters: boolean;
  outcomeCounts?: Record<string, number>;
  currentOutcome?: string;
  isPoolView?: boolean;
  currentPage?: number;
  pageSize?: number;
}

export default function ClientsPageClient({
  clients,
  brokers,
  isBroker,
  userRole,
  totalCount,
  hasFilters,
  outcomeCounts,
  currentOutcome,
  isPoolView,
  currentPage = 1,
  pageSize = 200,
}: ClientsPageClientProps) {
  // Read ?open=<id> on mount AND react to URL changes so links from
  // dashboard / notifications open the drawer even when already on /clients
  const initialOpen =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("open")
      : null;
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    initialOpen
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    function syncFromUrl() {
      const id = new URLSearchParams(window.location.search).get("open");
      setSelectedClientId(id);
    }
    window.addEventListener("popstate", syncFromUrl);
    // Next.js does soft navigation via history.pushState — watch that too
    const orig = window.history.pushState;
    window.history.pushState = function (...args) {
      const r = orig.apply(this, args);
      window.dispatchEvent(new Event("popstate"));
      return r;
    };
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.history.pushState = orig;
    };
  }, []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const canBulk = userRole !== "broker";

  function handleClientClick(id: string) {
    if (selectMode) {
      toggleSelect(id);
    } else {
      setSelectedClientId(id);
    }
  }

  function handleCreateSuccess() {
    // revalidatePath in server action handles refresh
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Exit select mode if nothing selected
      if (next.size === 0) setSelectMode(false);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
      setSelectMode(false);
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
      setSelectMode(true);
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  const handleEnterSelectMode = useCallback(
    (id: string) => {
      setSelectMode(true);
      setSelectedIds(new Set([id]));
    },
    []
  );

  function handleBulkDone() {
    clearSelection();
    // Page will refresh via revalidatePath
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            {isPoolView ? "Databáze" : "Klienti"}
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {isPoolView ? (
              <>
                Celkem{" "}
                <strong className="text-text">
                  {totalCount.toLocaleString("cs-CZ")}
                </strong>{" "}
                leadů · strana {currentPage}/
                {Math.max(1, Math.ceil(totalCount / pageSize))} · zobrazeno{" "}
                {clients.length}
              </>
            ) : (
              <>
                {totalCount.toLocaleString("cs-CZ")}{" "}
                {totalCount === 1
                  ? "klient"
                  : totalCount < 5
                    ? "klienti"
                    : "klientů"}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center w-11 h-11 md:w-9 md:h-9 transition-colors",
                view === "list" ? "bg-gold text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              )}
              aria-label="Seznam"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView("pipeline")}
              className={cn(
                "flex items-center justify-center w-11 h-11 md:w-9 md:h-9 transition-colors",
                view === "pipeline" ? "bg-gold text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              )}
              aria-label="Pipeline"
            >
              <Columns3 size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brass text-white text-sm font-semibold"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Pridat klienta</span>
          </button>
        </div>
      </div>

      {/* Filters (list view only) */}
      {view === "list" && (
        <ClientsFilters
          brokers={brokers}
          isBroker={isBroker}
          outcomeCounts={outcomeCounts}
          totalCount={totalCount}
          currentOutcome={currentOutcome}
        />
      )}

      {/* Content */}
      {view === "pipeline" ? (
        <PipelineBoard
          clients={clients.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            stage: c.stage,
            score: c.score as "A" | "B" | "C" | "D",
            totalDeposit: c.totalDeposit,
            brokerName: c.brokerName,
          }))}
          onSelectClient={handleClientClick}
        />
      ) : clients.length === 0 ? (
        <ClientsEmpty hasFilters={hasFilters} />
      ) : (
        <>
          <ClientsTable
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            showCheckboxes={canBulk}
          />
          <ClientsCards
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            selectMode={selectMode}
            onEnterSelectMode={handleEnterSelectMode}
            showCheckboxes={canBulk}
          />
        </>
      )}

      {/* Bulk action bar */}
      {canBulk && selectedIds.size > 0 && (
        <BulkActionBar
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
          onDone={handleBulkDone}
          brokers={brokers}
          userRole={userRole}
        />
      )}

      {/* Pagination (pool view only) */}
      {isPoolView && totalCount > pageSize && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / pageSize)}
        />
      )}

      {/* Client Drawer */}
      <ClientDrawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        brokers={brokers}
        isBroker={isBroker}
        userRole={userRole}
      />

      {/* Create Client Form */}
      <ClientForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
        brokers={brokers}
        isBroker={isBroker}
      />
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  function buildHref(p: number): string {
    if (typeof window === "undefined") return `?page=${p}`;
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  // Render: First | Prev | 1 2 3 ... currentPage ... N-1 N | Next | Last
  const pages: (number | "…")[] = [];
  const range = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - range && i <= currentPage + range)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap pt-2">
      <a
        href={buildHref(1)}
        className={`px-3 py-2 text-xs font-medium ${
          currentPage === 1
            ? "pointer-events-none opacity-40 bg-surface border border-border"
            : "bg-surface border border-border text-text-mid hover:bg-surface-hover hover:text-text"
        }`}
      >
        ⏮
      </a>
      <a
        href={buildHref(Math.max(1, currentPage - 1))}
        className={`px-3 py-2 text-xs font-medium ${
          currentPage === 1
            ? "pointer-events-none opacity-40 bg-surface border border-border"
            : "bg-surface border border-border text-text-mid hover:bg-surface-hover hover:text-text"
        }`}
      >
        ←
      </a>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span
            key={`gap-${idx}`}
            className="px-2 text-text-dim text-xs select-none"
          >
            …
          </span>
        ) : (
          <a
            key={p}
            href={buildHref(p)}
            className={`px-3 py-2 min-w-[36px] text-center text-xs font-medium ${
              p === currentPage
                ? "bg-gold text-white"
                : "bg-surface border border-border text-text-mid hover:bg-surface-hover hover:text-text"
            }`}
          >
            {p}
          </a>
        )
      )}
      <a
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={`px-3 py-2 text-xs font-medium ${
          currentPage === totalPages
            ? "pointer-events-none opacity-40 bg-surface border border-border"
            : "bg-surface border border-border text-text-mid hover:bg-surface-hover hover:text-text"
        }`}
      >
        →
      </a>
      <a
        href={buildHref(totalPages)}
        className={`px-3 py-2 text-xs font-medium ${
          currentPage === totalPages
            ? "pointer-events-none opacity-40 bg-surface border border-border"
            : "bg-surface border border-border text-text-mid hover:bg-surface-hover hover:text-text"
        }`}
      >
        ⏭
      </a>
    </div>
  );
}
