"use client";
import {
  useSpeedResult,
  useSurvivalResult,
  useActiveTab,
  useOptimizerError,
} from "../store/useOptimizerStore";

export function OptimizationResultCard() {
  const activeTab = useActiveTab();
  const speedResult = useSpeedResult();
  const survivalResult = useSurvivalResult();
  const error = useOptimizerError();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (activeTab === "speed") {
    if (!speedResult)
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-[#F8F5F0] p-8 text-center">
          <p className="text-sm text-zinc-500">
            Define objetivo y ejecuta optimización
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Búsqueda binaria O(log N) • máx 6 iteraciones
          </p>
        </div>
      );
    const isOptimal = speedResult.status === "Optimal";
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">
            Resultado Velocidad
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums border ${isOptimal ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            {speedResult.status} • {speedResult.metrics.candidatesEvaluated}{" "}
            evals
          </span>
        </div>
        {isOptimal && speedResult.solution !== null ? (
          <>
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-zinc-900 p-4 text-white">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                  EV Óptimo
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {speedResult.solution}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                  Speed Lograda
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {speedResult.achievedStat}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                  Objetivo
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {speedResult.target}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[#EDE8E0] bg-[#F8F5F0] p-3">
              <p className="text-xs font-medium text-zinc-700">
                Prueba matemática
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs tabular-nums">
                {speedResult.explanation?.evidence.map((ev) => (
                  <div
                    key={ev}
                    className={
                      ev.includes("✅") ? "text-emerald-700" : "text-zinc-500"
                    }
                  >
                    {ev}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
                {speedResult.explanation?.summary}
              </p>
            </div>
            <div className="mt-3 flex gap-2 text-[11px] tabular-nums text-zinc-500">
              <span>Iter: {speedResult.metrics.iterations}</span>
              <span>•</span>
              <span>{speedResult.metrics.executionTimeMs?.toFixed(2)}ms</span>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {speedResult.explanation?.summary}
          </div>
        )}
      </div>
    );
  }

  if (!survivalResult)
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-[#F8F5F0] p-8 text-center">
        <p className="text-sm text-zinc-500">Configura amenaza y optimiza</p>
        <p className="mt-1 text-xs text-zinc-400">
          Branch & Bound + Binary Search • poda agresiva
        </p>
      </div>
    );
  const isOptimal = survivalResult.status === "Optimal";
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">
          Resultado Supervivencia
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums border ${isOptimal ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {survivalResult.status} • {survivalResult.metrics.candidatesEvaluated}{" "}
          ramas
        </span>
      </div>
      {isOptimal && survivalResult.solution ? (
        <>
          <div className="grid grid-cols-3 gap-3 rounded-lg bg-zinc-900 p-4 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                HP EV
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {survivalResult.solution.hp}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                {survivalResult.solution.defense !== undefined
                  ? "Def EV"
                  : "SpD EV"}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {survivalResult.solution.defense ??
                  survivalResult.solution.specialDefense}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {survivalResult.totalEVs}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-[#EDE8E0] bg-[#F8F5F0] p-3">
            <p className="text-xs font-medium text-zinc-700">Explicación</p>
            <div className="mt-2 space-y-1 text-xs tabular-nums text-zinc-600">
              {survivalResult.explanation?.evidence.map((e) => (
                <div key={e}>{e}</div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
              {survivalResult.explanation?.summary}
            </p>
          </div>
          <div className="mt-3 flex gap-3 text-[11px] tabular-nums text-zinc-500">
            <span>Ramas: {survivalResult.metrics.candidatesEvaluated}</span>
            <span>Podadas: {survivalResult.metrics.prunedBranches}</span>
            <span>{survivalResult.metrics.executionTimeMs?.toFixed(2)}ms</span>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {survivalResult.explanation?.summary}
        </div>
      )}
    </div>
  );
}
