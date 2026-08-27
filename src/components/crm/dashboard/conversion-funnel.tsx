"use client";

import { useState, useTransition } from "react";
import { getConversionFunnel, type ConversionFunnelData } from "@/app/actions/crm/charts";

interface Props {
  initialData: ConversionFunnelData;
}

export default function ConversionFunnel({ initialData }: Props) {
  const [data, setData] = useState<ConversionFunnelData>(initialData);
  const [source, setSource] = useState<string>("");
  const [brokerId, setBrokerId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleSourceChange(value: string) {
    setSource(value);
    startTransition(async () => {
      const result = await getConversionFunnel({
        source: value || undefined,
        brokerId: brokerId || undefined,
      });
      if (result) setData(result);
    });
  }

  function handleBrokerChange(value: string) {
    setBrokerId(value);
    startTransition(async () => {
      const result = await getConversionFunnel({
        source: source || undefined,
        brokerId: value || undefined,
      });
      if (result) setData(result);
    });
  }

  const poolCount = data.stages[0]?.count ?? 0;

  return (
    <div className="bg-surface rounded-[16px] border border-border p-4 md:p-6 transition-colors duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="font-display text-sm md:text-base font-bold text-text">
          Konverzní funnel
        </h3>
        <div className="flex gap-2 flex-wrap">
          <select
            value={source}
            onChange={(e) => handleSourceChange(e.target.value)}
            disabled={isPending}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface text-text-mid focus:outline-none focus:border-sapphire disabled:opacity-50"
          >
            <option value="">Všechny zdroje</option>
            {data.availableSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={brokerId}
            onChange={(e) => handleBrokerChange(e.target.value)}
            disabled={isPending}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface text-text-mid focus:outline-none focus:border-sapphire disabled:opacity-50"
          >
            <option value="">Všichni brokeři</option>
            {data.availableBrokers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {poolCount === 0 ? (
        <p className="text-sm text-text-dim text-center py-6">Žádná data</p>
      ) : (
        <div className="space-y-2.5">
          {data.stages.map((stage) => {
            const widthPct = Math.max((stage.count / poolCount) * 100, stage.count > 0 ? 3 : 0);
            return (
              <div key={stage.key}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-text-mid w-32 shrink-0 truncate">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-5 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text w-8 text-right shrink-0">
                    {stage.count}
                  </span>
                </div>
                {stage.key !== "POOL" && (
                  <p className="text-[10px] text-text-dim pl-[140px]">
                    {stage.pctFromPrev}% z předchozího · {stage.pctFromPool}% z poolu
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[11px] text-text-dim">
          Mrtvé větve:{" "}
          {data.dead.map((d, i) => (
            <span key={d.key}>
              {i > 0 && " · "}
              {d.label} <span className="font-medium text-text-mid">{d.count}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
