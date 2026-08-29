"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import type { CallingLead, CallingProgress } from "@/app/actions/crm/calling";
import { getNextLeadToCall, getCallingProgress } from "@/app/actions/crm/calling";
import { logCall } from "@/app/actions/crm/calls";
import { CALL_OUTCOMES } from "@/lib/crm/call-outcomes";
import { COLORS } from "@/lib/crm/constants";
import ProgressHeader from "./progress-header";
import LeadCard from "./lead-card";
import OutcomeButtons from "./outcome-buttons";
import EmptyDone from "./empty-done";

interface CallingFocusModeProps {
  initialLead: CallingLead | null;
  initialProgress: CallingProgress;
}

export default function CallingFocusMode({
  initialLead,
  initialProgress,
}: CallingFocusModeProps) {
  const [currentLead, setCurrentLead] = useState<CallingLead | null>(initialLead);
  const [progress, setProgress] = useState<CallingProgress>(initialProgress);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [callbackAt, setCallbackAt] = useState("");
  const [isPending, startTransition] = useTransition();
  const callbackInputRef = useRef<HTMLInputElement>(null);

  const requiresDate = selectedOutcome
    ? CALL_OUTCOMES.find((o) => o.code === selectedOutcome) as { requiresDate?: boolean } | undefined
    : undefined;
  const needsDate = requiresDate?.requiresDate ?? false;

  async function refreshState(excludeIds: string[]) {
    const [next, prog] = await Promise.all([
      getNextLeadToCall(excludeIds),
      getCallingProgress(),
    ]);
    setCurrentLead(next);
    setProgress(prog);
    setSelectedOutcome(null);
    setCallbackAt("");
  }

  function handleOutcomeSelect(code: string) {
    const meta = CALL_OUTCOMES.find((o) => o.code === code) as { requiresDate?: boolean } | undefined;
    if (meta && (meta as { requiresDate?: boolean }).requiresDate) {
      setSelectedOutcome(code);
      setCallbackAt("");
      setTimeout(() => callbackInputRef.current?.focus(), 50);
    } else {
      setSelectedOutcome(code);
      handleSubmit(code, undefined);
    }
  }

  function handleSubmit(outcome: string, cbAt: string | undefined) {
    if (!currentLead) return;
    startTransition(async () => {
      await logCall({
        clientId: currentLead.id,
        outcome,
        callbackAt: cbAt || undefined,
      });
      const excluded = Array.from(skippedIds);
      await refreshState(excluded);
    });
  }

  function handleCallbackSubmit() {
    if (!selectedOutcome || !callbackAt) return;
    handleSubmit(selectedOutcome, callbackAt);
  }

  function handleSkip() {
    if (!currentLead) return;
    const next = new Set(skippedIds);
    next.add(currentLead.id);
    setSkippedIds(next);
    setSelectedOutcome(null);
    setCallbackAt("");
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

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= CALL_OUTCOMES.length) {
        e.preventDefault();
        handleOutcomeSelect(CALL_OUTCOMES[num - 1].code);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentLead, isPending, skippedIds, selectedOutcome]);

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

        <div
          className="mx-4 mb-4 rounded-2xl border overflow-hidden"
          style={{ borderColor: COLORS.border, background: COLORS.surface }}
        >
          <OutcomeButtons
            onSelect={handleOutcomeSelect}
            selectedOutcome={selectedOutcome}
            disabled={isPending}
          />

          {needsDate && selectedOutcome && (
            <div
              className="px-4 pb-4 flex flex-col gap-2 border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.textMid }}
              >
                {selectedOutcome === "SCHUZKA" ? "Datum a čas schůzky" : "Zavolat zpět"}
              </label>
              <div className="flex gap-2">
                <input
                  ref={callbackInputRef}
                  type="datetime-local"
                  value={callbackAt}
                  onChange={(e) => setCallbackAt(e.target.value)}
                  className="flex-1 px-3 py-2 border text-sm outline-none focus:ring-2"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.text,
                    background: COLORS.bg,
                  }}
                />
                <button
                  onClick={handleCallbackSubmit}
                  disabled={!callbackAt || isPending}
                  className="px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: COLORS.gold }}
                >
                  Potvrdit
                </button>
              </div>
            </div>
          )}
        </div>

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
