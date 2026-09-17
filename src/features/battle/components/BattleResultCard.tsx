"use client";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import { AlertCircle, Target } from "lucide-react";

interface BattleResultCardProps {
  result: BattleResult;
  attackerName?: string;
  defenderName?: string;
  moveName?: string;
}

export function BattleResultCard({
  result,
  attackerName = "Atacante",
  defenderName = "Defensor",
  moveName = "Movimiento",
}: BattleResultCardProps) {
  const { minDamage, maxDamage, minPercent, maxPercent } = result.damage;

  const safeMinPercent = Number.isFinite(minPercent) ? minPercent : 0;
  const safeMaxPercent = Number.isFinite(maxPercent) ? maxPercent : 0;
  const barWidth = Math.min(100, Math.max(0, safeMaxPercent));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Target className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Resumen de Daño
        </h3>
      </div>

      <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-1.5">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">
          {attackerName}
        </span>
        <span>usa</span>
        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-bold">
          {moveName}
        </span>
        <span>contra</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-100">
          {defenderName}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">
          {minDamage} - {maxDamage}
        </span>
        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          HP
        </span>
        <span className="text-lg text-red-600 dark:text-red-400 font-bold ml-2">
          ({safeMinPercent.toFixed(1)}% - {safeMaxPercent.toFixed(1)}%)
        </span>
      </div>

      <div className="mb-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-full bg-linear-to-r from-red-500 to-red-600 transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
          role="progressbar"
          aria-valuenow={safeMaxPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
        {result.explanation.summary}
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <AlertCircle
          className={`w-5 h-5 shrink-0 ${result.koAnalysis.guaranteed ? "text-green-600" : "text-amber-500"}`}
        />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {result.koAnalysis.guaranteed
            ? "¡KO Garantizado!"
            : "Posibilidad de KO:"}
          <span
            className={`ml-1.5 font-bold ${result.koAnalysis.guaranteed ? "text-green-700 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
          >
            {result.koAnalysis.hitsToKO}HKO ({result.koAnalysis.probability}%)
          </span>
        </p>
      </div>

      {result.explanation.factors.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Modificadores Aplicados
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            {result.explanation.factors.map((factor) => (
              <li
                key={`${factor.label}-${factor.description}`}
                className="flex items-center text-sm"
              >
                <span className="font-mono font-bold w-12 text-zinc-700 dark:text-zinc-300">
                  ×{factor.multiplier.toFixed(2).replace(".00", "")}
                </span>
                <span
                  className="text-zinc-600 dark:text-zinc-400 truncate"
                  title={factor.description}
                >
                  {factor.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
