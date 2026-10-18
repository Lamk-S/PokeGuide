"use client";
import {
  useActiveTab,
  useOptimizerResults,
  useOptimizerErrors,
  useOptimizerStatus,
} from "../store/useOptimizerStore";

export function OptimizationResultCard() {
  const activeTab = useActiveTab();
  const results = useOptimizerResults();
  const errors = useOptimizerErrors();
  const status = useOptimizerStatus();
  const error = errors[activeTab];
  const isCalculating = status[activeTab] === "Calculating";

  if (error)
    return (
      <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          Error
        </p>
        <p className="mt-2 text-[13px] text-zinc-700">{error}</p>
      </div>
    );
  if (isCalculating)
    return (
      <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          Calculando...
        </p>
        <div className="mt-4 h-px w-full animate-pulse bg-[#E5E2DA]" />
      </div>
    );

  if (activeTab === "speed") {
    const r = results.speed;
    if (!r)
      return (
        <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Resultado optimo
          </p>
          <p className="mt-3 text-[12px] text-zinc-500">Falta objetivo</p>
        </div>
      );
    return (
      <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-5">
        <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
          Resultado optimo
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#E5E2DA] pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Ev optimo
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#111]">
              {r.solution ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Alcanzada
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#111]">
              {r.achievedStat ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Objetivo
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-zinc-400">
              {r.target}
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-[#E5E2DA] pt-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Prueba de optimalidad
          </p>
          <div className="mt-2 space-y-1">
            {r.explanation?.evidence.slice(0, 3).map((ev: string) => (
              <p key={ev} className="font-mono text-[11px] text-zinc-600">
                {ev}
              </p>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-zinc-600">
            {r.explanation?.summary}
          </p>
        </div>
      </div>
    );
  }
  if (activeTab === "damage") {
    const r = results.damage;
    if (!r)
      return (
        <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Resultado optimo
          </p>
        </div>
      );
    return (
      <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-5">
        <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
          Resultado optimo
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#E5E2DA] pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Ev optimo
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#111]">
              {r.solution ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Alcanzado
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#111]">
              {r.achievedPercent?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Objetivo
            </p>
            <p className="mt-1 text-[20px] font-semibold tabular-nums text-zinc-400">
              {r.target}%
            </p>
          </div>
        </div>
      </div>
    );
  }
  const r = results.survival;
  if (!r)
    return (
      <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-6 text-center">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          Resultado optimo
        </p>
      </div>
    );
  return (
    <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-5">
      <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
        Resultado optimo
      </p>
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#E5E2DA] pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Ev totales
          </p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#111]">
            {r.totalEVs ?? "—"}
          </p>
        </div>
      </div>
      <div className="mt-4 border-t border-[#E5E2DA] pt-4">
        <div className="mt-2 space-y-1">
          {r.explanation?.evidence.slice(0, 3).map((ev: string) => (
            <p key={ev} className="font-mono text-[11px] text-zinc-600">
              {ev}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
