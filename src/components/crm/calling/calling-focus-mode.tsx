"use client";

import { useState, useEffect, useTransition } from "react";
import type { CallingLead, CallingProgress, HandoverBroker } from "@/app/actions/crm/calling";
import { getNextLeadToCall, getCallingProgress } from "@/app/actions/crm/calling";
import HandoverPanel from "./handover-panel";
import { COLORS } from "@/lib/crm/constants";
import ProgressHeader from "./progress-header";
import LeadCard from "./lead-card";
import QuickCallPanel from "./quick-call-panel";
import EmptyDone from "./empty-done";

interface CallingFocusModeProps {
  initialLead: CallingLead | null;
  initialProgress: CallingProgress;
  /** Operators only — brokers the lead can be handed over to */
  handoverBrokers?: HandoverBroker[] | null;
}

export default function CallingFocusMode({
  initialLead,
  initialProgress,
  handoverBrokers = null,
}: CallingFocusModeProps) {
  const [currentLead, setCurrentLead] = useState<CallingLead | null>(initialLead);
  const [progress, setProgress] = useState<CallingProgress>(initialProgress);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  async function refreshState(excludeIds: string[]) {
    const [next, prog] = await Promise.all([
      getNextLeadToCall(excludeIds),
      getCallingProgress(),
    ]);
    setCurrentLead(next);
    setProgress(prog);
  }

  function handleSkip() {
    if (!currentLead) return;
    const next = new Set(skippedIds);
    next.add(currentLead.id);
    setSkippedIds(next);
    startTransition(async () => {
      await refreshState(Array.from(next));
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!currentLead || isPending) return;

      if (e.key === " ") {
        e.preventDefault();
        window.location.href = `tel:${currentLead.phone}`;
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleSkip();
        return;
      }

    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!currentLead) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-64px)]">
        <ProgressHeader progress={progress} />
        <EmptyDone progress={progress} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)]">
      <ProgressHeader progress={progress} />

      <div
        className="flex-1 flex flex-col max-w-2xl mx-auto w-full"
      >
        <LeadCard lead={currentLead} />

        <div className="mx-4 mb-4">
          <QuickCallPanel
            key={currentLead.id}
            clientId={currentLead.id}
            onLogged={() => startTransition(async () => { await refreshState(Array.from(skippedIds)); })}
          />
        </div>

        {handoverBrokers && (
          <HandoverPanel
            key={currentLead.id}
            clientId={currentLead.id}
            brokers={handoverBrokers}
            disabled={isPending}
            onDone={() => startTransition(async () => { await refreshState(Array.from(skippedIds)); })}
          />
        )}

        <div className="px-4 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-bg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: COLORS.border,
              color: COLORS.textMid,
            }}
          >
            [N] Přeskočit
          </button>
          {isPending && (
            <span className="text-sm" style={{ color: COLORS.textDim }}>
              Ukládám…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
